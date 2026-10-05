import { AiFillHome, AiFillSetting } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: "/", label: "ホーム", icon: <AiFillHome size={24} /> },
  { to: "/history", label: "履歴", icon: <FaHistory size={22} /> },
  { to: "/detail-settings", label: "設定", icon: <AiFillSetting size={24} /> },
  { to: "/profile", label: "プロフィール", icon: <BsPersonCircle size={24} /> },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/95 backdrop-blur-md shadow-2xl rounded-full z-50 border border-white/20 flex justify-around items-center h-16 px-4">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-col items-center transition-colors duration-200 w-16 ${pathname === to ? "text-blue-600" : "text-gray-400"}`}
        >
          {icon}
          <span className="text-[10px] mt-1 font-bold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
