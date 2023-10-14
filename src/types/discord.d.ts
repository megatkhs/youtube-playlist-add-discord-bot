import { Collection } from "discord.js";

declare module "discord.js" {
  export interface ModuleFile<T> {
    default: T;
  }

  export interface CommandModuleInputOptionBase {
    description?: string;
    required?: boolean;
  }

  export interface CommandModuleInput {
    name: string;
    description?: string;
    options?: (
      builder: SlashCommandBuilder,
      client: Client
    ) => Promise<void> | void;
    callback: (interaction: ChatInputCommandInteraction) => void;
  }

  export interface CommandModule {
    data: SlashCommandBuilder;
    callback: (interaction: ChatInputCommandInteraction) => void;
  }

  export interface EventModule<K = keyof ClientEvents> {
    name: K;
    once?: (...args: ClientEvents[K]) => void;
    on?: (...args: ClientEvents[K]) => void;
  }
}
