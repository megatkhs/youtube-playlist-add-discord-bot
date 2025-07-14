import { startDiscordBot } from "./discord/client";
import { startHonoApp } from "./routes/hono";

startDiscordBot();

export default startHonoApp();
