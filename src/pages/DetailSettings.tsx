import React, { useState } from 'react'; 
import { useLocation } from 'react-router-dom';
import Header from '../components/Header'; // Header を import
import { BsFillTrash3Fill } from "react-icons/bs";

// TypeScriptのための「型」定義
type Participant = {
  id: number;
  name: string;
  percentage: number; 
};

export default function DetailSettings() {
  const location = useLocation();
  const amount = location.state?.amount || 0;

  // 「支払い名」の状態
  const [paymentName, setPaymentName] = useState("");

  // 「割り勘モード」の状態 (初期値は "even" = 均等)
  const [splitMode, setSplitMode] = useState("even");
  
  // 「参加者リスト」の状態 
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: 'Aさん', percentage: 50 },
    { id: 2, name: 'Bさん', percentage: 50 },
  ]);

  // 参加者の名前を変更する関数
  const handleNameChange = (id: number, newName: string) => {
    setParticipants(currentParticipants => 
      currentParticipants.map(person => 
        person.id === id ? { ...person, name: newName } : person
      )
    );
  };

  // 参加者のスライダーを動かす関数 
  const handleSliderChange = (id: number, newValue: number) => {
    const totalParticipants = participants.length;
    // 自分以外の参加者
    const otherParticipants = participants.filter(p => p.id !== id);
    
    // 自分が動かした量
    const change = newValue - participants.find(p => p.id === id)!.percentage;
    
    // 他の参加者一人あたりが減るべき量
    const changePerOther = otherParticipants.length > 0 ? change / otherParticipants.length : 0;

    setParticipants(currentParticipants =>
      currentParticipants.map(person => {
        // 動かした本人
        if (person.id === id) {
          return { ...person, percentage: newValue };
        }
        // 他の参加者
        if (otherParticipants.find(p => p.id === person.id)) {
          // 他の人の割合を自動で減らす (0%未満にはならない)
          const adjustedPercentage = Math.max(0, person.percentage - changePerOther);
          return { ...person, percentage: adjustedPercentage };
        }
        return person;
      })
    );
  };

  // 参加者を追加する関数
  const addParticipant = () => {
    // 新しい参加者のIDを計算 (今の最大ID + 1、または参加者がいなければ 1)
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    
    const newParticipant: Participant = {
      id: newId,
      name: `（${participants.length + 1}人目）`,
      percentage: 0 //　初期値は0%
    };

    setParticipants(currentParticipants => 
      [...currentParticipants, newParticipant]
    );
  };
  
  // 参加者を削除する関数
  const removeParticipant = (id: number) => {
    // 削除したい人（id）「以外」の全員で新しい配列を作る
    setParticipants(currentParticipants => 
      currentParticipants.filter(person => person.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4">
      <div className="max-w-md mx-auto">
        <Header />
        <div className="bg-white/90 p-6 rounded-2xl shadow-lg text-gray-900 mt-4">

          <h1 className="text-2xl font-semibold mb-4">詳細設定ページ</h1>
          <p className="text-lg mb-6">
            割り勘前の金額: <strong>{amount} 円</strong>
          </p>

          {/* --- 「支払い名」 --- */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">支払い名</label>
            <input
              type="text"
              placeholder="（例：田中さんと飲み会）"
              className="w-full p-3 bg-white rounded-lg border-2 border-black/60 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={paymentName} 
              onChange={(e) => setPaymentName(e.target.value)} 
            />
          </div>

          {/* --- 割り勘モード選択 --- */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">割り勘モード</label>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="splitMode"
                  value="even"
                  checked={splitMode === 'even'} 
                  onChange={(e) => setSplitMode(e.target.value)} 
                />
                均等割
              </label>
              <label>
                <input
                  type="radio"
                  name="splitMode"
                  value="uneven"
                  checked={splitMode === 'uneven'} 
                  onChange={(e) => setSplitMode(e.target.value)} 
                />
                みんなが支える割
                {/* 一人を固定して、残りの確率バーを操作する */}
              </label>
            </div>
          </div>

          {/* --- 支払いの偏り指定 --- */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">支払いの偏り</label>

            {participants.map((person) => (
              <div key={person.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
                
                {/* 名前入力と削除ボタン */}
                <div className="flex justify-between items-center mb-2 gap-2">
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => {
                      handleNameChange(person.id, e.target.value);
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <button 
                    onClick={() => removeParticipant(person.id)}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <BsFillTrash3Fill />
                  </button>
                </div>

                {/* 各参加者のスライダー */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={person.percentage}
                  onChange={(e) => {
                    handleSliderChange(person.id, Number(e.target.value));
                  }}
                  className="w-full"
                />
                <span className="text-sm text-gray-700">{person.name} の割合: {person.percentage}%</span>
              </div>
            ))}

            {/* 「参加者を追加」ボタン */}
            <button
              onClick={() => {
                addParticipant();
              }}
              className="w-full p-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              ＋ 参加者を追加する
            </button>
          </div>

          {/* --- 決定ボタン --- */}
          <button className="w-full bg-emerald-600 text-white font-semibold p-3 rounded-lg shadow-lg hover:bg-emerald-700">
            この内容で割り勘を計算
          </button>

        </div>
      </div>
    </div>
  );
}