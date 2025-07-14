import { Hono } from "hono";
import { client } from "../lib/microcms";
import {
  createOAuth2Client,
  generateAuthUrl,
  getTokens,
} from "../lib/youtube";

export function startHonoApp() {
  const app = new Hono();
  const oauth2Client = createOAuth2Client();

  app.get("/", async (c) => {
    const code = c.req.query("code");
    if (!code) {
      const authUrl = generateAuthUrl(oauth2Client);
      return c.redirect(authUrl);
    }

    try {
      const tokens = await getTokens(oauth2Client, code);
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
