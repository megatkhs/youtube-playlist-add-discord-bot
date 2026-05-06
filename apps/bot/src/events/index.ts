import path from "node:path";
import fs from "node:fs";
import type { Client, ClientEvents } from "discord.js";

// Bot側の型定義もここにインラインで定義する（d.tsを削除したため）
export interface EventModule<K extends keyof ClientEvents> {
  name: K;
  once?: (...args: ClientEvents[K]) => void;
  on?: (...args: ClientEvents[K]) => void;
}
export interface ModuleFile {
  default: EventModule<any>;
}

export async function attachEvents(client: Client): Promise<void> {
  const eventsPath = path.join(import.meta.dir, "./");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts") && file !== "index.ts");

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const { default: event }: ModuleFile = await import(filePath);

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
