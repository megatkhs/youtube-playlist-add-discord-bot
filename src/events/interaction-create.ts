import fs from 'node:fs'
import path from 'node:path'
import { defineEvent } from '@/discord/events'
import {
  Collection,
  Events,
  type ModuleFile,
  type SlashCommandModule,
} from 'discord.js'

const commands = new Collection<string, SlashCommandModule>()

const slashCommandsPath = path.join(import.meta.dir, '../commands/')
const slashCommandFiles = fs
  .readdirSync(slashCommandsPath)
  .filter((file) => file.endsWith('.ts'))

for (const file of slashCommandFiles) {
  const filePath = path.join(slashCommandsPath, file)
  const { default: module }: ModuleFile<SlashCommandModule> = await import(
    filePath
  )

  commands.set(module.name, module)
}

export default defineEvent({
  name: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) {
      console.error(`${interaction.commandName}コマンドは、存在しません。`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '⛔コマンド実行中にエラーが発生しました',
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content: '⛔コマンド実行中にエラーが発生しました',
          ephemeral: true,
        })
      }
    }
  },
})
