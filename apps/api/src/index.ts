import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { HonoEnv } from "./types";
import authApp from "./routes/auth";
import playlistApp from "./routes/playlist";

const app = new Hono<HonoEnv>();

// Middleware to inject Drizzle DB instance
app.use("*", async (c, next) => {
  c.set("db", drizzle(c.env.DB));
  await next();
});

app.route("/auth", authApp);
app.route("/api/playlist", playlistApp);

export default app;
