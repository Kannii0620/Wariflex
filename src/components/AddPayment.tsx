import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 画面遷移フック
import { AnimatedButton } from './AnimatedButton'; // 改造したボタンを import

export default function AddPayment() {
  // 1. 金額を保存するための「状態」
  const [amount, setAmount] = useState('');
  
  // 2. 画面遷移を使うための準備
  const navigate = useNavigate();

  // 3. ボタンがクリックされた時の処理
  const handleNextStep = () => {
    if (amount) {
      // もし金額が入力されていたら...
      // "/detail-settings"（詳細設定ページ）へ遷移する
      // (state で金額データを次のページに渡すこともできます)
      navigate('/detail-settings', { state: { amount: amount } });
    } else {
      // 未入力ならアラート
      alert('入力エラー：金額を入力してください');
    }
  };

  return (
    // 抹茶色のコンテナ
    <div className="bg-lime-200/80 text-black p-6 rounded-2xl shadow-lg">
      
      <label className="block mb-3 text-lg font-semibold">
        新たな支払いを追加
      </label>
      
      {/* --- 金額入力 --- */}
      <div className="flex items-center bg-white rounded-lg border-2 border-black/60 mb-4">
        <input 
          type="number" 
          placeholder="金額を入力" 
          className="w-full p-3 bg-transparent rounded-l-lg border-none focus:ring-0 text-lg"
          value={amount} // state と input の値を紐付け
          onChange={(e) => setAmount(e.target.value)} // 入力されたら state を更新
        />
        <span className="px-4 text-lg font-semibold text-gray-700">
          円
        </span>
      </div>

      {/* --- 汎用化した AnimatedButton を使用 --- */}
      <AnimatedButton
        onClick={handleNextStep}
        // ボタンのスタイルを抹茶色に合わせてカスタマイズ
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700" 
      >
        詳細設定へ進む
      </AnimatedButton>

    </div>
  );
}