import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import type {
  ModuleFile,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandModule,
} from 'discord.js'
import { collectCommands } from './collect'

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = (
  await collectCommands()
).map(({ name, description }) => {
  const slashCommand = new SlashCommandBuilder().setName(name)

  if (description) {
    slashCommand.setDescription(description)
  }

  return slashCommand.toJSON()
})

const rest = new REST().setToken(Bun.env.DISCORD_TOKEN)

export async function registerCommands(guildId: string) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(Bun.env.DISCORD_CLIENT_ID, guildId),
      {
        body: commands,
      },
    )
    console.log(`guildId:${guildId}にコマンドを登録しました`)
  } catch (error) {
    console.log(`guildId:${guildId}にコマンドを登録できませんでした`)
    console.error(error)
  }
}
