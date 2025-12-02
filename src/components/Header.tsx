// アプリのヘッダー部分の表示処理

export default function Header() {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-black">WariFlex</h1>
      <p className="font-sans text-gray-600 text-sm mt-1">
        このアプリで人数と金額を入力して、割り勘の金額を計算できます。
      </p>
    </div>
  );
}