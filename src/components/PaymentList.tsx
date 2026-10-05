import { useEffect } from 'react';
import { usePaymentStore } from '../store';
import { calculateSplit, downloadSplitCsv } from '../lib/split';
import { BsCheckCircleFill , BsDownload } from "react-icons/bs";

export default function PaymentList() {
  const { payments, loading, fetchPayments, moveToHistory } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
                    {payment.message && (
                      <p className="text-sm text-gray-500 mb-1">
                        {payment.message}
                      </p>
                    )}
                    <span className="font-bold text-xl text-emerald-600">
                      ¥{payment.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadSplitCsv(payment, "精算結果")}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2"
                      title="CSVでダウンロード"
                    >
                      <BsDownload size={24} />
                    </button>
                    <button
                      onClick={() => handleComplete(payment.id, payment.title)}
                      className="text-gray-400 hover:text-emerald-500 transition-colors p-2"
                      title="精算を完了する"
                    >
                      <BsCheckCircleFill size={24} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  {splitResults.map((p) => (
                    <div key={p.id} className="flex justify-between text-gray-700">
                      <span>{p.name} ({Math.round(p.percentage)}%)</span>
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
