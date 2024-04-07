import { Events } from "discord.js";
import { defineEvent } from "../discord/events";
import dayjs from "dayjs";
import { createYoutubeClient, getVideoId } from "../youtube";
import { ErrorWithReaction } from "../utils/error";
import { createClient } from "microcms-ts-sdk";
import { Endpoints } from "../types/microcms";
import { client } from "../microcms";

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
      const youtube = createYoutubeClient(client);

      console.log("videoId:", videoId);

      console.log("-----");
      console.log("今月のプレイリスト");
      const monthlyPlaylist = await getOrCreateCurrentPlaylistId(
        client,
        youtube,
        currentDate
      );
      console.log("playlistId:", monthlyPlaylist.id);

      if (
        await youtube.checkVideoAlreadyExistsInPlaylist(
          monthlyPlaylist.id,
          videoId
        )
      ) {
        throw new ErrorWithReaction("🤔", "すでに存在している動画");
      }

      // プレイリストに追加する
      try {
        await youtube.insertVideoIntoPlaylist(monthlyPlaylist.id, videoId);
        console.log("=> 成功");
        await ctx.react("🥳");
      } catch {
        throw new ErrorWithReaction("🚫", "何らかの理由で追加できなかった");
      }

      console.log("-----");
      console.log("全部入りプレイリスト");
      const {
        contents: [{ playlistId: allInPlaylistId }],
      } = await client.getList({
        endpoint: "playlist",
        queries: {
          fields: ["playlistId"],
          filters: "targetMonth[equals]ALLIN",
        },
      });

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

      if (monthlyPlaylist.created) {
        const url = new URL(Bun.env.REVALIDATE_URL!);
        url.searchParams.set("secret", Bun.env.REVALIDATE_SECRET!);
        url.searchParams.set("tag", "playlists");

        await fetch(url);
      }

      console.log("=> 成功");
    } catch (error) {
      if (error instanceof ErrorWithReaction) {
        await ctx.react(error.emoji);
        console.error(`=> Error: ${error.message}`);
      } else {
        await ctx.react("🤯");
        console.error("=> Error: 何らかの理由で追加できなかった");
        console.log(error);
      }
    }
  },
});

async function getOrCreateCurrentPlaylistId(
  microcms: ReturnType<typeof createClient<Endpoints>>,
  youtube: ReturnType<typeof createYoutubeClient>,
  currentDate: Date
): Promise<{ id: string; created: boolean }> {
  let { contents } = await microcms.getList({
    endpoint: "playlist",
    queries: {
      fields: ["playlistId"],
      filters: `targetMonth[equals]${dayjs(currentDate).format("YYYY-MM-01")}`,
    },
  });

  let playlistId = contents[0]?.playlistId;
  let created = false;

  if (!playlistId) {
    playlistId = await youtube.createPlaylist(currentDate);
    created = true;
    await microcms.create({
      endpoint: "playlist",
      content: {
        playlistId,
        targetMonth: dayjs(currentDate).format("YYYY-MM-01"),
      },
    });

    console.log("=> プレイリストを作成:", playlistId);
  }

  return { id: playlistId, created };
}
