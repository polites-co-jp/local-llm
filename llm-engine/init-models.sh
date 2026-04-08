#!/bin/bash
# Ollama モデル初期化スクリプト
# RTX 5050 Laptop (8GB VRAM) を考慮したモデル選定

set -e

OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:20302}"

echo "=== Ollama モデル初期化 ==="
echo "Ollama Host: $OLLAMA_HOST"

# Ollamaの起動を待機
echo "Ollamaの起動を待機中..."
until curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; do
  sleep 2
done
echo "Ollama 起動確認完了"

# --- Bonsai (1-bit量子化, PrismML) ---
echo ""
echo "--- Bonsai 8B (1-bit量子化, ~1.2GB) ---"
ollama pull digitsflow/bonsai-8b

# --- Qwen 2.5 (日本語性能トップクラス) ---
echo ""
echo "--- Qwen 2.5 7B (~4.7GB) ---"
ollama pull qwen2.5:7b

# --- Gemma 2 (Google, 日本語良好) ---
echo ""
echo "--- Gemma 2 9B (~5.4GB) ---"
ollama pull gemma2:9b

# --- Llama 3.1 (Meta, 多言語対応) ---
echo ""
echo "--- Llama 3.1 8B (~4.7GB) ---"
ollama pull llama3.1:8b

echo ""
echo "=== 全モデルのダウンロード完了 ==="
echo "利用可能なモデル:"
curl -s "$OLLAMA_HOST/api/tags" | python3 -m json.tool 2>/dev/null || \
  curl -s "$OLLAMA_HOST/api/tags"
