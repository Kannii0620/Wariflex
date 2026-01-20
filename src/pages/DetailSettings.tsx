import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { BsFillTrash3Fill } from "react-icons/bs";
import { FaYenSign, FaPercent } from "react-icons/fa";
import { usePaymentStore } from '../store';

type LocalParticipant = {
  id: string;
  name: string;
  percentage: number; // 金額ではなく％で管理
};

export default function DetailSettings() {
  const location = useLocation();
  // 前の画面から渡された金額 (数値)
  const amount = location.state?.amount || 0;

  const navigate = useNavigate();
  const addPayment = usePaymentStore((state) => state.addPayment);

  // --- 状態 (State) ---
  const [paymentName, setPaymentName] = useState("");
  const [message, setMessage] = useState("");
  const [splitMode, setSplitMode] = useState("even");

  // ★追加: 入力モード ('percent' か 'amount' か)
  const [inputMode, setInputMode] = useState<'percent' | 'amount'>('percent');

  const [participants, setParticipants] = useState<LocalParticipant[]>([
    { id: '1', name: 'Aさん', percentage: 50 },
    { id: '2', name: 'Bさん', percentage: 50 },
  ]);

  // --- ロジック ---

  // 名前変更
  const handleNameChange = (id: string, newName: string) => {
    setParticipants(current =>
      current.map(p => p.id === id ? { ...p, name: newName } : p)
    );
  };

  // 均等割り勘計算
  const calcEvenSplit = (list: LocalParticipant[]) => {
    const count = list.length;
    if (count === 0) return list;
    const base = Math.floor(100 / count);
    const remainder = 100 % count;
    return list.map((p, i) => ({
      ...p,
      percentage: base + (i < remainder ? 1 : 0)
    }));
  };

  // モード切替 & 均等計算
  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value;
    setSplitMode(newMode);
    if (newMode === 'even') {
      setParticipants(prev => calcEvenSplit(prev));
    }
  };

  // パーセントを変更する処理（スライダーや％入力から呼ばれる）
  const updatePercentage = (id: string, newPercentage: number) => {
    // 0〜100に収める
    const validPercentage = Math.max(0, Math.min(100, newPercentage));

    setParticipants(current => {
      const target = current.find(p => p.id === id);
      if (!target) return current;

      // 他の人たち
      const otherParticipants = current.filter(p => p.id !== id);
      if (otherParticipants.length === 0) {
        // 自分一人しかいないなら常に100%
        return current.map(p => ({ ...p, percentage: 100 }));
      }

      // 変化量を計算して、他の人に分散させる
      const diff = validPercentage - target.percentage;
      const changePerOther = diff / otherParticipants.length;

      return current.map(p => {
        if (p.id === id) {
          return { ...p, percentage: validPercentage };
        } else {
          // 誤差が出ないように調整（マイナスにならないように）
          let newP = p.percentage - changePerOther;
          return { ...p, percentage: Math.max(0, newP) }; // 仮の計算
        }
      });
      // ※厳密に合計100%にするための再調整ロジックは簡略化しています
    });
  };
  

  // 金額を変更する処理（円入力から呼ばれる） ※相互変換
  // 例 Aさんが3000円、全体が10000円で入力した場合
  // 金額を変更する処理（円入力から呼ばれる）
  const handleAmountChange = (id: string, newAmountStr: string) => {
    // 1. 入力された文字列（例: "3000"）を数値にする
    // 空文字なら0円として扱う
    const newAmount = newAmountStr === '' ? 0 : Number(newAmountStr);
    
    // 0で割り算するのを防ぐ
    if (amount <= 0) return;

    // 2. 「その金額は全体の何％か？」を計算する
    // (例: 3,000 ÷ 10,000 × 100 = 30%)
    const newPercentage = (newAmount / amount) * 100;
    
    // 3. 既存の％更新ロジックを使って反映させる
    updatePercentage(id, newPercentage);
  };

  // 参加者追加
  const addParticipant = () => {
    const newId = Date.now().toString();
    setParticipants(current => {
      const newList = [...current, { id: newId, name: `追加メンバー`, percentage: 0 }];
      return splitMode === 'even' ? calcEvenSplit(newList) : newList;
    });
  };

  // 参加者削除
  const removeParticipant = (id: string) => {
    setParticipants(current => {
      const newList = current.filter(p => p.id !== id);
      return splitMode === 'even' ? calcEvenSplit(newList) : newList;
    });
  };

  // 表示用に金額を計算する（再計算：最大剰余方式で誤差をなくす）
  const displayParticipants = (() => {
    const total = Number(amount);
    
    // 1. まず全員の「本来の金額（小数）」と「切り捨てた整数」を計算
    const rawData = participants.map(p => {
      const rawVal = total * (p.percentage / 100);
      return {
        ...p,
        intVal: Math.floor(rawVal),          // 整数部分 (例: 2)
        decimalPart: rawVal - Math.floor(rawVal) // 小数部分 (例: 0.99...)
      };
    });

    // 2. 整数部分だけだといくら足りないか（余り）を計算
    const currentSum = rawData.reduce((acc, p) => acc + p.intVal, 0);
    let remainder = total - currentSum;

    // 3. 小数部分が大きい順に「+1円」をもらう権利を与える
    // (これで "2.99円" の人はちゃんと "3円" になり、"3.00円" の人は "3円" のままになる)
    const sortedByDecimal = [...rawData].sort((a, b) => b.decimalPart - a.decimalPart);
    const bonusIds = new Set(sortedByDecimal.slice(0, remainder).map(p => p.id));

    // 4. 計算結果を適用して返す
    return rawData.map(p => ({
      ...p, 
      // 自分のIDがボーナスリストに入ってれば +1円 する
      estimatedAmount: p.intVal + (bonusIds.has(p.id) ? 1 : 0)
    }));
  })();

  const handleComplete = async () => {
    if (!amount) return;
    const title = paymentName || "(名称未設定)";

    // ★修正: DBエラー防止のため、パーセントを小数点第2位で丸めてから保存
    const cleanParticipants = participants.map(p => ({
      ...p,
      percentage: Number(p.percentage.toFixed(2))
    }));

    // participants ではなく cleanParticipants を渡す
    await addPayment(title, Number(amount), cleanParticipants, message);
    navigate('/about');
  };

  // --- 表示 (JSX) ---
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4 pb-32">
      <div className="max-w-md mx-auto">
        <Header />

        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-gray-900 mt-4 animate-fade-in-up">

          <h1 className="text-2xl font-bold mb-1">詳細設定</h1>
          <p className="text-sm text-gray-500 mb-6">金額とメンバーを調整してください</p>

          <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">割り勘する金額</p>
            <p className="text-3xl font-bold text-blue-600">¥{Number(amount).toLocaleString()}</p>
          </div>

          {/* 支払い名 & メモ */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">支払い名</label>
              <input
                type="text"
                placeholder="例：田中さんと飲み会"
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={paymentName}
                onChange={(e) => setPaymentName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">メモ</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="例：2次会のタクシー代"
              />
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          {/* モード切替タブ */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setSplitMode('even')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${splitMode === 'even' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'
                }`}
            >
              均等割り
            </button>
            <button
              onClick={() => setSplitMode('uneven')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${splitMode === 'uneven' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'
                }`}
            >
              カスタム
            </button>
          </div>

          {/* 単位切替スイッチ (カスタム時のみ表示) */}
          {splitMode === 'uneven' && (
            <div className="flex justify-end mb-4">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setInputMode('percent')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${inputMode === 'percent' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'
                    }`}
                >
                  <FaPercent /> ％で指定
                </button>
                <button
                  onClick={() => setInputMode('amount')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${inputMode === 'amount' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'
                    }`}
                >
                  <FaYenSign /> 円で指定
                </button>
              </div>
            </div>
          )}

          {/* 参加者リスト */}
          <div className="space-y-4 mb-8">
            {displayParticipants.map((person) => (
              <div key={person.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">

                {/* 名前と削除ボタン */}
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => handleNameChange(person.id, e.target.value)}
                    className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-2/3"
                  />
                  <button
                    onClick={() => removeParticipant(person.id)}
                    className="text-gray-300 hover:text-rose-500 p-2 transition-colors"
                  >
                    <BsFillTrash3Fill />
                  </button>
                </div>

                {/* スライダーと入力エリア */}
                <div className="flex items-center gap-4">
                  {/* スライダー (常にパーセントと連動) */}
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1" // 1%刻み
                      value={person.percentage}
                      onChange={(e) => updatePercentage(person.id, Number(e.target.value))}
                      disabled={splitMode === 'even'}
                      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 ${splitMode === 'even' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    />
                  </div>

                  {/* 数値入力エリア (モードによって切り替え) */}
                  <div className="w-24 text-right">
                    {splitMode === 'even' ? (
                      // 均等のときは表示のみ
                      <div className="text-gray-600 font-bold">
                        ¥{person.estimatedAmount.toLocaleString()}
                      </div>
                    ) : inputMode === 'percent' ? (
                      // ％モード：パーセントを入力
                      <div className="relative">
                        <input
                          type="number"
                          value={Math.round(person.percentage)}
                          onChange={(e) => updatePercentage(person.id, Number(e.target.value))}
                          className="w-full text-right font-bold border-b border-gray-300 focus:border-blue-500 outline-none pr-4"
                        />
                        <span className="absolute right-0 top-0 text-gray-400 text-sm">%</span>
                        <div className="text-xs text-gray-400 mt-1">
                          ¥{person.estimatedAmount.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      // 円モード：金額を直接入力！
                      <div className="relative">
                        <input
                          type="number"
                          // ここで計算済みの金額を表示
                          value={person.estimatedAmount}
                          onChange={(e) => handleAmountChange(person.id, e.target.value)}
                          className="w-full text-right font-bold border-b border-gray-300 focus:border-blue-500 outline-none pr-4"
                        />
                        <span className="absolute right-0 top-0 text-gray-400 text-sm">円</span>
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(person.percentage)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}

            <button
              onClick={addParticipant}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 transition-all"
            >
              ＋ 参加者を追加
            </button>
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all"
          >
            この内容で決定する
          </button>
        </div>
      </div>
    </div>
  );
}