import { useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { usePaymentStore } from '../store';
import { BsCheckCircleFill, BsXCircleFill, BsBellFill } from "react-icons/bs";

export default function Notifications() {
  const { notifications, fetchNotifications, respondToRequest } = usePaymentStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleApprove = async (id: string) => {
    if (confirm("この請求を承認しますか？")) {
      // 一覧からの除去は store の respondToRequest 側で行うので、ここでは再取得しない
      await respondToRequest(id, 'approved');
      alert("承認しました！");
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("本当に拒否しますか？")) {
      await respondToRequest(id, 'rejected');
    }
  };

  return (
    <PageLayout>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BsBellFill /> お知らせ ({notifications.length})
        </h2>

        {notifications.length === 0 ? (
          <div className="text-center py-10 text-blue-200">
            <p>新しいお知らせはありません</p>
            <p className="text-sm mt-2">平和な一日ですね🍵</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <div key={item.id} className="bg-white text-gray-800 rounded-xl p-4 shadow-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                    <h3 className="font-bold text-lg">{item.payment_title}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-blue-600">{item.payer_name}</span> さんからの請求
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-rose-600">
                      ¥{item.amount_to_pay.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleReject(item.id)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <BsXCircleFill /> 拒否
                  </button>
                  <button 
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors shadow-md"
                  >
                    <BsCheckCircleFill /> 承認
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
