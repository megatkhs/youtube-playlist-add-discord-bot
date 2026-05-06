import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** OAuth認証トークン */
export const credentials = sqliteTable("credentials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
});

/** Discordチャンネル設定 */
export const channels = sqliteTable("channels", {
  discordChannelId: text("discord_channel_id").primaryKey(),
  createMonthlyPlaylist: integer("create_monthly_playlist", {
    mode: "boolean",
  })
    .notNull()
    .default(true),
});

/** チャンネルに紐づく静的プレイリスト（全部入り等）: 1対多 */
export const channelPlaylists = sqliteTable("channel_playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  discordChannelId: text("discord_channel_id")
    .notNull()
    .references(() => channels.discordChannelId),
  playlistId: text("playlist_id").notNull(),
});

/** チャンネルに紐づく月間プレイリスト（自動生成される履歴） */
export const channelMonthlyPlaylists = sqliteTable(
  "channel_monthly_playlists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    discordChannelId: text("discord_channel_id")
      .notNull()
      .references(() => channels.discordChannelId),
    targetMonth: text("target_month").notNull(),
    playlistId: text("playlist_id").notNull(),
  }
);
