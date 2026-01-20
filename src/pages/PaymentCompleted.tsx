import { Link } from 'react-router-dom';
import { BsCheckCircleFill, BsClockHistory, BsHouseDoorFill } from "react-icons/bs";

export default function PaymentCompleted() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 flex flex-col items-center justify-center p-4 text-white">
      
      <div className="z-10 text-center animate-fade-in-up max-w-md w-full bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl">
        
        {/* 🎉 完了アイコン (react-icons) */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-full p-4 shadow-lg animate-bounce-slow">
            {/* ここでアイコンを変えられます */}
            <BsCheckCircleFill className="text-emerald-500 text-7xl" />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-2 drop-shadow-sm">登録完了！</h1>
        <p className="text-base text-blue-50 mb-8 leading-relaxed">
          割り勘データを正常に保存しました。<br/>
          履歴からいつでも確認・CSV出力できます。
        </p>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link 
            to="/history" 
            className="w-full bg-white text-blue-600 font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-50 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <BsClockHistory size={18} />
            履歴を確認する
          </Link>

          <Link 
            to="/" 
            className="w-full bg-blue-800/40 text-white font-bold py-3.5 rounded-xl border border-white/20 hover:bg-blue-800/60 transition-all flex items-center justify-center gap-2"
          >
            <BsHouseDoorFill size={18} />
            ホームに戻る
          </Link>
        </div>

      </div>
    </div>
  );
}