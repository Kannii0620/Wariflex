import { useEffect } from 'react'; // ← useEffect を追加
import { usePaymentStore } from '../store';
import type { Participant } from '../store';
import { BsCheckCircleFill , BsDownload } from "react-icons/bs";

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

  const handleDownloadCSV = (payment: any) => {
    // 1. 計算結果を取得
    const splitResults = calculateSplit(payment.totalAmount, payment.participants);

    // 2. CSVのデータを作成（ヘッダー + データ）
    const headers = ["参加者名", "割合(%)", "支払額(円)"];
    const rows = splitResults.map(p => 
      [p.name, p.percentage, p.payAmount].join(",")
    );
    const csvString = [headers.join(","), ...rows].join("\n");

    // 3. 文字化け防止（BOM）をつけてBlobを作る
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: "text/csv" });

    // 4. ダウンロードリンクを作って勝手にクリックする
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

                  <div className="flex gap-2"> {/* ← ボタンを横並びにするために div で囲むと綺麗です */}
                    
                    {/* ★追加：CSVダウンロードボタン */}
                    <button 
                      onClick={() => handleDownloadCSV(payment)}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2"
                      title="CSVでダウンロード"
                    >
                      <BsDownload size={24} />
                    </button>

                    {/* 既存の完了ボタン */}
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