import React, { useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { BsFillTrash3Fill } from "react-icons/bs";
import { usePaymentStore } from '../store';

// UI管理用の一時的な型定義
type LocalParticipant = {
  id: string; // IDは文字列にする
  name: string;
  percentage: number;
};

export default function DetailSettings() {
  const location = useLocation();
  const amount = location.state?.amount || 0;

  const navigate = useNavigate();
  const addPayment = usePaymentStore((state) => state.addPayment);

  // --- 状態 (State) ---
  const [paymentName, setPaymentName] = useState("");
  const [splitMode, setSplitMode] = useState("even");
  
  // 初期値 (IDは適当な文字列でOK)
  const [participants, setParticipants] = useState<LocalParticipant[]>([
    { id: '1', name: 'Aさん', percentage: 50 },
    { id: '2', name: 'Bさん', percentage: 50 },
  ]);

  // --- ロジック ---

  // 1. 名前変更
  const handleNameChange = (id: string, newName: string) => {
    setParticipants(current => 
      current.map(p => p.id === id ? { ...p, name: newName } : p)
    );
  };

  // 2. モード切替 & 均等計算
  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value;
    setSplitMode(newMode);

    if (newMode === 'even') {
      setParticipants(currentParticipants => {
        const count = currentParticipants.length;
        if (count === 0) return currentParticipants;
        
        const base = Math.floor(100 / count);
        const remainder = 100 % count;
        
        return currentParticipants.map((p, i) => ({
          ...p,
          percentage: base + (i < remainder ? 1 : 0)
        }));
      });
    }
  };

  // 3. スライダー変更
  const handleSliderChange = (id: string,QlValue: number) => {
    const newValue = Number(QlValue);
    const otherParticipants = participants.filter(p => p.id !== id);
    const target = participants.find(p => p.id === id);
    if (!target) return;

    const change = newValue - target.percentage;
    const changePerOther = otherParticipants.length > 0 ? change / otherParticipants.length : 0;

    setParticipants(current =>
      current.map(p => {
        if (p.id === id) return { ...p, percentage: newValue };
        if (otherParticipants.find(op => op.id === p.id)) {
          const adjusted = Math.max(0, p.percentage - changePerOther);
          return { ...p, percentage: adjusted };
        }
        return p;
      })
    );
  };

  // 4. 参加者追加
  const addParticipant = () => {
    const newId = Date.now().toString(); // IDを文字列にする
    
    setParticipants(currentParticipants => {
      const newPerson = {
        id: newId,
        name: `（${currentParticipants.length + 1}人目）`,
        percentage: 0 
      };
      const updatedList = [...currentParticipants, newPerson];

      if (splitMode === 'even') {
        const count = updatedList.length;
        const base = Math.floor(100 / count);
        const remainder = 100 % count;
        return updatedList.map((p, i) => ({
          ...p,
          percentage: base + (i < remainder ? 1 : 0)
        }));
      }
      return updatedList;
    });
  };

  // 5. 参加者削除
  const removeParticipant = (id: string) => {
    setParticipants(currentParticipants => {
      const updatedList = currentParticipants.filter(person => person.id !== id);

      if (splitMode === 'even' && updatedList.length > 0) {
        const count = updatedList.length;
        const base = Math.floor(100 / count);
        const remainder = 100 % count;
        return updatedList.map((p, i) => ({
          ...p,
          percentage: base + (i < remainder ? 1 : 0)
        }));
      }
      return updatedList;
    });
  };

  // 6. 計算用 (表示用)
  const calculatedParticipants = (() => {
    const total = Number(amount);
    let currentSum = 0;
    const temp = participants.map(p => {
      const val = Math.floor(total * (p.percentage / 100));
      currentSum += val;
      return { ...p, estimatedAmount: val };
    });
    let remainder = total - currentSum;
    return temp.map(p => {
      if (remainder > 0) {
        p.estimatedAmount += 1;
        remainder--;
      }
      return p;
    });
  })();

  // 7. 保存して完了 (DBへ保存)
  const handleComplete = async () => {
    const title = paymentName || "(名称未設定)";
    
    // ★ここが変更点！
    // ID生成などはストア(DB)に任せて、必要なデータだけを渡す
    await addPayment(title, Number(amount), participants);

    navigate('/about');
  };

  // --- 表示 (JSX) ---
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4">
      <div className="max-w-md mx-auto">
        <Header />
        <div className="bg-white/90 p-6 rounded-2xl shadow-lg text-gray-900 mt-4">

          <h1 className="text-2xl font-semibold mb-4">詳細設定ページ</h1>
          <p className="text-lg mb-6">
            割り勘前の金額: <strong>{amount} 円</strong>
          </p>

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

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">割り勘モード</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="splitMode"
                  value="even"
                  checked={splitMode === 'even'}
                  onChange={handleModeChange}
                  className="mr-2"
                />
                均等割
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="splitMode"
                  value="uneven"
                  checked={splitMode === 'uneven'}
                  onChange={handleModeChange}
                  className="mr-2"
                />
                カスタム
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">支払いの偏り</label>

            {calculatedParticipants.map((person) => {
              return (
                <div key={person.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handleNameChange(person.id, e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => removeParticipant(person.id)}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <BsFillTrash3Fill />
                    </button>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={person.percentage}
                    onChange={(e) => handleSliderChange(person.id, Number(e.target.value))}
                    disabled={splitMode === 'even'}
                    className={`w-full ${splitMode === 'even' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  
                  <div className="flex justify-between text-sm text-gray-700 mt-1">
                    <span>割合: <strong>{person.percentage}%</strong></span>
                    <span>目安: <strong>¥{person.estimatedAmount.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={addParticipant}
              className="w-full p-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              ＋ 参加者を追加する
            </button>
          </div>

          <button 
            onClick={handleComplete} 
            className="w-full block text-center bg-emerald-600 text-white font-semibold p-3 rounded-lg shadow-lg hover:bg-emerald-700"
          >
            この内容で割り勘を精算
          </button>
        </div>
      </div>
    </div>
  );
}