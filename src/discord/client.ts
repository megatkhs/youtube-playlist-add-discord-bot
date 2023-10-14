import { GatewayIntentBits } from "discord.js";
import { Client } from "discord.js";
import { attachEvents } from "./events";

export function startDiscordBot() {
  console.log("Bot起動中...");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  attachEvents(client);

  client.login();
}
