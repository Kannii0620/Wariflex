export default function AddPayment() {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <label className="block mb-2 font-semibold">新たな支払いを追加</label>
      <input type="number" placeholder="¥ 金額を入力" className="w-full border p-2 rounded mb-2" />
      <label className="flex items-center mb-2">
        <input type="checkbox" className="mr-2" />
        均等割り勘モード
      </label>
      <div className="mb-2">
        <label className="block text-sm mb-1">支払い1</label>
        <input type="range" className="w-full" />
        <select className="w-full border p-2 rounded mt-2">
          <option>俺が多めに</option>
          <option>田中さんが多めに</option>
        </select>
      </div>
      <button className="bg-purple-500 text-white px-4 py-2 rounded mt-2">支払いを追加する</button>
    </div>
  );
}