# YouTube Playlist Add Discord Bot

Discord チャンネルに投稿された YouTube の URL を自動で検知し、指定された YouTube プレイリストに自動で追加するボットです。

## アーキテクチャ

このプロジェクトは Bun Workspaces を利用したモノレポ構成になっており、2つのマイクロサービスで構成されています。

- **`apps/bot`**: Discord 上のメッセージを監視し、YouTube URL を検知したら API へリクエストを送信する軽量なクライアント。
- **`apps/api`**: Cloudflare Workers (Hono + D1) 上で稼働するサーバーレスバックエンド。YouTube API の OAuth 認証管理やプレイリスト操作、データベース管理を担います。

## セットアップ

### 依存関係のインストール

プロジェクトルートで以下のコマンドを実行します。

```bash
bun install
```

### 環境変数の設定

各アプリケーションディレクトリにあるテンプレートファイルをコピーして環境変数を設定してください。

**API側 (`apps/api/.dev.vars`)**
```bash
cp apps/api/.dev.vars.sample apps/api/.dev.vars
# .dev.vars を編集し、YouTube API の認証情報や API_KEY を設定してください
```

**Bot側 (`apps/bot/.env`)**
```bash
cp apps/bot/.env.sample apps/bot/.env
# .env を編集し、Discord Token や API の URL、API_KEY を設定してください
```

### データベースのセットアップ (API)

Cloudflare D1 データベースのマイグレーションを実行してテーブルを作成します。

```bash
# ローカル開発用
bun run --filter @yt-playlist-bot/api db:migrate:local

# 本番用 (Wrangler で D1 を作成後、wrangler.jsonc の database_id を更新してから実行)
bun run --filter @yt-playlist-bot/api db:migrate:remote
```

## 開発サーバーの起動

**APIの起動**
```bash
bun run --filter @yt-playlist-bot/api dev
```

**Botの起動**
```bash
bun run --filter @yt-playlist-bot/bot dev
```

## OAuth 認証 (初回のみ)

API サーバーを起動後、ブラウザで `http://localhost:8787/auth` にアクセスし、YouTube アカウントへのアクセスを許可してください。完了すると OAuth トークンが D1 データベースに保存され、ボットが機能するようになります。
