// React-iconから取得
import { AiFillHome } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

//ナビゲーションボタン
export default function BottomNav() {
  return (
    <nav className="bg-white border-t p-2 flex justify-around text-sm text-gray-600">
      <button className="flex flex-col items-center">
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