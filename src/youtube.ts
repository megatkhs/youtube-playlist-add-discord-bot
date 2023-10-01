import { google, youtube_v3 } from "googleapis";
import dayjs from "dayjs";
import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";

export function createYoutubeClient() {
  const auth = new google.auth.OAuth2({
    clientId: Bun.env.YOUTUBE_API_CLIENT_ID,
    clientSecret: Bun.env.YOUTUBE_API_CLIENT_SECRET,
  });
  auth.credentials = {
    access_token: Bun.env.YOUTUBE_API_ACCESS_TOKEN,
    refresh_token: Bun.env.YOUTUBE_API_REFRESH_TOKEN,
    scope: Bun.env.YOUTUBE_API_SCOPE,
    token_type: Bun.env.YOUTUBE_API_TOKEN_TYPE,
    expiry_date: Number(Bun.env.YOUTUBE_API_EXPIRY_DATE),
  };

  const client = new youtube_v3.Youtube({ auth });

  /** Youtube上にプレイリストを作成する */
  const createPlaylist = async (date: Date): Promise<string> => {
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
    client,
  };
}
