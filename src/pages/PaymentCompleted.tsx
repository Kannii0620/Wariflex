import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4">
      <h1 className="text-2xl font-bold mb-4">登録完了！</h1>
      <p className="text-gray-700">
        精算リストへの登録処理は正常に完了しました。
        《未精算の支払いリスト》より、お支払いしてください。

        {/* ここに支払いのリザルトを表示 */}
      </p>
      <Link to="/"
        className="mt-8 inline-block bg-blue-600 text-white font-semibold mx-8 py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-150">
        ホームに戻る
      </Link>
    </div>
  );
}