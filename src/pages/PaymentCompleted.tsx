import { Link } from 'react-router-dom';
import { BsCheckCircleFill, BsClockHistory, BsHouseDoorFill } from "react-icons/bs";
import { motion,  type Variants } from 'framer-motion'; 

export default function PaymentCompleted() {
  
  // ★ここに「: Variants」をつけるだけでエラーが消えます
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.15,
        delayChildren: 0.2
      } 
    }
  };

  // ★ここも
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
    }
  };

  // ★ここも
  const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15
      } 
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 flex flex-col items-center justify-center p-4 text-white">
      
      <motion.div 
        className="z-10 text-center max-w-md w-full bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
        {/* 🎉 完了アイコン */}
        <motion.div className="mb-6 flex justify-center" variants={iconVariants}>
          <div className="bg-white rounded-full p-4 shadow-lg">
            <BsCheckCircleFill className="text-emerald-500 text-7xl" />
          </div>
        </motion.div>

        {/* テキストエリア */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-black mb-2 drop-shadow-sm">登録完了！</h1>
          <p className="text-base text-blue-50 mb-8 leading-relaxed">
            割り勘データを保存しました。<br/>
            履歴からいつでも確認できます。
          </p>
        </motion.div>

        {/* アクションボタン */}
        <motion.div className="space-y-3" variants={itemVariants}>
          <Link 
            to="/history" 
            className="w-full bg-white text-blue-600 font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
          >
            <BsClockHistory size={18} />
            履歴を確認する
          </Link>

          <Link 
            to="/" 
            className="w-full bg-blue-800/40 text-white font-bold py-3.5 rounded-xl border border-white/20 hover:bg-blue-800/60 flex items-center justify-center gap-2 transition-colors"
          >
            <BsHouseDoorFill size={18} />
            ホームに戻る
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}