import type { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

// ログイン後の各ページ共通の枠（背景グラデーション + ヘッダー + 下部ナビ）
export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 pb-24">
      <div className="max-w-md mx-auto p-4 text-white">
        <Header />
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
