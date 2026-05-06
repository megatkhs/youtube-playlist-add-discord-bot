FROM oven/bun:1 as base
WORKDIR /usr/src/app

# ルートの package.json / bun.lockb と、全ワークスペースの package.json をコピー
COPY package.json bun.lockb ./
COPY apps/bot/package.json ./apps/bot/
COPY apps/api/package.json ./apps/api/

# 本番環境向けの依存関係のみインストール
RUN bun install --frozen-lockfile --production

# Botのソースコードをコピー
COPY apps/bot/src ./apps/bot/src

# 実行ユーザーをbunに変更
USER bun

# 環境変数を指定 (本番デプロイ時に上書きされる想定)
ENV NODE_ENV=production

# 実行
WORKDIR /usr/src/app/apps/bot
CMD ["bun", "run", "src/index.ts"]
