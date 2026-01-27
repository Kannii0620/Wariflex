import { useEffect } from 'react'; // 追加
import { Link } from 'react-router-dom';
import { BsBellFill, BsPersonCircle } from "react-icons/bs";
import logo from './WariFlex_Logo.png';
import { usePaymentStore } from '../store'; // 追加

export default function Header() {
  const { notifications, fetchNotifications } = usePaymentStore(); // 追加

  // 追加: コンポーネント表示時に通知数をチェック
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <header className="flex justify-between items-center mb-6">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <img src={logo} alt="WariFlex" className="h-10 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-white/80 hover:text-white transition-colors p-2">
          <BsPersonCircle size={26} />
        </Link>

        <Link 
          to="/notifications" 
          className="relative bg-white/20 p-2.5 rounded-full text-white hover:bg-white/30 transition-all backdrop-blur-sm"
        >
          <BsBellFill size={20} />
          
          {/* ★未読バッジ: 通知が1件以上あれば表示 */}
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-blue-600 bg-rose-500 transform translate-x-1/4 -translate-y-1/4 animate-pulse"></span>
          )}
        </Link>
      </div>
    </header>
  );
}