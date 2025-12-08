# Wariflex

Wariflex は、割り勘の支払いを記録・管理する Web アプリケーションです。  
React + TypeScript + Vite をベースに構築されており、Tailwind CSS によるスタイリングと、シンプルなコンポーネント構成で構成されています。

---

**🚀 デモサイト (Vercel):** **[https://vercel.com/kannii0620s-projects/wariflex/3nrproGr13YjWKdfp42mH2cTEB5b]**

## 📦 主な機能

- 金額の入力
- 割り勘モードの選択（均等割り勘 / 片方が多め）
- 支払いの偏り指定（スライダー + セレクト）
- 支払い履歴の表示（静的）
- ナビゲーションバーによる画面切り替え（ホーム / 履歴 / 通知）

---

## 🛠 使用技術

| 技術         | 用途                                      |
|--------------|-------------------------------------------|
| React        | UI構築（コンポーネントベース）            |
| TypeScript   | 型安全な開発                              |
| PostgreSQL    |データベース（データの永続化）   　　　　　　|
| Vite         | 開発環境・ビルドツール（HMR対応）         |
| Tailwind CSS | スタイリング（ユーティリティクラス）      |
| ESLint       | 静的解析とコード品質管理                  |
| Google Fonts | カスタムフォント（任意）                  |
| Vercel       | Web アプリケーションのホスティングと公開   |

---

## ⚙️ 開発環境セットアップ

### 必要環境

- Node.js v18 以上
- npm v9 以上

### インストール

```bash
npm install

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])

import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])