# コンテナ: API Service (FastAPI)

## 概要

Chat UI と LLM Engine の間に位置する REST API サービス。Ollama の API を中継し、SSE ストリーミングによるリアルタイム応答配信を行う。

## 基本情報

| 項目 | 値 |
|------|-----|
| ベースイメージ | `python:3.12-slim` |
| コンテナ名 | `api-service` |
| 公開ポート | 20301 → 8000 |
| フレームワーク | FastAPI + uvicorn |

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|------------|------|
| `OLLAMA_BASE_URL` | `http://llm-engine:11434` | Ollama の接続先URL |

## エンドポイント

### GET /api/models

利用可能なモデル一覧を取得する。

**レスポンス:**
```json
{
  "models": [
    {
      "name": "qwen2.5:7b",
      "size": 4700000000,
      "parameter_size": "7B"
    }
  ]
}
```

### POST /api/chat

LLMにチャットメッセージを送信する。

**リクエスト:**
```json
{
  "model": "qwen2.5:7b",
  "messages": [
    {"role": "user", "content": "こんにちは"}
  ],
  "stream": true
}
```

**レスポンス（stream: true）:**

SSE（Server-Sent Events）形式で逐次配信:
```
data: {"content": "こんに", "done": false}
data: {"content": "ちは", "done": false}
data: {"content": "", "done": true}
```

**レスポンス（stream: false）:**
```json
{
  "model": "qwen2.5:7b",
  "message": {"role": "assistant", "content": "こんにちは！"}
}
```

## 内部構成

| ファイル | 役割 |
|---------|------|
| `app/main.py` | FastAPI アプリ定義、CORS、ルーター登録 |
| `app/routers/chat.py` | チャットエンドポイント（SSE対応） |
| `app/routers/models.py` | モデル一覧エンドポイント |
| `app/services/ollama_client.py` | Ollama 通信クライアント（httpx） |

## 依存パッケージ

- fastapi
- uvicorn[standard]
- httpx
- pydantic
- sse-starlette
