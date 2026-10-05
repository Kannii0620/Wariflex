import { useState, useEffect } from 'react';
import { AnimatedButton } from './AnimatedButton';
import { usePaymentStore, type Friend, type NewParticipant } from '../store';
import { BsPersonFill, BsXCircle, BsCurrencyYen, BsCalculator, BsCheckCircle } from "react-icons/bs";

type SplitMode = 'even' | 'amount' | 'percent';
type Member = { id: string; name: string; linkedUserId?: string };
type ValueMap = Record<string, string>;

const SPLIT_MODES: { mode: SplitMode; label: string }[] = [
  { mode: 'even', label: '均等' },
  { mode: 'amount', label: '金額 (円)' },
  { mode: 'percent', label: '割合 (%)' },
];

const SELF: Member = { id: 'self', name: '自分 (立替者)' };

const round1 = (n: number) => Math.round(n * 10) / 10;

// 各メンバーの値を valueOf で決め、最後の1人で端数を調整して合計を total に合わせる
const distribute = (members: Member[], total: number, valueOf: (m: Member) => number, round = (n: number) => n): ValueMap => {
  const result: ValueMap = {};
  let sum = 0;
  members.forEach((m, i) => {
    const val = i === members.length - 1 ? round(total - sum) : valueOf(m);
    result[m.id] = String(val);
    sum += val;
  });
  return result;
};

export default function AddPayment() {
  const { addPayment, friends, fetchFriends } = usePaymentStore();

  // 基本フォーム
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // 参加者
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [manualParticipants, setManualParticipants] = useState<Member[]>([]);
  const [manualNameInput, setManualNameInput] = useState('');

  const [splitMode, setSplitMode] = useState<SplitMode>('even');

  // 個別入力値 (メンバーID -> 入力文字列)
  const [customAmounts, setCustomAmounts] = useState<ValueMap>({});
  const [customPercents, setCustomPercents] = useState<ValueMap>({});

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const members: Member[] = [
    SELF,
    ...selectedFriends.map(f => ({ id: f.friend_id, name: f.display_name, linkedUserId: f.friend_id })),
    ...manualParticipants,
  ];

  const amountOf = (id: string) => Number(customAmounts[id] || 0);
  const percentOf = (id: string) => Number(customPercents[id] || 0);

  // 差額計算（外したメンバーの入力値が残っていても数えないよう、現在のメンバーだけ合計する）
  const remainingAmount = Number(amount) - members.reduce((sum, m) => sum + amountOf(m.id), 0);
  const remainingPercent = round1(100 - members.reduce((sum, m) => sum + percentOf(m.id), 0));
  const remaining = splitMode === 'amount' ? remainingAmount : splitMode === 'percent' ? remainingPercent : 0;

  // モード切り替え時に、直前のモードの内容を引き継いで初期値を入れる
  const changeMode = (newMode: SplitMode) => {
    const total = Number(amount);
    if (total > 0) {
      if (newMode === 'amount') {
        setCustomAmounts(splitMode === 'percent'
          ? distribute(members, total, m => Math.floor(total * (percentOf(m.id) / 100)))
          : distribute(members, total, () => Math.floor(total / members.length)));
      } else if (newMode === 'percent') {
        setCustomPercents(splitMode === 'amount'
          ? distribute(members, 100, m => round1(amountOf(m.id) / total * 100), round1)
          : distribute(members, 100, () => round1(100 / members.length), round1));
      }
    }
    setSplitMode(newMode);
  };

  const resetForm = () => {
    setAmount('');
    setTitle('');
    setMessage('');
    setSelectedFriends([]);
    setManualParticipants([]);
    setManualNameInput('');
    setCustomAmounts({});
    setCustomPercents({});
    setSplitMode('even');
    setIsExpanded(false);
  };

  const handleAddPayment = async () => {
    const numAmount = Number(amount);
    if (!title || numAmount <= 0) {
      alert("タイトルと金額を入力してください");
      return;
    }
    if (splitMode === 'amount' && remainingAmount !== 0) {
      alert(`金額が一致しません (ズレ: ${remainingAmount}円)`);
      return;
    }
    if (splitMode === 'percent' && remainingPercent !== 0) {
      alert(`割合が100%になりません (残り: ${remainingPercent}%)`);
      return;
    }

    const evenBase = Math.floor(100 / members.length);
    const evenRemainder = 100 % members.length;

    const participants: NewParticipant[] = members.map((m, i) => ({
      name: m.name,
      percentage:
        splitMode === 'even' ? evenBase + (i < evenRemainder ? 1 : 0)
        : splitMode === 'amount' ? (amountOf(m.id) / numAmount) * 100
        : percentOf(m.id),
      linked_user_id: m.linkedUserId,
    }));

    const success = await addPayment(title, numAmount, participants, message);
    if (!success) {
      alert("登録に失敗しました。時間をおいてもう一度お試しください。");
      return;
    }

    resetForm();
    alert("登録しました！");
  };

  const handleAmountChange = (id: string, val: string) => setCustomAmounts(prev => ({ ...prev, [id]: val }));
  const handlePercentChange = (id: string, val: string) => setCustomPercents(prev => ({ ...prev, [id]: val }));

  // 残りをこのメンバーに上乗せする
  const fillRemaining = (id: string) => {
    if (splitMode === 'amount') {
      handleAmountChange(id, String(amountOf(id) + remainingAmount));
    } else {
      handlePercentChange(id, String(round1(percentOf(id) + remainingPercent)));
    }
  };

  const toggleFriend = (friend: Friend) => {
    if (selectedFriends.some(f => f.friend_id === friend.friend_id)) {
      setSelectedFriends(selectedFriends.filter(f => f.friend_id !== friend.friend_id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const addManualParticipant = () => {
    const name = manualNameInput.trim();
    if (name) {
      setManualParticipants([...manualParticipants, { id: crypto.randomUUID(), name }]);
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
        <div className="space-y-5">
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
                    className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white/50 text-gray-600 border-transparent'
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
              {manualParticipants.map(p => (
                <span key={p.id} className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1">
                  {p.name}
                  <button onClick={() => setManualParticipants(manualParticipants.filter(other => other.id !== p.id))} className="hover:text-red-500"><BsXCircle /></button>
                </span>
              ))}
            </div>
          </div>

          {/* モード切替タブ */}
          <div className="bg-white/40 p-1 rounded-xl flex mb-2 shadow-inner">
            {SPLIT_MODES.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${splitMode === mode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-white/20'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 個別入力エリア (金額 or 割合) */}
          {splitMode !== 'even' && (
            <div className="bg-white/40 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-300/50 pb-2">
                <span>メンバー</span>
                <span>{splitMode === 'amount' ? '負担額 (円)' : '負担割合 (%)'}</span>
              </div>

              {members.map((member) => (
                <div key={member.id} className="space-y-2 border-b border-white/20 pb-3 last:border-none">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-gray-700 truncate w-1/3">{member.name}</span>

                    <div className="relative flex-1">
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

                    <button
                      onClick={() => fillRemaining(member.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="残りをこの人に追加"
                    >
                      <BsCalculator />
                    </button>
                  </div>

                  {/* 割合モードの時だけスライダーと目安金額を表示 */}
                  {splitMode === 'percent' && (
                    <div className="px-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={customPercents[member.id] || 0}
                        onChange={(e) => handlePercentChange(member.id, e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-gray-500 font-bold">
                          目安: ¥{Math.floor(Number(amount) * (percentOf(member.id) / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 合計チェック */}
              <div className={`mt-3 p-2 rounded-lg text-center font-bold text-sm flex justify-center items-center gap-2 ${remaining === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {remaining === 0 ? (
                  <><BsCheckCircle /> OK!</>
                ) : (
                  <>あと {remaining} {splitMode === 'amount' ? '円' : '%'}</>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 登録ボタン */}
      <div className="pt-2">
        <AnimatedButton
          onClick={handleAddPayment}
          className={`w-full py-3 text-lg shadow-lg ${remaining !== 0
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
  )
}
