import { Hono } from "hono";
import { HonoEnv } from "../types";
import { eq, and } from "drizzle-orm";
import {
  channels,
  channelPlaylists,
  channelMonthlyPlaylists,
} from "../db/schema";
import {
  checkVideoExistsInPlaylist,
  createPlaylist,
  insertVideoIntoPlaylist,
} from "../lib/youtube";

const playlistApp = new Hono<HonoEnv>();

playlistApp.post("/add", async (c) => {
  const apiKey = c.req.header("X-API-KEY");
  if (apiKey !== c.env.API_KEY) {
    return c.text("Unauthorized", 401);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || !body.videoId || !body.channelId) {
    return c.text("Bad Request: videoId and channelId are required", 400);
  }

  const { videoId, channelId } = body;
  const db = c.var.db;

  try {
    // 1. チャンネル設定の確認
    const channel = await db
      .select()
      .from(channels)
      .where(eq(channels.discordChannelId, channelId))
      .get();

    if (!channel) {
      return c.json(
        { 
          success: false, 
          error: "CHANNEL_NOT_FOUND", 
          message: "Channel not registered. Please register this channel first." 
        }, 
        404
      );
    }

    if (!channel.credentialId) {
      return c.json(
        { 
          success: false, 
          error: "CREDENTIAL_NOT_FOUND", 
          message: "YouTube account not linked. Please authenticate via /auth?channelId=" + channelId 
        }, 
        401
      );
    }

    const credentialId = channel.credentialId;
    const targetPlaylistIds: string[] = [];

    // 2. 静的なプレイリストの取得
    const staticPlaylists = await db
      .select()
      .from(channelPlaylists)
      .where(eq(channelPlaylists.discordChannelId, channelId));

    targetPlaylistIds.push(...staticPlaylists.map((p) => p.playlistId));

    // 3. 月間プレイリストの処理
    if (channel.createMonthlyPlaylist) {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      let monthlyPlaylist = await db
        .select()
        .from(channelMonthlyPlaylists)
        .where(
          and(
            eq(channelMonthlyPlaylists.discordChannelId, channelId),
            eq(channelMonthlyPlaylists.targetMonth, currentMonth)
          )
        )
        .get();

      if (!monthlyPlaylist) {
        // 今月のプレイリストが存在しない場合は作成
        const title = `本日のおすすめ曲まとめ ${currentMonth.replace("-", ".")}`;
        const newPlaylistId = await createPlaylist(db, credentialId, c.env, title);

        await db.insert(channelMonthlyPlaylists).values({
          discordChannelId: channelId,
          targetMonth: currentMonth,
          playlistId: newPlaylistId,
        });

        monthlyPlaylist = {
          id: 0,
          discordChannelId: channelId,
          targetMonth: currentMonth,
          playlistId: newPlaylistId,
        };
      }

      targetPlaylistIds.push(monthlyPlaylist.playlistId);
    }

    // 4. 各プレイリストへの動画追加
    if (targetPlaylistIds.length === 0) {
      return c.json({ success: true, message: "No playlists configured for this channel." });
    }

    const results = await Promise.allSettled(
      targetPlaylistIds.map(async (playlistId) => {
        const exists = await checkVideoExistsInPlaylist(db, credentialId, c.env, playlistId, videoId);
        if (exists) {
          throw new Error("ALREADY_EXISTS");
        }
        await insertVideoIntoPlaylist(db, credentialId, c.env, playlistId, videoId);
      })
    );

    const failed = results.some(
      (r) => r.status === "rejected" && r.reason.message !== "ALREADY_EXISTS"
    );

    if (failed) {
      return c.json({ success: false, error: "FAILED_TO_ADD" }, 500);
    }

    const addedCount = results.filter((r) => r.status === "fulfilled").length;
    const alreadyExistsCount = results.filter(
      (r) => r.status === "rejected" && r.reason.message === "ALREADY_EXISTS"
    ).length;

    // どのプレイリストにも追加されず、すでに存在している場合のみ ALREADY_EXISTS とみなす
    if (addedCount === 0 && alreadyExistsCount > 0) {
      return c.json({ success: false, error: "ALREADY_EXISTS" }, 409);
    }

    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    return c.text("Internal Server Error", 500);
  }
});

export default playlistApp;
