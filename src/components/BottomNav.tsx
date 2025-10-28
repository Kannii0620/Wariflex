export default function BottomNav() {
  return (
    <nav className="bg-white border-t p-2 flex justify-around text-sm text-gray-600">
      <button className="flex flex-col items-center">
        <span>🏠</span>
        ホーム
      </button>
      <button className="flex flex-col items-center">
        <span>📜</span>
        履歴
      </button>
      <button className="flex flex-col items-center">
        <span>🔔</span>
        通知
      </button>
    </nav>
  );
}