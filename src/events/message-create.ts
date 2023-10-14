import { Events } from "discord.js";
import { defineEvent } from "../discord/events";
import dayjs from "dayjs";
import { createYoutubeClient } from "../youtube";
import { createPrismaClient } from "../prisma";

export default defineEvent({
  name: Events.MessageCreate,
  on: async (ctx) => {
    if (ctx.channelId !== process.env.DISCORD_CHANNEL_ID) return;
    if (ctx.author.bot) return;
    const currentDate = new Date();

    console.log("=========");
    console.log(ctx.content);
    console.log(
      "currentDate:",
      dayjs(currentDate).format("YYYY/MM/DD HH:mm:ss")
    );

    let url: URL;

    try {
      url = new URL(ctx.content);
    } catch {
      console.error("=> Error: URLではない");
      await ctx.react("😶‍🌫️");
      return;
    }

    if (!url.host.endsWith("youtube.com") && !url.host.endsWith("youtu.be")) {
      console.error("=> Error: YouTubeのURLではない");
      await ctx.react("😶‍🌫️");
      return;
    }

    const videoId = url.searchParams.get("v") || url.pathname.substring(1);
    if (!videoId) {
      console.error("=> Error: URLにVideoIDが存在しない");
      await ctx.react("😶‍🌫️");
      return;
    }
    const youtube = createYoutubeClient();
    const prisma = createPrismaClient();

    console.log("videoId:", videoId);

    console.log("-----");
    console.log("今月のプレイリスト");
    const monthlyPlaylistId = await getOrCreateCurrentPlaylistId(
      prisma,
      youtube,
      currentDate
    );
    console.log("playlistId:", monthlyPlaylistId);
    if (
      await youtube.checkVideoAlreadyExistsInPlaylist(
        monthlyPlaylistId,
        videoId
      )
    ) {
      console.error("=> Error: すでに存在している動画");
      await ctx.react("🤔");
      return;
    }

    // プレイリストに追加する
    try {
      await youtube.insertVideoIntoPlaylist(monthlyPlaylistId, videoId);
      console.log("=> 成功");
      await ctx.react("🥳");
    } catch {
      console.error("=> Error: 何らかの理由で追加できなかった");
      await ctx.react("🚫");
      return;
    }

    console.log("-----");
    console.log("全部入りプレイリスト");
    const allInPlaylistId = await prisma.findAllInPlaylistId();
    console.log("playlistId:", allInPlaylistId);
    if (
      await youtube.checkVideoAlreadyExistsInPlaylist(allInPlaylistId, videoId)
    ) {
      console.error("=> Error: すでに存在している動画");
      return;
    }

    // プレイリストに追加する
    try {
      await youtube.insertVideoIntoPlaylist(allInPlaylistId, videoId);
      console.log("=> 成功");
    } catch {
      console.error("=> Error: 何らかの理由で追加できなかった");
      return;
    }

    console.log("ここに何か");
  },
});

async function getOrCreateCurrentPlaylistId(
  prisma: ReturnType<typeof createPrismaClient>,
  youtube: ReturnType<typeof createYoutubeClient>,
  currentDate: Date
): Promise<string> {
  let playlistId = await prisma.findPlaylistIdByDate(currentDate);

  if (!playlistId) {
    playlistId = await youtube.createPlaylist(currentDate);
    prisma.savePlaylistId(playlistId, currentDate);

    console.log("=> プレイリストを作成:", playlistId);
  }

  return playlistId;
}
