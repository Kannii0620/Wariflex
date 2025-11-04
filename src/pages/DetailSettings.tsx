import React from 'react';
import { useLocation } from 'react-router-dom';

export default function DetailSettings() {
  const location = useLocation();
  const amount = location.state?.amount || 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-600 p-4">
      <div className="max-w-md mx-auto bg-white/90 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">詳細設定ページ</h1>
        
        <p className="text-lg mb-6"> {/* ← 下に余白 (mb-6) を追加 */}
          割り勘前の金額: <strong>{amount} 円</strong>
        </p>
        
        {/* --- ↓ ここからHTML(JSX)を追加 --- */}
        <h2>テストだよん</h2>





        

        {/* ここからは仮のコード↓ */}

        {/* --- 1. 割り勘モード選択 --- */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3">割り勘モード</label>
          {/* flex と gap-4 でラジオボタンを横に並べる */}
          <div className="flex gap-4">
            <label className="flex items-center p-3 bg-gray-100 rounded-lg shadow-sm cursor-pointer">
              <input 
                type="radio" 
                name="splitMode" 
                value="even" 
                className="mr-2" // (Tailwind v4なら accent-blue-500 とかも使える)
              />
              均等割り勘
            </label>
            <label className="flex items-center p-3 bg-gray-100 rounded-lg shadow-sm cursor-pointer">
              <input 
                type="radio" 
                name="splitMode" 
                value="uneven" 
                className="mr-2"
              />
              片方が多め
            </label>
          </div>
        </div>

        {/* --- 2. 支払いの偏り指定 (スライダー) --- */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3">支払いの偏り</label>
          {/* スライダー */}
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="50" // (初期値は50%)
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          {/* スライダーの左右のラベル */}
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Aさん (少なめ)</span>
            <span>Bさん (多め)</span>
          </div>
        </div>

        {/* --- 3. 決定ボタン --- */}
        <button className="w-full bg-emerald-600 text-white font-semibold p-3 rounded-lg shadow-lg hover:bg-emerald-700">
          この内容で割り勘を計算
        </button>

        {/* --- ↑ ここまで追加 --- */}
        
      </div>
    </div>
  );
}