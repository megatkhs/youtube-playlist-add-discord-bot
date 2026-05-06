import { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

/** D1からアクセストークンを取得する */
export async function getAccessToken(
  db: DrizzleD1Database<typeof schema>
): Promise<{ accessToken: string; refreshToken: string }> {
  const row = await db.select().from(schema.credentials).get();
  if (!row) {
    throw new Error("No credentials found in database. Please authenticate via /auth first.");
  }
  return { accessToken: row.accessToken, refreshToken: row.refreshToken };
}

/** リフレッシュトークンを使って新しいアクセストークンを取得し、D1に保存する */
export async function refreshAccessToken(
  db: DrizzleD1Database<typeof schema>,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as TokenResponse;

  // D1のアクセストークンを更新
  await db
    .update(schema.credentials)
    .set({ accessToken: data.access_token })
    .where(eq(schema.credentials.id, 1));

  return data.access_token;
}

/** OAuth認証コードからトークンを取得する */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as TokenResponse;

  if (!data.refresh_token) {
    throw new Error("No refresh_token returned. Ensure access_type=offline is set.");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/** OAuth認証URLを生成する */
export function generateAuthUrl(
  clientId: string,
  redirectUri: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
