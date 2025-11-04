// 支払いのリスト登録、編集処理
export default function PaymentList() {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="font-semibold mb-2">＜未精算の支払いリスト＞</h2>
      <ul className="space-y-2">
        {/* 下は一例 */}
        <li className="flex justify-between">
          <span>サークル</span>
          <span>¥2,440</span>
        </li>
        <li className="flex justify-between">
          <span>田中さんと飲み会</span>
          <span>¥4,860</span>
        </li>
      </ul>
    </div>
  );
}