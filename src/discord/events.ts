import path from "node:path";
import fs from "node:fs";
import type { Client, ClientEvents, EventModule, ModuleFile } from "discord.js";

export async function attachEvents(client: Client): Promise<void> {
  const eventsPath = path.join(import.meta.dir, "../events/");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const { default: event }: ModuleFile<EventModule> = await import(filePath);

    if (event.once) {
      client.once(event.name, event.once);
    } else if (event.on) {
      client.on(event.name, event.on);
    }
  }
}

/** イベントハンドラを定義する */
export function defineEvent<K extends keyof ClientEvents>(
  module: EventModule<K>
): EventModule<K> {
  return module;
}
