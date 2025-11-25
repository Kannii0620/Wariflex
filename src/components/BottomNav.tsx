// src/components/BottomNav.tsx
import { AiFillHome } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { Link } from 'react-router-dom'; 

export default function BottomNav() {
  return (
    <nav className="bg-white/90 p-4 flex justify-around text-sm text-gray-900 rounded-2xl shadow-lg mt-2">
      
      {/* ホームボタンを Link に変更 to="/" */}
      <Link to="/" className="flex flex-col items-center text-blue-600"> {/* ← Link に変更し、to="/" を追加 */}
        <AiFillHome size={24} />
        ホーム
      </Link>
      {/* 履歴ボタンを Link に変更 to="/history" */}
      <Link to="/history" className="flex flex-col items-center"> {/* ← Link に変更し、to="/history" を追加 */}
        <FaHistory size={24} />
        履歴
      </Link>
      {/* 通知ボタンを Link に変更 to="/notifications" */}
      <Link to="/notifications" className="flex flex-col items-center"> {/* ← Link に変更し、to="/notifications" を追加 */}
        <IoMdNotifications size={24} />
        通知
      </Link>
    </nav>
  );
}