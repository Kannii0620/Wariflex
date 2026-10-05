import { useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { usePaymentStore } from '../store';
import { calculateSplit, downloadSplitCsv } from '../lib/split';
import { BsTrash3Fill, BsDownload, BsClockHistory } from "react-icons/bs";

export default function History() {
  const { history, fetchPayments, deletePayment, clearHistory } = usePaymentStore();

  // このページを直接開いた（リロードした）場合でも履歴が出るように取得する
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = (id: string) => {
    if (confirm("この履歴を削除しますか？")) {
      deletePayment(id);
    }
  };

  const handleClearAll = () => {
    if (confirm("履歴をすべて削除しますか？この操作は取り消せません。")) {
      clearHistory();
    }
  };

  return (
    <PageLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BsClockHistory /> 精算履歴
          </h1>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-white font-bold border border-white/40 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
            >
              全削除
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-white/80">
            <p>履歴はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const splitResults = calculateSplit(item.totalAmount, item.participants);

              return (
                <div key={item.id} className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/20">

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="font-bold text-lg text-gray-800">{item.title}</h2>
                      <p className="text-xs text-gray-400">{item.date || '日付不明'}</p>
                      {item.message && (
                        <p className="text-sm text-gray-500 mt-1 bg-gray-100 p-1 px-2 rounded-md inline-block">
                          {item.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => downloadSplitCsv(item, "履歴")}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="CSVダウンロード"
                      >
                        <BsDownload />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                        title="削除"
                      >
                        <BsTrash3Fill />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-b border-gray-100 pb-3 mb-3">
                    <span className="text-sm text-gray-500">合計</span>
                    <span className="text-xl font-bold text-gray-800">
                      ¥{item.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {splitResults.map((p) => (
                      <div key={p.id} className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          {p.name}
                          <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                            {Math.round(p.percentage)}%
                          </span>
                        </span>
                        <span className="font-medium text-gray-800">
                          ¥{p.payAmount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
