# システム構成

## アーキテクチャ

```
ブラウザ
  │
  │ http://localhost:20300
  ▼
┌─────────────────┐
│  Chat UI        │ :20300 (Next.js 15)
│  (chat-ui)      │
└────────┬────────┘
         │ POST /api/chat, GET /api/models
         │ http://localhost:20301
         ▼
┌─────────────────┐
│  API Service    │ :20301 (FastAPI)
│  (api-service)  │
└────────┬────────┘
         │ Ollama API (内部通信)
         │ http://llm-engine:11434
         ▼
┌─────────────────┐
│  LLM Engine     │ :20302 (Ollama)
│  (llm-engine)   │ GPU パススルー
└─────────────────┘
```

## 通信フロー

1. ユーザーがブラウザで Chat UI（`:20300`）にアクセス
2. Chat UI は API Service（`:20301`）に REST リクエストを送信
3. API Service は Ollama（内部 `:11434`）に推論リクエストを中継
4. ストリーミング応答は SSE（Server-Sent Events）で Chat UI に逐次配信

**重要: Chat UI から Ollama への直接通信は行わない。必ず API Service を経由する。**

## ポート割り当て

| ポート | サービス | 用途 |
|--------|---------|------|
| 20300 | Chat UI | Next.js Web アプリケーション |
| 20301 | API Service | FastAPI REST API |
| 20302 | LLM Engine | Ollama API（外部公開用） |

※ Notion ポート管理データベースに `local-llm` プロジェクト（20300〜20399）として登録済み

## ディレクトリ構成

```
local-llm/
├── apps/                     # アプリケーションソースコード
│   ├── api-service/          # FastAPI APIサービス
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── routers/
│   │   │   │   ├── chat.py
│   │   │   │   └── models.py
│   │   │   └── services/
│   │   │       └── ollama_client.py
│   │   └── requirements.txt
│   └── chat-ui/              # Next.js チャットUI
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       ├── package.json
│       └── next.config.ts
├── llm-containers/           # コンテナ定義
│   ├── docker-compose.yml
│   ├── docker-compose.amd.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.chat-ui
│   └── init-models.sh
└── docs/                     # ドキュメント
```

## 起動方法

```bash
# NVIDIA GPU 環境
cd llm-containers
docker compose up -d

# AMD GPU (ROCm) 環境 ※ Linux のみ
cd llm-containers
docker compose -f docker-compose.yml -f docker-compose.amd.yml up -d

# モデルのダウンロード（初回のみ）
docker exec -it llm-engine bash -c "$(cat init-models.sh)"
```
