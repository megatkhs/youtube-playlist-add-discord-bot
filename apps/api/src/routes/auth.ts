import { Hono } from "hono";
import { HonoEnv } from "../types";
import { generateAuthUrl, exchangeCodeForTokens, saveState, verifyState } from "../lib/oauth";
import { credentials, channels } from "../db/schema";
import { eq } from "drizzle-orm";

const authApp = new Hono<HonoEnv>();

authApp.get("/", async (c) => {
  const channelId = c.req.query("channelId");
  if (!channelId) {
    return c.text("channelId query parameter is required", 400);
  }

  const state = crypto.randomUUID();
  await saveState(c.env.STATE_KV, state, channelId);

  const authUrl = generateAuthUrl(
    c.env.YOUTUBE_CLIENT_ID,
    c.env.YOUTUBE_REDIRECT_URL,
    state
  );
  return c.redirect(authUrl);
});

authApp.get("/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.text("Authorization code or state not found", 400);
  }

  const channelId = await verifyState(c.env.STATE_KV, state);
  if (!channelId) {
    return c.text("Invalid or expired state", 403);
  }

  try {
    const { accessToken, refreshToken } = await exchangeCodeForTokens(
      code,
      c.env.YOUTUBE_CLIENT_ID,
      c.env.YOUTUBE_CLIENT_SECRET,
      c.env.YOUTUBE_REDIRECT_URL
    );

    const db = c.var.db;

    // クレデンシャルを新規保存
    const [newCred] = await db
      .insert(credentials)
      .values({ accessToken, refreshToken })
      .returning();

    // チャンネルに紐付ける
    await db
      .update(channels)
      .set({ credentialId: newCred.id })
      .where(eq(channels.discordChannelId, channelId));

    return c.json(
      { 
        success: true, 
        message: `Authentication successful for channel ${channelId}. You can close this window.` 
      },
      200
    );
  } catch (e) {
    return c.text(
      `Authentication failed: ${e instanceof Error ? e.message : String(e)}`,
      500
    );
  }
});

export default authApp;
