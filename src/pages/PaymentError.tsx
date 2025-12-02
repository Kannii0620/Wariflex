import { Link, useLocation } from "react-router-dom"; // useLocation を追加
import { motion } from "framer-motion";
import { BiErrorCircle } from "react-icons/bi";

export default function PaymentError() {
  const location = useLocation();
  // state からエラーメッセージを取り出す（もし無ければデフォルトの文章を表示）
  const errorMessage = location.state?.message || "入力された金額が正しくありません。";

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4 flex flex-col items-center justify-center">
      
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
        
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4 text-rose-500 flex justify-center" 
        >
          <BiErrorCircle />
        </motion.div>

        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          エラーが発生しました
        </h1>
        
        {/* ↓ ここを動的に変える！ */}
        <p className="text-gray-700 mb-8 leading-relaxed font-medium">
          {errorMessage}
        </p>

        <Link 
          to="/" 
          className="block w-full bg-rose-500 text-white font-semibold py-3 rounded-lg shadow hover:bg-rose-600 transition-colors"
        >
          入力画面に戻る
        </Link>

      </div>
    </div>
  );
}