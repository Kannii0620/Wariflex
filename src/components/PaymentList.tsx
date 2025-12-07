import { useEffect } from 'react'; // ← useEffect を追加
import { usePaymentStore } from '../store';
import type { Participant } from '../store';
import { BsCheckCircleFill } from "react-icons/bs";

// --- 計算ロジック ---
const calculateSplit = (total: number, participants: Participant[] | undefined) => {
  if (!participants || participants.length === 0) return [];

  let currentSum = 0;
  const tempResults = participants.map(p => {
    const amount = Math.floor(total * (p.percentage / 100));
    currentSum += amount;
    return { ...p, payAmount: amount };
  });

  let remainder = total - currentSum;
  
  const finalResults = tempResults.map(p => {
    if (remainder > 0) {
      p.payAmount += 1;
      remainder--;
    }
    return p;
  });

  return finalResults;
};

export default function PaymentList() {
  // ストアから必要なものを取り出す
  const { payments, loading, fetchPayments, moveToHistory } = usePaymentStore();

  // ★画面が表示されたらデータを読み込む
  useEffect(() => {
    fetchPayments();
  }, []);

  const handleComplete = async (id: string, title: string) => {
    if (window.confirm(`${title} の精算を完了して、履歴に移動しますか？`)) {
      await moveToHistory(id);
    }
  };

  if (loading) {
    return <div className="text-white text-center p-4">読み込み中...</div>;
  }

  return (
    <div className="bg-white/90 rounded-2xl shadow-lg p-6 text-gray-900">
      <h2 className="font-semibold mb-4 text-lg">＜未精算の支払いリスト＞</h2>
      
      {payments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          まだ登録された支払いはありません。
        </p>
      ) : (
        <ul className="space-y-4">
          {payments.map((payment) => {
            const splitResults = calculateSplit(payment.totalAmount, payment.participants);

            return (
              <li key={payment.id} className="border-b border-gray-200 pb-4 last:border-0 relative">
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-lg block">{payment.title}</span>
                    <span className="font-bold text-xl text-emerald-600">
                      ¥{payment.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleComplete(payment.id, payment.title)}
                    className="text-gray-400 hover:text-emerald-500 transition-colors p-2"
                    title="精算を完了する"
                  >
                    <BsCheckCircleFill size={24} />
                  </button>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  {splitResults.map((p) => (
                    <div key={p.id} className="flex justify-between text-gray-700">
                      <span>{p.name} ({p.percentage}%)</span>
                      <span className="font-medium">¥{p.payAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}