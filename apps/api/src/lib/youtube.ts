import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { getAccessToken, refreshAccessToken } from "./oauth";

const YOUTUBE_API_BASE = "https://youtube.googleapis.com/youtube/v3";

interface Env {
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
}

/**
 * 認証付きでYouTube APIにリクエストを送信する。
 * 401の場合はトークンをリフレッシュしてリトライする。
 */
async function fetchWithAuth(
  db: DrizzleD1Database<typeof schema>,
  env: Env,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken, refreshToken } = await getAccessToken(db);

  const doFetch = (token: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

  const response = await doFetch(accessToken);

  if (response.status === 401) {
    // トークンが切れているのでリフレッシュしてリトライ
    const newToken = await refreshAccessToken(
      db,
      refreshToken,
      env.YOUTUBE_CLIENT_ID,
      env.YOUTUBE_CLIENT_SECRET
    );
    return doFetch(newToken);
  }

  return response;
}

/** URLからvideoIdを取得する */
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

  const videoId = url.searchParams.get("v") || url.pathname.substring(1);
  return videoId || null;
}

/** YouTube上にプレイリストを作成する */
export async function createPlaylist(
  db: DrizzleD1Database<typeof schema>,
  env: Env,
  title: string
): Promise<string> {
  const response = await fetchWithAuth(
    db,
    env,
    `${YOUTUBE_API_BASE}/playlists?part=snippet,status`,
    {
      method: "POST",
      body: JSON.stringify({
        snippet: { title },
        status: { privacyStatus: "public" },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create playlist: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

/** 動画がすでにプレイリストに存在するか確認する */
export async function checkVideoExistsInPlaylist(
  db: DrizzleD1Database<typeof schema>,
  env: Env,
  playlistId: string,
  videoId: string
): Promise<boolean> {
  const params = new URLSearchParams({
    part: "snippet",
    playlistId,
    videoId,
  });

  const response = await fetchWithAuth(
    db,
    env,
    `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to check playlist items: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as { items: unknown[] };
  return data.items.length > 0;
}

/** 動画をプレイリストに追加する */
export async function insertVideoIntoPlaylist(
  db: DrizzleD1Database<typeof schema>,
  env: Env,
  playlistId: string,
  videoId: string
): Promise<void> {
  const response = await fetchWithAuth(
    db,
    env,
    `${YOUTUBE_API_BASE}/playlistItems?part=snippet`,
    {
      method: "POST",
      body: JSON.stringify({
        snippet: {
          playlistId,
          position: 0,
          resourceId: {
            videoId,
            kind: "youtube#video",
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to insert video into playlist: ${response.status} ${errorBody}`);
  }
}
