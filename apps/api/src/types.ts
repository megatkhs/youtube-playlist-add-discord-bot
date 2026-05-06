import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";

export type Bindings = Cloudflare.Env

export type Variables = {
  db: DrizzleD1Database<typeof schema>;
};

export type HonoEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
