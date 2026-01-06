import './index.css'
import Header from './components/Header.tsx';
import AddPayment from './components/AddPayment.tsx';
import PaymentList from './components/PaymentList.tsx';
import BottomNav from './components/BottomNav.tsx';

export default function App() {
  return (
  // ↓ 背景用のdiv (画面全体にグラデーションをかける)
   <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 pb-24">
    {/* ↓ 中身用のdiv (最大幅と中央寄せを担当) */}
     <div className="max-w-md mx-auto">
      <main className="p-4"> 
       <Header />
       <AddPayment />

       <hr className="my-6 border-gray-300/50" /> 
       <PaymentList />
       <hr className="my-6 border-gray-300/50" />

      </main>
      <BottomNav />
     </div>
  </div>
 );
}









