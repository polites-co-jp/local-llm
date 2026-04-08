# 基本設計: Chat UI

## 役割

ユーザーがLLMとチャット形式で対話するためのWebインターフェース。API Service を経由してLLMにアクセスする。

## 技術スタック

- Next.js 15 (App Router)
- React 19
- TypeScript（厳密モード）
- Tailwind CSS v4
- standalone ビルド出力

## コンポーネント設計

### ChatWindow（状態管理の中心）

```
ChatWindow
├── ModelSelector     # モデル選択
├── MessageList       # メッセージ一覧
└── MessageInput      # テキスト入力
```

**管理する状態:**

| 状態 | 型 | 説明 |
|------|------|------|
| `messages` | `Message[]` | チャット履歴 |
| `selectedModel` | `string` | 選択中のモデル名 |
| `isLoading` | `boolean` | 応答待ち状態 |

**送信処理フロー:**

1. ユーザーメッセージを `messages` に追加
2. 空の assistant メッセージを追加（ストリーミング先）
3. `sendMessage()` でAPI呼び出し
4. SSEチャンクごとに assistant メッセージの `content` を追記
5. 完了またはエラーで `isLoading` を解除

### ModelSelector

- 初回マウント時に `fetchModels()` でモデル一覧を取得
- 最初のモデルを自動選択
- エラー時は赤色テキストで表示

### MessageList

- ユーザー: 右寄せ、青背景 (`bg-blue-600`)
- アシスタント: 左寄せ、グレー背景 (`bg-gray-700`)
- ストリーミング中の最後のメッセージにパルスカーソル表示
- 新メッセージ追加時に自動スクロール (`scrollIntoView`)

### MessageInput

- `<textarea>` による入力（自動リサイズ、最大200px）
- Enter: 送信 / Shift+Enter: 改行
- 送信中は `disabled` でUI無効化

## API通信 (`lib/api.ts`)

### fetchModels()

`GET /api/models` → `Model[]` を返却。

### sendMessage()

`POST /api/chat` (stream: true) で SSE ストリーミング。

処理方式:
- `fetch` API + `ReadableStream.getReader()` でバイナリチャンクを読み取り
- `TextDecoder` でデコード後、改行で分割
- `data:` プレフィックスを除去してJSONパース
- `onChunk` コールバックで `content` を逐次返却
- バッファリングにより不完全な行をまたいだ読み取りに対応

## UIデザイン

- ダークモードデフォルト (`bg-gray-900`)
- 画面全体を使用 (`h-screen`)
- レスポンシブ対応
