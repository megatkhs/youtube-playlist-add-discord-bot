import { Hono } from "hono";
import { google } from "googleapis";
import { client } from "./microcms";

const SCOPES = ["https://www.googleapis.com/auth/youtube"];
const OAuth2 = google.auth.OAuth2;

export function startHonoApp() {
  const app = new Hono();
  const oauth2Client = new OAuth2(
    Bun.env.YOUTUBE_API_CLIENT_ID,
    Bun.env.YOUTUBE_API_CLIENT_SECRET,
    Bun.env.YOUTUBE_API_REDIRECT_URL
  );

  app.get("/", async (c) => {
    const code = c.req.query("code");
    if (!code) {
      var authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      return c.redirect(authUrl);
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      client.update({
        endpoint: "credential",
        content: {
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token!,
        },
      });

      return c.json(
        {
          success: true,
          tokens,
        },
        200
      );
    } catch (e) {
      return c.text(String(e));
    }
  });

  return app;
}
