import { createClient } from "microcms-ts-sdk";
import { Endpoints } from "./types/microcms";

export const client = createClient<Endpoints>({
  serviceDomain: Bun.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: Bun.env.MICROCMS_API_KEY!,
});
