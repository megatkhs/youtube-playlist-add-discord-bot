import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/87aeecf57e111f6d9c9937aacc338cc678210f5ae92d98c534bfa1c2a5d19d0f.sqlite"
  }
});
