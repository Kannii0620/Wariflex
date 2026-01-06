// src/components/BottomNav.tsx
import { AiFillHome } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { Link, useLocation } from 'react-router-dom'; // ← useLocation を追加

export default function BottomNav() {
  const location = useLocation(); // ← これで「今のURL」が分かります

  // 共通のデザイン設定
  const activeColor = "text-blue-600"; // 選択されているときの色
  const inactiveColor = "text-gray-400"; // 選択されていないときの色

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-md shadow-2xl rounded-full z-50 border border-white/20 flex justify-around items-center h-16">
      
      {/* ホームボタン */}
      <Link 
        to="/" 
        className={`flex flex-col items-center transition-colors duration-200 
          ${location.pathname === "/" ? activeColor : inactiveColor}`}
      >
        <AiFillHome size={24} />
        <span className="text-xs">ホーム</span>
      </Link>

      {/* 履歴ボタン */}
      <Link 
        to="/history" 
        className={`flex flex-col items-center transition-colors duration-200 
          ${location.pathname === "/history" ? activeColor : inactiveColor}`}
      >
        <FaHistory size={24} />
        <span className="text-xs">履歴</span>
      </Link>

      {/* 通知ボタン */}
      <Link 
        to="/notifications" 
        className={`flex flex-col items-center transition-colors duration-200 
          ${location.pathname === "/notifications" ? activeColor : inactiveColor}`}
      >
        <IoMdNotifications size={24} />
        <span className="text-xs">通知</span>
      </Link>

    </nav>
  );
}