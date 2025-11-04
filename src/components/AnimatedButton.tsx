import { motion } from "framer-motion";
import React from "react";

type Props = {
  onClick?: () => void;
  children: React.ReactNode; // ← "children" を受け取れるようにする
  className?: string;        // ← "className" を受け取れるようにする
};

export function AnimatedButton({ onClick, children, className }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} // フォーム内のボタンなので少し控えめに
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      // ↓ デフォルトのスタイル + 外から渡されたスタイル(className) を適用
      className={`px-4 py-2 rounded font-semibold ${className}`}
    >
      {children} {/* ← "支払いを追加する" ではなく、渡された children を表示 */}
    </motion.button>
  );
}