import { google, youtube_v3 } from "googleapis";
import { dayjs } from "./dayjs";
import { ErrorWithReaction } from "./utils/error";
import { PrismaClient } from "./prisma";
import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";
import { GaxiosError } from "gaxios";

/** URLからvideoIdを取得する */
export function getVideoId(message: string) {
  let url: URL;

  try {
    url = new URL(message);
  } catch {
    throw new ErrorWithReaction("😶‍🌫️", "URLではない");
  }

  if (!url.host.endsWith("youtube.com") && !url.host.endsWith("youtu.be")) {
    throw new ErrorWithReaction("😶‍🌫️", "YouTubeのURLではない");
  }

  const videoId = url.searchParams.get("v") || url.pathname.substring(1);
  if (!videoId) {
    throw new ErrorWithReaction("😶‍🌫️", "URLにVideoIDが存在しない");
  }

  return videoId;
}

export function createYoutubeClient(prisma: PrismaClient) {
  let _client: youtube_v3.Youtube | undefined;

  const getClient = async () => {
    if (!_client) {
      const tokens = await prisma.findAuthToken();
      const auth = new google.auth.OAuth2({
        clientId: process.env.YOUTUBE_API_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_API_CLIENT_SECRET,
      });
      auth.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      _client = new youtube_v3.Youtube({ auth });
    }

    return _client;
  };

  /** Youtube上にプレイリストを作成する */
  const createPlaylist = async (date: Date): Promise<string> => {
    const client = await getClient();
    const result = await client.playlists.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: `本日のおすすめ曲まとめ ${dayjs(date).format("YYYY.MM")}`,
        },
        status: {
          privacyStatus: "public",
        },
      },
    });

    return result.data.id!;
  };

  /** 動画Idがすでにプレイリストに保存されているか確認する */
  const checkVideoAlreadyExistsInPlaylist = async (
    playlistId: string,
    videoId: string
  ): Promise<boolean> => {
    const client = await getClient();
    const result = await client.playlistItems.list({
      part: [],
      playlistId,
      videoId,
    });

    return result.data.items!.length > 0;
  };

  /** 動画をプレイリストに追加する */
  const insertVideoIntoPlaylist = async (
    playlistId: string,
    videoId: string
  ): Promise<void> => {
    const client = await getClient();
    await client.playlistItems.insert({
      part: ["snippet"],
      requestBody: {
        snippet: {
          playlistId,
          position: 0,
          resourceId: {
            videoId,
            kind: "youtube#video",
          },
        },
      },
    });
  };

  return {
    createPlaylist,
    checkVideoAlreadyExistsInPlaylist,
    insertVideoIntoPlaylist,
  };
}
