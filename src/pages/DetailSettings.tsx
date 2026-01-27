import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { BsFillTrash3Fill, BsLockFill, BsUnlockFill } from "react-icons/bs";
import { FaYenSign, FaPercent, FaBalanceScale } from "react-icons/fa";
import { usePaymentStore } from '../store';

type LocalParticipant = {
  id: string;
  name: string;
  percentage: number; 
  isFixed: boolean; // ★追加: 固定フラグ
};

export default function DetailSettings() {
  const location = useLocation();
  const amount = location.state?.amount || 0;
  const navigate = useNavigate();
  const addPayment = usePaymentStore((state) => state.addPayment);

  const [paymentName, setPaymentName] = useState("");
  const [message, setMessage] = useState("");
  const [splitMode, setSplitMode] = useState("even");
  const [inputMode, setInputMode] = useState<'percent' | 'amount'>('percent');

  // 初期メンバー (isFixedを追加)
  const [participants, setParticipants] = useState<LocalParticipant[]>([
    { id: '1', name: 'Aさん', percentage: 50, isFixed: false },
    { id: '2', name: 'Bさん', percentage: 50, isFixed: false },
  ]);

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
      percentage: base + (i < remainder ? 1 : 0),
      isFixed: false // 均等モードにしたらロック解除
    }));
  };

  // ★重要: パーセントを変更する処理（ロック対応版）
  const updatePercentage = (id: string, newPercentage: number) => {
    const validPercentage = Math.max(0, Math.min(100, newPercentage));

    setParticipants(current => {
      const target = current.find(p => p.id === id);
      if (!target) return current;

      // 変更対象以外で、かつ「ロックされていない人」を探す
      const otherActiveParticipants = current.filter(p => p.id !== id && !p.isFixed);

      // もし自分以外全員ロックされていたら、変更できない（または自分だけ変わる＝合計100にならないが、今回は変更不可にする）
      if (otherActiveParticipants.length === 0) {
        // ※厳密には「合計100%チェック」が必要ですが、UX的には「他が動かせないので変更キャンセル」とします
        return current; 
      }

      // 差分を計算
      const diff = validPercentage - target.percentage;

      // ロックされていない人たちで差分を吸収する
      // (現在の比率に関係なく、差分を人数で等分して引く)
      const changePerOther = diff / otherActiveParticipants.length;

      return current.map(p => {
        if (p.id === id) {
          return { ...p, percentage: validPercentage };
        } else if (!p.isFixed) {
          // ロックされていない人から引く
          let newP = p.percentage - changePerOther;
          return { ...p, percentage: Math.max(0, newP) };
        } else {
          // ロックされている人はそのまま
          return p;
        }
      });
    });
  };

  // ★追加: ロック切り替え
  const toggleLock = (id: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, isFixed: !p.isFixed } : p
    ));
  };

  // ★追加: 残りを均等にする機能
  // 「Aさん3000円固定、残りはみんなで割り勘」を実現するボタン用
  const distributeRest = () => {
    setParticipants(current => {
      // 固定されている人の合計％を算出
      const fixedTotal = current.filter(p => p.isFixed).reduce((sum, p) => sum + p.percentage, 0);
      
      // 残りの％
      const remainingPercent = 100 - fixedTotal;
      if (remainingPercent < 0) return current; // 異常値ガード

      // 固定されていない人の数
      const activeMembers = current.filter(p => !p.isFixed);
      if (activeMembers.length === 0) return current;

      // 残りを人数で割る
      const perPerson = remainingPercent / activeMembers.length;

      return current.map(p => {
        if (p.isFixed) return p;
        return { ...p, percentage: perPerson };
      });
    });
  };

  // 金額入力ハンドラ
  const handleAmountChange = (id: string, newAmountStr: string) => {
    const newAmount = newAmountStr === '' ? 0 : Number(newAmountStr);
    if (amount <= 0) return;
    const newPercentage = (newAmount / amount) * 100;
    updatePercentage(id, newPercentage);
  };

  // 参加者追加
  const addParticipant = () => {
    const newId = Date.now().toString();
    setParticipants(current => {
      // 追加時はロックなし、0%スタート（または自動調整）
      // ここでは単純に追加して、残りを均等ボタンで直してもらう運用もアリだが、
      // 既存ロジックに合わせて「均等モードなら再計算」「カスタムなら0%」にする
      const newList = [...current, { id: newId, name: `追加メンバー`, percentage: 0, isFixed: false }];
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

  // 表示用計算 (円換算)
  const displayParticipants = (() => {
    const total = Number(amount);
    const rawData = participants.map(p => {
      const rawVal = total * (p.percentage / 100);
      return {
        ...p,
        intVal: Math.floor(rawVal),
        decimalPart: rawVal - Math.floor(rawVal)
      };
    });
    const currentSum = rawData.reduce((acc, p) => acc + p.intVal, 0);
    let remainder = total - currentSum;
    const sortedByDecimal = [...rawData].sort((a, b) => b.decimalPart - a.decimalPart);
    const bonusIds = new Set(sortedByDecimal.slice(0, remainder).map(p => p.id));

    return rawData.map(p => ({
      ...p, 
      estimatedAmount: p.intVal + (bonusIds.has(p.id) ? 1 : 0)
    }));
  })();

  const handleComplete = async () => {
    if (!amount) return;
    const title = paymentName || "(名称未設定)";
    const cleanParticipants = participants.map(p => ({
      ...p, // isFixed はDBに保存しない（保存してもいいけど今回は計算用なので除外される）
      percentage: Number(p.percentage.toFixed(2))
    }));
    await addPayment(title, Number(amount), cleanParticipants, message);
    navigate('/completed');
  };

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
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setSplitMode('even')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${splitMode === 'even' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              均等割り
            </button>
            <button
              onClick={() => setSplitMode('uneven')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${splitMode === 'uneven' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              カスタム
            </button>
          </div>

          {/* カスタムモード用ツールバー */}
          {splitMode === 'uneven' && (
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
              <button 
                onClick={distributeRest}
                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                title="ロックされていないメンバーで残高を山分けします"
              >
                <FaBalanceScale /> 残りを均等にする
              </button>

              <div className="inline-flex bg-gray-200 rounded-md p-0.5">
                <button
                  onClick={() => setInputMode('percent')}
                  className={`px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-1 transition-all ${inputMode === 'percent' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}
                >
                  <FaPercent />
                </button>
                <button
                  onClick={() => setInputMode('amount')}
                  className={`px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-1 transition-all ${inputMode === 'amount' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}
                >
                  <FaYenSign />
                </button>
              </div>
            </div>
          )}

          {/* 参加者リスト */}
          <div className="space-y-4 mb-8">
            {displayParticipants.map((person) => (
              <div key={person.id} className={`p-4 border rounded-xl shadow-sm transition-all ${person.isFixed ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-100 hover:shadow-md'}`}>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handleNameChange(person.id, e.target.value)}
                      className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full"
                    />
                  </div>
                  
                  {/* ロックボタン & 削除ボタン */}
                  <div className="flex items-center gap-1">
                    {splitMode === 'uneven' && (
                      <button
                        onClick={() => toggleLock(person.id)}
                        className={`p-2 rounded-full transition-colors ${person.isFixed ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-gray-500'}`}
                        title={person.isFixed ? "固定中 (金額が変わりません)" : "金額を固定する"}
                      >
                        {person.isFixed ? <BsLockFill /> : <BsUnlockFill />}
                      </button>
                    )}
                    <button
                      onClick={() => removeParticipant(person.id)}
                      className="text-gray-300 hover:text-rose-500 p-2 transition-colors"
                    >
                      <BsFillTrash3Fill />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={person.percentage}
                      onChange={(e) => updatePercentage(person.id, Number(e.target.value))}
                      // ロック中はスライダー無効、または均等モード時は無効
                      disabled={splitMode === 'even' || person.isFixed}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer 
                        ${person.isFixed ? 'bg-gray-300 accent-gray-500' : 'bg-gray-200 accent-blue-600'}
                      `}
                    />
                  </div>

                  <div className="w-24 text-right">
                    {splitMode === 'even' ? (
                      <div className="text-gray-600 font-bold">
                        ¥{person.estimatedAmount.toLocaleString()}
                      </div>
                    ) : inputMode === 'percent' ? (
                      <div className="relative">
                        <input
                          type="number"
                          value={Math.round(person.percentage)}
                          onChange={(e) => updatePercentage(person.id, Number(e.target.value))}
                          disabled={person.isFixed}
                          className={`w-full text-right font-bold border-b outline-none pr-4 
                            ${person.isFixed ? 'bg-transparent text-gray-500 border-gray-300' : 'border-gray-300 focus:border-blue-500'}`}
                        />
                        <span className="absolute right-0 top-0 text-gray-400 text-sm">%</span>
                        <div className="text-xs text-gray-400 mt-1">
                          ¥{person.estimatedAmount.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={person.estimatedAmount}
                          onChange={(e) => handleAmountChange(person.id, e.target.value)}
                          disabled={person.isFixed}
                          className={`w-full text-right font-bold border-b outline-none pr-4 
                            ${person.isFixed ? 'bg-transparent text-gray-500 border-gray-300' : 'border-gray-300 focus:border-blue-500'}`}
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