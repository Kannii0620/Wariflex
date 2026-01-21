import { Link } from 'react-router-dom';
import { BsBellFill } from "react-icons/bs";
import logo from './WariFlex_Logo.png';

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-6">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <img src={logo} alt="WariFlex" className="h-10 w-auto object-contain" />
      </Link>

      {/* 通知ボタン */}
      <Link 
        to="/notifications" 
        className="relative bg-white/20 p-2.5 rounded-full text-white hover:bg-white/30 transition-all backdrop-blur-sm"
      >
        <BsBellFill size={20} />
        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-blue-600 bg-rose-500 transform translate-x-1/4 -translate-y-1/4"></span>
      </Link>
    </header>
  );
}