import { useState, useEffect } from 'react';
import { AnimatedButton } from './AnimatedButton';
import { usePaymentStore, type Friend } from '../store';
import { BsPersonFill, BsXCircle, BsCurrencyYen, BsCalculator, BsCheckCircle } from "react-icons/bs";

export default function AddPayment() {
  const { addPayment, friends, fetchFriends } = usePaymentStore();
  
  // 基本フォーム
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // 参加者
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [manualParticipants, setManualParticipants] = useState<string[]>([]);
  const [manualNameInput, setManualNameInput] = useState('');

  // モード管理 ('even'=均等, 'amount'=金額, 'percent'=割合)
  const [splitMode, setSplitMode] = useState<'even' | 'amount' | 'percent'>('even');
  
  // 個別入力値 (ID -> 値の文字列)
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>({});
  const [customPercents, setCustomPercents] = useState<{ [key: string]: string }>({});

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  // 全メンバー取得
  const getAllMembers = () => {
    return [
      { id: 'self', name: '自分 (立替者)' },
      ...selectedFriends.map(f => ({ id: f.friend_id, name: f.display_name })),
      ...manualParticipants.map(name => ({ id: name, name: name }))
    ];
  };

  // モード切り替え時の自動計算
  const changeMode = (newMode: 'even' | 'amount' | 'percent') => {
    const total = Number(amount);
    const members = getAllMembers();
    if (total <= 0 || members.length === 0) {
      setSplitMode(newMode);
      return;
    }

    if (newMode === 'amount') {
      // % -> 円 に変換 (または均等から)
      const newAmounts: any = {};
      if (splitMode === 'percent') {
        let currentSum = 0;
        members.forEach((m, i) => {
          if (i === members.length - 1) {
            newAmounts[m.id] = String(total - currentSum); // 最後の人で端数調整
          } else {
            const val = Math.floor(total * (Number(customPercents[m.id] || 0) / 100));
            newAmounts[m.id] = String(val);
            currentSum += val;
          }
        });
      } else {
        // 均等から
        const per = Math.floor(total / members.length);
        let currentSum = 0;
        members.forEach((m, i) => {
          if (i === members.length - 1) {
            newAmounts[m.id] = String(total - currentSum);
          } else {
            newAmounts[m.id] = String(per);
            currentSum += per;
          }
        });
      }
      setCustomAmounts(newAmounts);

    } else if (newMode === 'percent') {
      // 円 -> % に変換 (または均等から)
      const newPercents: any = {};
      if (splitMode === 'amount') {
        let currentSum = 0;
        members.forEach((m, i) => {
          if (i === members.length - 1) {
            newPercents[m.id] = String(Math.round((100 - currentSum) * 10) / 10); // 最後の人
          } else {
            const val = Math.round((Number(customAmounts[m.id] || 0) / total * 100) * 10) / 10;
            newPercents[m.id] = String(val);
            currentSum += val;
          }
        });
      } else {
        // 均等から
        const per = Math.round((100 / members.length) * 10) / 10;
        let currentSum = 0;
        members.forEach((m, i) => {
          if (i === members.length - 1) {
            newPercents[m.id] = String(Math.round((100 - currentSum) * 10) / 10);
          } else {
            newPercents[m.id] = String(per);
            currentSum += per;
          }
        });
      }
      setCustomPercents(newPercents);
    }

    setSplitMode(newMode);
  };

  // 差額計算
  const getRemainingAmount = () => {
    const total = Number(amount);
    const currentSum = Object.values(customAmounts).reduce((sum, val) => sum + Number(val), 0);
    return total - currentSum;
  };

  const getRemainingPercent = () => {
    const currentSum = Object.values(customPercents).reduce((sum, val) => sum + Number(val), 0);
    return Math.round((100 - currentSum) * 10) / 10;
  };

  // 登録実行
  const handleAddPayment = async () => {
    const numAmount = Number(amount);
    if (!title || numAmount <= 0) {
      alert("タイトルと金額を入力してください");
      return;
    }

    const members = getAllMembers();
    
    // 型定義を追加
    const allParticipants: { name: string; percentage: number; linked_user_id?: string }[] = [];

    // バリデーション
    if (splitMode === 'amount' && getRemainingAmount() !== 0) {
      alert(`金額が一致しません (ズレ: ${getRemainingAmount()}円)`);
      return;
    }
    if (splitMode === 'percent' && getRemainingPercent() !== 0) {
      alert(`割合が100%になりません (残り: ${getRemainingPercent()}%)`);
      return;
    }

    // データ作成
    members.forEach(m => {
      let percentage = 0;
      
      if (splitMode === 'even') {
        percentage = 100 / members.length; 
      } else if (splitMode === 'amount') {
        percentage = (Number(customAmounts[m.id] || 0) / numAmount) * 100;
      } else if (splitMode === 'percent') {
        percentage = Number(customPercents[m.id] || 0);
      }

      const friendObj = selectedFriends.find(f => f.friend_id === m.id);
      const linkedId = m.id === 'self' ? undefined : (friendObj ? friendObj.friend_id : undefined);

      allParticipants.push({
        name: m.name,
        percentage: percentage,
        linked_user_id: linkedId
      });
    });

    // 均等の場合の端数処理補正
    if (splitMode === 'even') {
        const count = members.length;
        const per = Math.floor(100 / count);
        const remainder = 100 % count;
        allParticipants.forEach((p, i) => {
            p.percentage = per + (i < remainder ? 1 : 0);
        });
    }

    await addPayment(title, numAmount, allParticipants, message);

    // リセット
    setAmount('');
    setTitle('');
    setMessage('');
    setSelectedFriends([]);
    setManualParticipants([]);
    setSplitMode('even');
    setIsExpanded(false);
    alert("登録しました！");
  };

  // 入力ヘルパー
  const handleAmountChange = (id: string, val: string) => setCustomAmounts(prev => ({ ...prev, [id]: val }));
  const handlePercentChange = (id: string, val: string) => setCustomPercents(prev => ({ ...prev, [id]: val }));

  // 残りを埋めるボタン
  const fillRemAmount = (id: string) => {
    const currentVal = Number(customAmounts[id] || 0);
    handleAmountChange(id, String(currentVal + getRemainingAmount()));
  };
  const fillRemPercent = (id: string) => {
    const currentVal = Number(customPercents[id] || 0);
    handlePercentChange(id, String(Math.round((currentVal + getRemainingPercent()) * 10) / 10));
  };

  // 友達追加・手入力追加
  const toggleFriend = (friend: Friend) => {
    if (selectedFriends.find(f => f.friend_id === friend.friend_id)) {
      setSelectedFriends(selectedFriends.filter(f => f.friend_id !== friend.friend_id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };
  const addManualParticipant = () => {
    if (manualNameInput.trim()) {
      setManualParticipants([...manualParticipants, manualNameInput.trim()]);
      setManualNameInput('');
    }
  };

  return (
    <div className="bg-lime-200/90 backdrop-blur-sm text-gray-800 p-6 rounded-3xl shadow-xl border border-white/40 transition-all duration-300">
      
      {/* 金額入力 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-600 mb-1">支払い金額</label>
        <div className="relative">
          <BsCurrencyYen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
          <input 
            type="number" 
            placeholder="0" 
            className="w-full pl-10 pr-4 py-3 bg-white/80 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 text-2xl font-bold text-gray-800 placeholder-gray-300 shadow-inner"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="animate-fade-in space-y-5">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">何の支払い？</label>
            <input 
              type="text" 
              placeholder="例: 焼肉、タクシー代" 
              className="w-full px-4 py-2 bg-white/80 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* メンバー選択 */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">誰と割り勘？</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {friends.map(friend => {
                const isSelected = selectedFriends.some(f => f.friend_id === friend.friend_id);
                return (
                  <button
                    key={friend.friend_id}
                    onClick={() => toggleFriend(friend)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-all border ${
                      isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white/50 text-gray-600 border-transparent'
                    }`}
                  >
                    {isSelected && <BsPersonFill />}
                    {friend.display_name}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                placeholder="リストにない人"
                className="flex-1 px-3 py-2 bg-white/60 rounded-lg text-sm border-none shadow-inner"
                value={manualNameInput}
                onChange={(e) => setManualNameInput(e.target.value)}
              />
              <button onClick={addManualParticipant} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1 rounded-lg text-sm font-bold">追加</button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 rounded-md bg-gray-600 text-white text-xs font-bold">自分</span>
              {selectedFriends.map(f => (
                <span key={f.friend_id} className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">{f.display_name}</span>
              ))}
              {manualParticipants.map((name, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1">
                  {name}
                  <button onClick={() => setManualParticipants(manualParticipants.filter((_, idx) => idx !== i))} className="hover:text-red-500"><BsXCircle /></button>
                </span>
              ))}
            </div>
          </div>

          {/* ★モード切替タブ */}
          <div className="bg-white/40 p-1 rounded-xl flex mb-2 shadow-inner">
            <button 
              onClick={() => changeMode('even')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${splitMode === 'even' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-white/20'}`}
            >
              均等
            </button>
            <button 
              onClick={() => changeMode('amount')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${splitMode === 'amount' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-white/20'}`}
            >
              金額 (円)
            </button>
            <button 
              onClick={() => changeMode('percent')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${splitMode === 'percent' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-white/20'}`}
            >
              割合 (%)
            </button>
          </div>

          {/* ★個別入力エリア (金額 or 割合) */}
          {splitMode !== 'even' && (
            <div className="bg-white/40 p-4 rounded-xl space-y-3 animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-300/50 pb-2">
                <span>メンバー</span>
                <span>{splitMode === 'amount' ? '負担額 (円)' : '負担割合 (%)'}</span>
              </div>
              
              {getAllMembers().map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-gray-700 truncate w-1/3">{member.name}</span>
                  <div className="relative flex-1">
                    {/* ★修正箇所: pl-3 pr-8 で右側に余白を作り、単位を right-3 に寄せました */}
                    <input
                      type="number"
                      value={splitMode === 'amount' ? (customAmounts[member.id] || '') : (customPercents[member.id] || '')}
                      onChange={(e) => splitMode === 'amount' ? handleAmountChange(member.id, e.target.value) : handlePercentChange(member.id, e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-right bg-white rounded-lg border-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                      {splitMode === 'amount' ? '円' : '%'}
                    </span>
                  </div>
                  {/* 残り埋めボタン */}
                  <button 
                    onClick={() => splitMode === 'amount' ? fillRemAmount(member.id) : fillRemPercent(member.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    title="残りをこの人に追加"
                  >
                    <BsCalculator />
                  </button>
                </div>
              ))}

              {/* 合計チェック */}
              <div className={`mt-3 p-2 rounded-lg text-center font-bold text-sm flex justify-center items-center gap-2 ${
                (splitMode === 'amount' ? getRemainingAmount() : getRemainingPercent()) === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {(splitMode === 'amount' ? getRemainingAmount() : getRemainingPercent()) === 0 ? (
                  <><BsCheckCircle /> OK!</>
                ) : (
                  <>あと {splitMode === 'amount' ? `${getRemainingAmount()} 円` : `${getRemainingPercent()} %`}</>
                )}
              </div>
            </div>
          )}

          {/* 登録ボタン */}
          <div className="pt-2">
            <AnimatedButton
              onClick={handleAddPayment}
              className={`w-full py-3 text-lg shadow-lg ${
                (splitMode === 'amount' && getRemainingAmount() !== 0) || (splitMode === 'percent' && getRemainingPercent() !== 0)
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              割り勘を作成
            </AnimatedButton>
            
            <button onClick={() => setIsExpanded(false)} className="w-full mt-3 text-gray-500 text-sm font-bold hover:text-gray-700 py-2">
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}