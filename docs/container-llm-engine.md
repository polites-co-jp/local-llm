# コンテナ: LLM Engine (Ollama)

## 概要

LLMモデルのロード・推論実行を担当するコンテナ。Ollamaをベースイメージとして使用し、GPU パススルーによりホストマシンのGPUリソースを利用する。

## 基本情報

| 項目 | 値 |
|------|-----|
| イメージ | `ollama/ollama`（NVIDIA）/ `ollama/ollama:rocm`（AMD） |
| コンテナ名 | `llm-engine` |
| 公開ポート | 20302 → 11434 |
| ボリューム | `ollama_data:/root/.ollama`（モデルデータ永続化） |

## GPU 設定

### NVIDIA（デフォルト）

`docker-compose.yml` で `deploy.resources.reservations.devices` を通じて全NVIDIA GPUをパススルー。

前提条件:
- WSL2 有効（Windows環境）
- NVIDIA GPU ドライバがホストにインストール済み
- Docker Desktop で WSL2 バックエンドを使用

### AMD (ROCm)

`docker-compose.amd.yml` オーバーライドを使用。`/dev/kfd` と `/dev/dri` デバイスをマウント。

制約:
- Linux 環境でのみ動作（WSL2 非対応）
- RX 6000/7000 シリーズ以降

## ヘルスチェック

```
GET http://localhost:11434/api/tags
間隔: 10秒 / タイムアウト: 5秒 / リトライ: 5回
```

API Service は LLM Engine のヘルスチェック完了後に起動する（`depends_on.condition: service_healthy`）。

## モデル管理

### 初期セットアップ

`init-models.sh` を実行して対応モデルを一括ダウンロードする。

### 個別操作

```bash
# モデルのダウンロード
docker exec llm-engine ollama pull qwen2.5:7b

# モデルの一覧
docker exec llm-engine ollama list

# モデルの削除
docker exec llm-engine ollama rm <model-name>

# モデルの実行テスト
docker exec -it llm-engine ollama run qwen2.5:7b
```

## VRAM消費量の目安（RTX 5050 Laptop / 8GB VRAM）

| モデル | モデルサイズ | 8Kコンテキスト | 32Kコンテキスト |
|--------|------------|---------------|----------------|
| Bonsai 8B | ~1.2 GB | ~2.5 GB | ~5.9 GB |
| Qwen 2.5 7B | ~4.7 GB | ~5.5 GB | ~7.5 GB |
| Gemma 2 9B | ~5.4 GB | ~6.2 GB | ~8.0 GB |
| Llama 3.1 8B | ~4.7 GB | ~5.5 GB | ~7.5 GB |

※ 8GB VRAM では1モデルずつの切り替え運用を推奨
