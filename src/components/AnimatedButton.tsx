import { motion } from "framer-motion";
import React from "react";

type Props = {
  onClick?: () => void;
  children: React.ReactNode; 
  className?: string;       
};

export function AnimatedButton({ onClick, children, className }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded font-semibold ${className}`}
    >
      {children} 
    </motion.button>
  );
}