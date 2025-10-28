import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <main className="p-4 max-w-md mx-auto">
        <Header />
        <AddPayment />
        <PaymentList />
      </main>
      <BottomNav />
    </div>
  );
}









