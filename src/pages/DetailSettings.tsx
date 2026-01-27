import { useEffect, useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { BsSearch, BsPersonPlusFill, BsTrash, BsPersonCheckFill } from "react-icons/bs";
import { usePaymentStore } from '../store';

export default function DetailSettings() {
  const { friends, fetchFriends, addFriend, deleteFriend } = usePaymentStore();
  const [searchId, setSearchId] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setMsg("検索中...");
    const result = await addFriend(searchId.trim());
    setMsg(result.message);
    if (result.success) setSearchId("");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 pb-24">
      <div className="max-w-md mx-auto p-4 text-white">
        <Header />

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl animate-fade-in-up">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BsPersonPlusFill /> メンバー管理
          </h2>

          {/* 検索・追加フォーム */}
          <form onSubmit={handleSearch} className="mb-8">
            <p className="text-sm text-blue-100 mb-2">友達のIDを入力して追加</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="user_xxxxxxx"
                className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:bg-white/30 transition-all"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors shadow-lg"
              >
                <BsSearch size={20} />
              </button>
            </div>
            {msg && <p className="text-sm mt-2 text-yellow-300 font-bold animate-pulse">{msg}</p>}
          </form>

          {/* 友達リスト */}
          <h3 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">登録済みメンバー</h3>
          
          <div className="space-y-3">
            {friends.length === 0 ? (
              <p className="text-center text-blue-200 py-4">まだメンバーがいません</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.friend_id} className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/50 p-2 rounded-full">
                      <BsPersonCheckFill size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{friend.display_name}</p>
                      <p className="text-xs text-blue-200">{friend.username}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => confirm("削除しますか？") && deleteFriend(friend.friend_id)}
                    className="text-white/40 hover:text-rose-400 transition-colors p-2"
                  >
                    <BsTrash size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  );
}