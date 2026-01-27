import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { BsBellFill, BsInfoCircleFill, BsTools, BsStars } from "react-icons/bs";

export default function Notifications() {
  // お知らせデータ（今は手書きでOK！あとでDBから取ることもできます）
  const notifications = [
    {
      id: 1,
      date: '2026/01/27',
      title: '登録完了画面を修正！',
      category: 'update', // update, info, bugfix
      content: '登録完了画面に修正を加えました。これでアニメーションが走り、ちょっと豪華になりました。'
    },
    {
      id: 2,
      date: '2026/01/20',
      title: '履歴機能＆CSV出力を追加！',
      category: 'update', // update, info, bugfix
      content: '精算した履歴を保存できるようになりました。CSVでダウンロードも可能です。'
    },
    {
      id: 3,
      date: '2026/01/20',
      title: '計算ロジックを改善しました',
      category: 'bugfix',
      content: '「3円が4円になる」などの端数計算の誤差が出ないように、計算システムを「最大剰余方式」にアップデートしました。'
    },
    {
      id: 4,
      date: '2026/01/15',
      title: 'WariFlex リリース！',
      category: 'info',
      content: '割り勘をスムーズにするアプリ「WariFlex」をリリースしました。これからどんどん機能を追加していきます！'
    }
  ];

  // アイコンを出し分ける関数
  const getIcon = (category: string) => {
    switch (category) {
      case 'update': return <BsStars className="text-yellow-500" />;
      case 'bugfix': return <BsTools className="text-rose-500" />;
      default: return <BsInfoCircleFill className="text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 p-4 pb-24">
      <div className="max-w-md mx-auto">
        <Header />
        
        <div className="p-4 animate-fade-in-up">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <BsBellFill /> お知らせ
          </h1>

          <div className="space-y-4">
            {notifications.map((item) => (
              <div key={item.id} className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/20">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 p-2 rounded-full">
                      {getIcon(item.category)}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{item.date}</span>
                  </div>
                </div>
                
                <h2 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <BottomNav />
      </div>
    </div>
  );
}