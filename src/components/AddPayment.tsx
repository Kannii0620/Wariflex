import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { AnimatedButton } from './AnimatedButton'; 

export default function AddPayment() {
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const handleNextStep = () => {
    const numericAmount = Math.floor(Number(amount));

    if (!amount) {
      navigate('/error', { state: { message: "金額が入力されていません。数値を入力してください。" } });
      return;
    }

    if (numericAmount <= 0) {
      navigate('/error', { state: { message: "マイナスの値や1円より小さい金額は登録できません。正しい金額を入力してください。" } });
      return;
    }

    if (numericAmount > 1000000) {
      navigate('/error', { state: { message: "100万円より大きい金額はこの割り勘システムでは対応していません。正しい金額を入力するか、100万円を超える場合は2回以上に分けてご利用ください。" } });
      return;
    }

    navigate('/detail-settings', { state: { amount: numericAmount } });
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