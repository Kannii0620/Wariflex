import { usePaymentStore } from '../store';
import type { Participant } from '../store'; // 型定義を import
import { BsCheckCircleFill } from "react-icons/bs"; // 完了ボタン用

// --- 計算ロジック (端数調整付き) ---
const calculateSplit = (total: number, participants: Participant[] | undefined) => {
  if (!participants || participants.length === 0) return [];

  let currentSum = 0;
  // 1. まず全員分を「切り捨て」で計算
  const tempResults = participants.map(p => {
    const amount = Math.floor(total * (p.percentage / 100));
    currentSum += amount;
    return { ...p, payAmount: amount };
  });

  // 2. 余りを計算 (例: 10000 - 9999 = 1円)
  let remainder = total - currentSum;
  
  // 3. 余りを上から順に1円ずつ配る
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
  const { payments, removePayment } = usePaymentStore();

  const handleComplete = (id: number, title: string) => {
    if (window.confirm(`${title} の精算を完了（削除）しますか？`)) {
      removePayment(id);
    }
  };

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
            // ここで計算を実行！
            const splitResults = calculateSplit(payment.totalAmount, payment.participants);

            return (
              <li key={payment.id} className="border-b border-gray-200 pb-4 last:border-0 relative">
                
                {/* 合計金額と完了ボタン */}
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

                {/* 内訳の表示 */}
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