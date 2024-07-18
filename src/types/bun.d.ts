declare module 'bun' {
  interface Env {
    DISCORD_TOKEN: string
    DISCORD_GUILD_ID: string
    DISCORD_CHANNEL_ID: string
    DISCORD_CLIENT_ID: string
    YOUTUBE_API_CLIENT_ID: string
    YOUTUBE_API_CLIENT_SECRET: string
    YOUTUBE_API_REDIRECT_URL: string
    MICROCMS_SERVICE_DOMAIN: string
    MICROCMS_API_KEY: string
    REVALIDATE_URL: string
    REVALIDATE_SECRET: string
    DATABASE_URL: string
  }
}
