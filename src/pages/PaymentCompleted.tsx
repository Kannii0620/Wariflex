import { Link } from "react-router-dom"; 
import { motion } from "framer-motion";  

export default function PaymentCompleted() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4 flex flex-col items-center justify-center">
      
      {/* 白いカード */}
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
        
        {/* チェックマークのアニメーション (framer-motion) */}
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="text-6xl mb-4 text-emerald-500 flex justify-center"
        >
          ✅
        </motion.div>

        <h1 className="text-2xl font-bold mb-4 text-gray-900">登録完了！</h1>
        
        <p className="text-gray-700 mb-8 leading-relaxed">
          支払いをリストに追加しました。<br/>
          ホーム画面の<br/>
          <strong>《未精算の支払いリスト》</strong><br/>
          から確認できます。
        </p>

        {/* ホームに戻るボタン */}
        <Link 
          to="/" 
          className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          ホーム画面に戻る
        </Link>

      </div>
    </div>
  );
}