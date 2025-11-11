import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import Header from './components/Header.tsx';
import AddPayment from './components/AddPayment.tsx';
import PaymentList from './components/PaymentList.tsx';
import BottomNav from './components/BottomNav.tsx';

export default function App() {
      return (
            // ↓ 背景用のdiv (画面全体にグラデーションをかける)
            <div className="min-h-screen bg-linear-to-b from-blue-400 to-blue-700">
                  {/* ↓ 中身用のdiv (最大幅と中央寄せを担当) */}
                  <div className="max-w-md mx-auto">
                        <main className="p-4"> {/* ここにあった重複する max-w-md mx-auto は削除 */}
                              <Header />
                              <AddPayment />

                              <hr className="my-6 border-gray-300/50" /> {/*←　ここに線と余白を追加*/}

                              <PaymentList />
                              <hr className="my-6 border-gray-300/50" />
                        </main>
                        <BottomNav />
                  </div>
            </div>
      );
}









