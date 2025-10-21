import { motion } from "framer-motion";

type Props = {
  onClick?: () => void;
};

export function AnimatedButton({ onClick }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      語るボタン
    </motion.button>
  );
}
