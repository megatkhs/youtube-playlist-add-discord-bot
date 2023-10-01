import { dayjs } from "./dayjs";
import { Events, createDiscordClient } from "./discord";
import { createPrismaClient } from "./prisma";
import { createYoutubeClient } from "./youtube";
import { setMonthlySchedule } from "./schedule";
import { TextChannel } from "discord.js";

async function main() {
  console.log("Bot起動中...");

  const discord = createDiscordClient();
  const youtube = createYoutubeClient();
  const prisma = createPrismaClient();

  discord.on(Events.MessageCreate, async (ctx) => {
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

    if (!url.host.endsWith("youtube.com")) {
      console.error("=> Error: YouTubeのURLではない");
      await ctx.react("😶‍🌫️");
      return;
    }

    const videoId = url.searchParams.get("v");
    if (!videoId) {
      console.error("=> Error: URLにVideoIDが存在しない");
      await ctx.react("😶‍🌫️");
      return;
    }

    const playlistId = await getOrCreateCurrentPlaylistId(currentDate);
    console.log("playlistId:", playlistId);
    console.log("videoId:", videoId);

    if (await youtube.checkVideoAlreadyExistsInPlaylist(playlistId, videoId)) {
      console.error("=> Error: すでに存在している動画");
      await ctx.react("🤔");
      return;
    }

    // プレイリストに追加する
    try {
      await youtube.insertVideoIntoPlaylist(playlistId, videoId);
      console.log("=> 成功");
      await ctx.react("🥳");
    } catch {
      console.error("=> Error: 何らかの理由で追加できなかった");
      await ctx.react("🚫");
      return;
    }
  });

  setMonthlySchedule(async () => {
    const currentDate = new Date();

    console.log("=========");
    console.log(
      "月次バッチ実行中",
      dayjs(currentDate).format("YYYY/MM/DD HH:mm:ss")
    );
    let playlistId = await getOrCreateCurrentPlaylistId(currentDate);

    const channel = discord.client.channels.cache.get(
      process.env.DISCORD_CHANNEL_ID!
    );

    if (channel instanceof TextChannel) {
      channel.send(
        `今月のプレイリストが来たぞ！\nhttps://www.youtube.com/playlist?list=${playlistId}`
      );
    }
  });

  await discord.login();
  console.log("Botが正常に起動しました", dayjs().format("YYYY/MM/DD HH:mm:ss"));

  async function getOrCreateCurrentPlaylistId(
    currentDate: Date
  ): Promise<string> {
    let playlistId = await prisma.findPlaylistId(currentDate);

    if (!playlistId) {
      playlistId = await youtube.createPlaylist(currentDate);
      prisma.savePlaylistId(playlistId, currentDate);

      console.log("=> プレイリストを作成:", playlistId);
    }

    return playlistId;
  }
}

main();
