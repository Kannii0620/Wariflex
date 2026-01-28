// src/components/BottomNav.tsx
import { AiFillHome, AiFillSetting } from 'react-icons/ai'; 
import { FaHistory } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const activeColor = "text-blue-600"; 
  const inactiveColor = "text-gray-400";

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/95 backdrop-blur-md shadow-2xl rounded-full z-50 border border-white/20 flex justify-around items-center h-16 px-4">
      
      {/* 1. ホーム */}
      <Link 
        to="/" 
        className={`flex flex-col items-center transition-colors duration-200 w-16
          ${location.pathname === "/" ? activeColor : inactiveColor}`}
      >
        <AiFillHome size={24} />
        <span className="text-[10px] mt-1 font-bold">ホーム</span>
      </Link>

      {/* 2. 履歴 */}
      <Link 
        to="/history" 
        className={`flex flex-col items-center transition-colors duration-200 w-16
          ${location.pathname === "/history" ? activeColor : inactiveColor}`}
      >
        <FaHistory size={22} />
        <span className="text-[10px] mt-1 font-bold">履歴</span>
      </Link>

      {/* 3. 設定（友達追加） */}
      <Link 
        to="/detail-settings" 
        className={`flex flex-col items-center transition-colors duration-200 w-16
          ${location.pathname === "/detail-settings" ? activeColor : inactiveColor}`}
      >
        <AiFillSetting size={24} />
        <span className="text-[10px] mt-1 font-bold">設定</span>
      </Link>

      {/* 4. マイページ（ID確認） */}
      <Link 
        to="/profile" 
        className={`flex flex-col items-center transition-colors duration-200 w-16
          ${location.pathname === "/profile" ? activeColor : inactiveColor}`}
      >
        <BsPersonCircle size={24} />
        <span className="text-[10px] mt-1 font-bold">プロフィール</span>
      </Link>

    </nav>
  );
}