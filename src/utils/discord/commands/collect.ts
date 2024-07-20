import fs from 'node:fs'
import path from 'node:path'
import type { ModuleFile, SlashCommandModule } from 'discord.js'

export async function collectCommands() {
  const slashCommandsPath = path.join(import.meta.dir, '../../../commands/')
  const slashCommandFiles = fs
    .readdirSync(slashCommandsPath)
    .filter((file) => file.endsWith('.ts'))

  return Promise.all(
    slashCommandFiles.map(async (file) => {
      const filePath = path.join(slashCommandsPath, file)
      const modules: ModuleFile<SlashCommandModule> = await import(filePath)
      return modules.default
    }),
  )
}
