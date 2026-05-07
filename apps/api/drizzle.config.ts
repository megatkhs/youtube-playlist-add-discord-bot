import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

dotenv.config();

function getLocalD1DB(): string {
  try {
    const basePath = path.resolve(".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
    const dbFile = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err) {
    console.error(`Error  ${err}`);
    process.exit(1);
  }
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalD1DB(),
  }
});
