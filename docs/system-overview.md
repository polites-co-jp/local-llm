# システム概要

## 目的

ローカル環境でLLM（大規模言語モデル）を動作させ、APIおよびチャットUIを通じて利用するためのパッケージ。

## 主な機能

- 複数のLLMモデルの管理・切り替え
- REST API経由でのLLM推論実行
- ブラウザベースのチャットインターフェース
- GPU（NVIDIA / AMD）を利用した高速推論

## 対応モデル

| モデル | パラメータ数 | 特徴 |
|--------|-------------|------|
| Bonsai 8B | 8B | PrismML製 1-bit量子化、超軽量（~1.2GB） |
| Qwen 2.5 7B | 7B | 日本語性能トップクラス |
| Gemma 2 9B | 9B | Google製、日本語良好 |
| Llama 3.1 8B | 8B | Meta製、多言語対応 |

## 動作要件

- Docker / Docker Compose
- NVIDIA GPU + WSL2（Windows環境の場合）
  - 推奨: RTX 5050 以上（VRAM 8GB以上）
- AMD GPU の場合は Linux + ROCm 環境が必要
