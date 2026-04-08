# 基本設計: API Service

## 役割

Chat UI と LLM Engine（Ollama）の間に位置するAPIゲートウェイ。LLMへの直接アクセスを防ぎ、将来的なビジネスロジック追加の拡張ポイントとなる。

## 技術スタック

- Python 3.12
- FastAPI
- httpx（非同期HTTPクライアント）
- sse-starlette（Server-Sent Events）
- Pydantic（リクエスト/レスポンスバリデーション）

## モジュール構成

```
app/
├── main.py                  # アプリケーションエントリポイント
├── routers/
│   ├── chat.py              # チャットAPI
│   └── models.py            # モデル管理API
└── services/
    └── ollama_client.py     # Ollama通信クライアント
```

## OllamaClient

`httpx.AsyncClient` をラップしたシングルトンクライアント。

| メソッド | 説明 |
|---------|------|
| `list_models()` | `GET /api/tags` でモデル一覧取得 |
| `chat(model, messages)` | `POST /api/chat` (stream=false) で一括応答 |
| `chat_stream(model, messages)` | `POST /api/chat` (stream=true) で AsyncGenerator を返す |
| `close()` | クライアントのクローズ（lifespan で呼び出し） |

- タイムアウト: 120秒（LLM推論の応答待ちを考慮）
- Ollama のストリーミングレスポンスは行区切りJSONで、`aiter_lines()` で1行ずつパース

## ストリーミング処理フロー

```
Chat UI → POST /api/chat (stream: true)
    → API Service: ChatRequest を受信
    → OllamaClient.chat_stream() で Ollama にストリーミングリクエスト
    → Ollama の行区切りJSON を1行ずつ読み取り
    → {"content": "...", "done": false} に変換
    → EventSourceResponse (SSE) でクライアントに配信
    → done: true で終了
```

## エラーハンドリング

- Ollama への通信失敗: HTTP 502 (Bad Gateway)
- ストリーミング中のエラー: `{"error": "...", "done": true}` をSSEで送信

## CORS

ローカル開発用途のため全オリジン許可（`allow_origins=["*"]`）。
