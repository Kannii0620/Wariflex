import { useEffect } from 'react';
import { usePaymentStore } from '../store';
import { BsFillTrash3Fill } from "react-icons/bs";
import BottomNav from '../components/BottomNav'; // ← メニューバーを追加

// --- 計算ロジック ---
const calculateSplit = (total: number, participants: { name: string; percentage: number }[]) => {
  if (!participants || participants.length === 0) return [];
  let currentSum = 0;
  const tempResults = participants.map(p => {
    const amount = Math.floor(total * (p.percentage / 100));
    currentSum += amount;
    return { ...p, payAmount: amount };
  });
  let remainder = total - currentSum;
  return tempResults.map(p => {
    if (remainder > 0) { p.payAmount += 1; remainder--; }
    return p;
  });
};

export default function History() {
  const { history, loading, deletePayment, fetchPayments } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`履歴から「${title}」を完全に削除しますか？\n（この操作は取り消せません）`)) {
      await deletePayment(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4 flex justify-center items-center">
        <p className="text-white font-bold animate-pulse">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800">
      <div className="max-w-md mx-auto">
        <main className="p-4">
          
          <div className="bg-white/90 p-6 rounded-2xl shadow-lg text-gray-900 mb-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 border-gray-300">
              支払い履歴
            </h1>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                履歴はありません。
              </p>
            ) : (
                <ul className="space-y-6">
                {history.map((payment: { id: string; title: string; totalAmount: number; completedAt: string; participants: { name: string; percentage: number }[]; }) => {
                  const splitResults = calculateSplit(payment.totalAmount, payment.participants);

                  return (
                  <li key={payment.id} className="border-b border-gray-300 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-lg block">{payment.title}</span>
                      <span className="text-xs text-gray-500">
                      {payment.completedAt} 完了
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-gray-700 block">
                      ¥{payment.totalAmount.toLocaleString()}
                      </span>
                      <button 
                      onClick={() => handleDelete(payment.id, payment.title)}
                      className="text-gray-400 hover:text-red-500 text-sm mt-1 p-2"
                      title="完全に削除"
                      >
                      <BsFillTrash3Fill size={18} />
                      </button>
                    </div>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg text-sm space-y-1">
                    {splitResults.map((p: { name: string; percentage: number; payAmount: number }, index: number) => (
                      <div key={index} className="flex justify-between text-gray-600">
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

        </main>
        {/* ナビゲーションバーを追加 */}
        <BottomNav />
      </div>
    </div>
  );
}