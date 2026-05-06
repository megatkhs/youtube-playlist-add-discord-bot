import { Events } from "discord.js";
import { defineEvent } from "./index";
import { ErrorWithReaction } from "../utils/error";

/** URLからvideoIdを取得する（Bot側の事前フィルタリング用） */
export function getVideoId(message: string): string | null {
  let url: URL;
  try {
    url = new URL(message);
  } catch {
    return null;
  }
  if (!url.host.endsWith("youtube.com") && !url.host.endsWith("youtu.be")) {
    return null;
  }
  return url.searchParams.get("v") || url.pathname.substring(1) || null;
}

export default defineEvent({
  name: Events.MessageCreate,
  on: async (ctx) => {
    if (ctx.author.bot) return;

    const videoId = getVideoId(ctx.content);
    if (!videoId) return;

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/playlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.API_KEY || "",
        },
        body: JSON.stringify({
          videoId,
          channelId: ctx.channelId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        if (response.status === 409 || data?.error === "ALREADY_EXISTS") {
          throw new ErrorWithReaction("🤔", "すでに存在している動画");
        }
        if (response.status === 401) {
          throw new ErrorWithReaction("🔒", "API認証エラー (X-API-KEY)");
        }
        throw new ErrorWithReaction("🚫", "何らかの理由で追加できなかった");
      }

      await ctx.react("🥳");

    } catch (error) {
      if (error instanceof ErrorWithReaction) {
        await ctx.react(error.emoji);
        console.error(`=> Error: ${error.message}`);
      } else {
        await ctx.react("🤯");
        console.error("=> Error: 予期せぬエラー");
        console.error(error);
      }
    }
  },
});
