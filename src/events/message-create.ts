import { Events } from "discord.js";
import { defineEvent } from "../discord/events";
import dayjs from "dayjs";
import { createYoutubeClient, getVideoId } from "../youtube";
import { createPrismaClient } from "../prisma";
import { ErrorWithReaction } from "../utils/error";

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

    try {
      const videoId = getVideoId(ctx.content);
      const prisma = createPrismaClient();
      const youtube = createYoutubeClient(prisma);

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
        throw new ErrorWithReaction("🤔", "すでに存在している動画");
      }

      // プレイリストに追加する
      try {
        await youtube.insertVideoIntoPlaylist(monthlyPlaylistId, videoId);
        console.log("=> 成功");
        await ctx.react("🥳");
      } catch {
        throw new ErrorWithReaction("🚫", "何らかの理由で追加できなかった");
      }

      console.log("-----");
      console.log("全部入りプレイリスト");
      const allInPlaylistId = await prisma.findAllInPlaylistId();
      console.log("playlistId:", allInPlaylistId);

      if (
        await youtube.checkVideoAlreadyExistsInPlaylist(
          allInPlaylistId,
          videoId
        )
      ) {
        console.error("=> Error: すでに存在している動画");
        return;
      }

      // プレイリストに追加する
      await youtube.insertVideoIntoPlaylist(allInPlaylistId, videoId);
      console.log("=> 成功");
    } catch (error) {
      if (error instanceof ErrorWithReaction) {
        await ctx.react(error.emoji);
        console.error(`=> Error: ${error.message}`);
      } else {
        await ctx.react("🤯");
        console.error("=> Error: 何らかの理由で追加できなかった");
      }
    }
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
