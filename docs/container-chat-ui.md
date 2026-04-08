# コンテナ: Chat UI (Next.js)

## 概要

ブラウザベースのチャットインターフェース。API Service を経由してLLMと対話する。

## 基本情報

| 項目 | 値 |
|------|-----|
| ベースイメージ | `node:20-alpine`（マルチステージビルド） |
| コンテナ名 | `chat-ui` |
| 公開ポート | 20300 → 3000 |
| フレームワーク | Next.js 15 (App Router) + React 19 + Tailwind CSS v4 |

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|------------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:20301` | API Service のURL（ブラウザからのアクセス用） |
| `API_INTERNAL_URL` | `http://api-service:8000` | API Service のURL（コンテナ間通信用） |

## 画面構成

- **ヘッダー**: アプリ名「Local LLM Chat」+ モデル選択ドロップダウン
- **メッセージエリア**: チャット履歴表示（自動スクロール）
  - ユーザーメッセージ: 右寄せ、青背景
  - アシスタントメッセージ: 左寄せ、グレー背景
  - ストリーミング中はカーソルアニメーション表示
- **入力エリア**: テキストエリア + 送信ボタン
  - Enter で送信、Shift+Enter で改行
  - 自動リサイズ対応

## 内部構成

| ファイル | 役割 |
|---------|------|
| `src/app/page.tsx` | ページエントリポイント |
| `src/app/layout.tsx` | レイアウト・メタデータ |
| `src/app/globals.css` | グローバルスタイル（ダークテーマ） |
| `src/components/ChatWindow.tsx` | チャット画面全体の状態管理 |
| `src/components/ModelSelector.tsx` | モデル選択ドロップダウン |
| `src/components/MessageList.tsx` | メッセージ一覧表示 |
| `src/components/MessageInput.tsx` | テキスト入力・送信 |
| `src/lib/api.ts` | API通信クライアント（SSEパース） |

## 通信仕様

- `fetchModels()`: `GET /api/models` でモデル一覧取得
- `sendMessage()`: `POST /api/chat` (stream: true) でSSEストリーミング
  - `fetch` API + `ReadableStream` でチャンクを逐次読み取り
  - `data:` プレフィックス付きJSONをパースし、コールバックでUIに反映

## Dockerfile（マルチステージビルド）

1. **deps**: `npm ci` で依存関係インストール
2. **build**: `npm run build` でアプリケーションビルド
3. **runner**: standalone 出力をコピーして `node server.js` で起動
