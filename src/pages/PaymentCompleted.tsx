export default function About() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">登録完了！</h1>
      <p className="text-gray-700">
        精算リストへの登録処理は正常に完了しました。
        《未精算の支払いリスト》より、お支払いしてください。

        {/* ここに支払いのリザルトを表示 */}
      </p>
    </div>
  );
}