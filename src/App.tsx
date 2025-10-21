import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './index.css'
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";




//デバッグ用に追加



function App() {

  const [count, setCount] = useState(0)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // 準備時間
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500 text-xl animate-pulse">起動中…</p>
      </div>
    );
  }


  return (
    <>
      <div className="mx-auto max-w-sm p-4">
        {/* 全体の語り */}
      </div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-purple-600">Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          Tailwind is working! 🎉
        </div>
        <div className="bg-red-500 text-white p-4 rounded">
          Tailwind is definitely working ✅
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="p-8">
        <motion.button
          onClick={() => navigate("/about")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          語るボタン
        </motion.button>
      </div>
    </>
  )
}

export default App
