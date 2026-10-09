# WariFlex

![WariFlex Banner](public/banner.png)
![WariFlex Banner](public/subBanner.png)

WariFlex は、立て替えた支払いを記録して割り勘を管理する Web アプリです。
均等割りだけでなく、金額や割合を人ごとに指定でき、友達登録した相手には請求を送って承認してもらえます。

**🚀 サイト (Vercel):** https://wariflex.vercel.app/

---

## 📦 主な機能

- **割り勘の作成**: 金額・タイトル・メンバーを入れて登録。分け方は「均等」「金額 (円)」「割合 (%)」の3モード
- **端数の自動調整**: 1円単位の端数は自動で配分し、合計が必ず支払い金額と一致
- **友達登録**: ユーザーIDで検索して登録。登録していない人は名前の手入力でも追加可能
- **請求の通知**: 友達をメンバーに入れると相手に請求が届き、相手は承認 / 拒否できる
- **精算と履歴**: 精算が済んだ支払いは履歴に移動。履歴は個別削除・全削除に対応
- **CSV 出力**: 支払いごとの内訳を CSV でダウンロード
- **アカウント管理**: 表示名の変更、パスワード変更、ログアウト、アカウント削除
- **PWA 対応**: ホーム画面に追加してアプリのように使える

---

## 🛠 使用技術

| 技術 | 用途 |
|---|---|
| React 18 + TypeScript | UI |
| Vite 7 | 開発サーバー・ビルド |
| Tailwind CSS v4 | スタイリング |
| Zustand | 状態管理 |
| React Router v7 | ルーティング |
| Supabase | 認証・データベース (PostgreSQL) |
| Framer Motion | アニメーション |
| vite-plugin-pwa | PWA 対応 |
| ESLint | 静的解析 |
| Vercel | ホスティング |

---

## ⚙️ 開発環境セットアップ

### 必要環境

- Node.js 20.19 以上
- Supabase のプロジェクト

### 手順

依存パッケージをインストールします。

```bash
npm install
```

プロジェクト直下に `.env` を作り、Supabase の接続情報を入れます（`.env` は git の管理対象外です）。

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

開発サーバーを起動します。

```bash
npm run dev
```

### スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 型チェックのうえ本番ビルド |
| `npm run preview` | ビルド結果をローカルで確認 |
| `npm run lint` | ESLint を実行 |

### デプロイ

Vercel にデプロイする場合は、プロジェクトの環境変数に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください。
`vercel.json` の Content-Security-Policy には Supabase プロジェクトの URL を直接書いているため、別のプロジェクトにつなぐ場合はそこも書き換えが必要です。

---

## 🗄 データベース

Supabase (PostgreSQL) 上の次のテーブルを使います。ユーザー本体は Supabase Auth の `auth.users` で、`profiles.id` がそれに対応します。

### `profiles` — ユーザーのプロフィール

| 列 | 型 | 内容 |
|---|---|---|
| `id` | uuid | 主キー。`auth.users.id` と同じ値 |
| `username` | text | 友達検索に使うユーザーID |
| `display_name` | text | 表示名 |
| `avatar_url` | text | アイコン画像（現在は未使用） |

### `friends` — 友達登録

| 列 | 型 | 内容 |
|---|---|---|
| `id` | uuid | 主キー |
| `user_id` | uuid | 登録した側のユーザー |
| `friend_id` | uuid | 登録された側のユーザー (`profiles.id`) |
| `created_at` | timestamptz | 登録日時 |

### `payments` — 支払い

| 列 | 型 | 内容 |
|---|---|---|
| `id` | uuid | 主キー |
| `title` | text | タイトル |
| `total_amount` | int4 | 合計金額（円） |
| `status` | text | `active`（未精算）/ `history`（精算済み） |
| `message` | text | メモ |
| `user_id` | uuid | 作成者（立て替えた人） |
| `participant_ids` | text[] | 参加している登録ユーザーのID一覧 |
| `created_at` | timestamptz | 作成日時 |
| `completed_at` | timestamptz | 精算完了日時 |

### `participants` — 支払いごとの参加者

| 列 | 型 | 内容 |
|---|---|---|
| `id` | uuid | 主キー |
| `payment_id` | uuid | 対象の支払い (`payments.id`) |
| `name` | text | 表示する名前 |
| `percentage` | float8 | 負担割合（%） |
| `linked_user_id` | uuid | 登録ユーザーの場合はそのID。手入力の人は空 |
| `status` | text | 請求の状態 `pending` / `approved` / `rejected` |
| `user_id` | uuid | 支払いの作成者 |
| `owner_id` | uuid | （アプリからは未使用） |
| `updated_at` | timestamptz | 更新日時 |

### `participants_audit` — 参加者の変更履歴

`participants` への変更を記録する監査用テーブルです。アプリからは直接読み書きしません。
変更前後の内容に加えて、`operation`（操作の種類）、`changed_by`（変更者）、`change_ts`（変更日時）を持ちます。

### 関数

| 名前 | 内容 |
|---|---|
| `delete_own_account()` | ログイン中のユーザー自身のアカウントを削除する (RPC) |

---

## 📁 ディレクトリ構成

```
src/
├── main.tsx          ルーティング定義
├── App.tsx           ホーム画面
├── AuthGuard.tsx     未ログイン時にログイン画面を出す
├── store.ts          Zustand ストア（Supabase とのやり取り）
├── supabase.ts       Supabase クライアント
├── lib/
│   └── split.ts      割り勘計算と CSV 出力
├── components/       ヘッダー・下部ナビ・入力フォームなど
└── pages/            履歴・通知・設定・プロフィール・ログイン
```
