import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";

export type Bindings = {
  DB: D1Database;
  API_KEY: string;
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  YOUTUBE_REDIRECT_URL: string;
};

export type Variables = {
  db: DrizzleD1Database<typeof schema>;
};

export type HonoEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
