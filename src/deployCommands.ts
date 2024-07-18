import fs from 'node:fs'
import path from 'node:path'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import type {
  ModuleFile,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandModule,
} from 'discord.js'
import { prisma } from './libs/prisma'

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
const slashCommandsPath = path.join(import.meta.dir, './commands/')
const slashCommandFiles = fs
  .readdirSync(slashCommandsPath)
  .filter((file) => file.endsWith('.ts'))

for (const file of slashCommandFiles) {
  const filePath = path.join(slashCommandsPath, file)
  const {
    default: { name, description },
  }: ModuleFile<SlashCommandModule> = await import(filePath)

  const slashCommand = new SlashCommandBuilder().setName(name)

  if (description) {
    slashCommand.setDescription(description)
  }

  commands.push(slashCommand.toJSON())
}

const rest = new REST().setToken(Bun.env.DISCORD_TOKEN)

try {
  console.log('スラッシュコマンドを登録します')

  const guilds = await prisma.guild.findMany()

  for (const { originalId: guildId } of guilds) {
    await rest.put(
      Routes.applicationGuildCommands(Bun.env.DISCORD_CLIENT_ID, guildId),
      {
        body: commands,
      },
    )
    console.log(`guildId:${guildId} 登録成功！`)
  }
  console.log('すべて登録完了！')
} catch (error) {
  console.error(error)
}

process.exit()
