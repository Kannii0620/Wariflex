import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800">
      <div className="max-w-md mx-auto p-8"> 
        
        <h1 className="text-3xl text-white font-bold mb-4">この機能は近日実装予定です！</h1>
        
        <p className="text-white">
          この機能は未実装のため、利用できません。<br /> 
          近日中の実装をお待ちください。
        </p>

        <Link 
          to="/" 
          className="mt-8 inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
        >
          ホームに戻る
        </Link>

      </div>
    </div>
  )
}