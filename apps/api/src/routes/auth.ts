import { Hono } from "hono";
import { HonoEnv } from "../types";
import { generateAuthUrl, exchangeCodeForTokens } from "../lib/oauth";
import { credentials } from "../db/schema";
import { eq } from "drizzle-orm";

const authApp = new Hono<HonoEnv>();

authApp.get("/", (c) => {
  const authUrl = generateAuthUrl(
    c.env.YOUTUBE_CLIENT_ID,
    c.env.YOUTUBE_REDIRECT_URL
  );
  return c.redirect(authUrl);
});

authApp.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.text("Authorization code not found", 400);
  }

  try {
    const { accessToken, refreshToken } = await exchangeCodeForTokens(
      code,
      c.env.YOUTUBE_CLIENT_ID,
      c.env.YOUTUBE_CLIENT_SECRET,
      c.env.YOUTUBE_REDIRECT_URL
    );

    // credentialsテーブルのID=1を更新または挿入する
    const existing = await c.var.db
      .select()
      .from(credentials)
      .where(eq(credentials.id, 1))
      .get();

    if (existing) {
      await c.var.db
        .update(credentials)
        .set({ accessToken, refreshToken })
        .where(eq(credentials.id, 1));
    } else {
      await c.var.db
        .insert(credentials)
        .values({ id: 1, accessToken, refreshToken });
    }

    return c.json(
      { success: true, message: "Authentication successful. You can close this window." },
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
