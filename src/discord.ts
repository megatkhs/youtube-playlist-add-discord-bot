import { Awaitable, Client, ClientEvents, GatewayIntentBits } from "discord.js";
export { Events } from "discord.js";

export function createDiscordClient() {
  const EVENT_HANDLERS: {
    [K in keyof ClientEvents]?: ((
      ...args: ClientEvents[K]
    ) => Awaitable<void>)[];
  } = {};

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const on = <K extends keyof ClientEvents>(
    event: K,
    handler: (...args: ClientEvents[K]) => Awaitable<void>
  ) => {
    if (!EVENT_HANDLERS[event]) {
      EVENT_HANDLERS[event] = [];
    }
    EVENT_HANDLERS[event]?.push(handler);

    client.on(event, handler);
  };

  const off = <K extends keyof ClientEvents>(event: K) => {
    EVENT_HANDLERS[event]?.forEach((handler) => {
      client.off(event, handler);
    });

    EVENT_HANDLERS[event] = [];
  };

  const login = () => {
    return client.login(process.env.DISCORD_TOKEN);
  };

  return {
    on,
    off,
    login,
    client,
  };
}
