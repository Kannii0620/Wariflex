import { useEffect } from 'react';
import { usePaymentStore } from '../store';
import type { Participant } from '../store';
import { BsCheckCircleFill , BsDownload } from "react-icons/bs";

const calculateSplit = (total: number, participants: Participant[] | undefined) => {
  if (!participants || participants.length === 0) return [];

  // ★追加: 現在のパーセントの合計値を計算 (例: 100.03)
  const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);

  // 1. 全員の金額を計算
  const rawData = participants.map(p => {
    const ratio = p.percentage / totalPercentage; 
    const rawVal = total * ratio;

    return {
      ...p,
      intVal: Math.floor(rawVal),          // 整数部分
      decimalPart: rawVal - Math.floor(rawVal) // 小数部分
    };
  });

  // 2. 整数部分の合計と、余りを計算
  const currentSum = rawData.reduce((acc, p) => acc + p.intVal, 0);
  let remainder = total - currentSum;

  // 3. 余りを配分（最大剰余方式）
  const sortedByDecimal = [...rawData].sort((a, b) => b.decimalPart - a.decimalPart);
  const bonusIds = new Set(sortedByDecimal.slice(0, remainder).map(p => p.id));

  // 4. 結果を返す
  return rawData.map(p => ({
    ...p,
    payAmount: p.intVal + (bonusIds.has(p.id) ? 1 : 0)
  }));
};

export default function PaymentList() {
  const { payments, loading, fetchPayments, moveToHistory } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleComplete = async (id: string, title: string) => {
    if (window.confirm(`${title} の精算を完了して、履歴に移動しますか？`)) {
      await moveToHistory(id);
    }
  };

  const handleDownloadCSV = (payment: any) => {
    const splitResults = calculateSplit(payment.totalAmount, payment.participants);
    const headers = ["参加者名", "割合(%)", "支払額(円)"];
    const rows = splitResults.map(p => 
      [p.name, p.percentage, p.payAmount].join(",")
    );
    const csvString = [headers.join(","), ...rows].join("\n");
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payment.title}_精算結果.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
                      onClick={() => handleDownloadCSV(payment)}
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
                      {/* ★ここを修正： Math.round() で整数表示にする */}
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