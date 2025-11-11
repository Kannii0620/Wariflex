// 変更後（角丸・影・余白を追加）
import { AiFillHome } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

export default function BottomNav() {
  return (
    <nav className="bg-white/90 p-4 flex justify-around text-sm text-gray-900 rounded-2xl shadow-lg mt-2">
      
      {/* 現在アクティブなページ（例：ホーム）の文字を青くする */}
      <button className="flex flex-col items-center text-blue-600"> {/* ← text-blue-600 を追加 */}
        <AiFillHome size={24} />
        ホーム
      </button>
      <button className="flex flex-col items-center">
        <FaHistory size={24} />
        履歴
      </button>
      <button className="flex flex-col items-center">
        <IoMdNotifications size={24} />
        通知
      </button>
    </nav>
  );
}