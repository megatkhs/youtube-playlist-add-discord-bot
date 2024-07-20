import { defineEvent } from '@/discord/events'
import { prisma } from '@/libs/prisma'
import { registerCommands } from '@/utils/discord/commands/register'
import { Events } from 'discord.js'

// ボットがサーバーに参加した際に実行される
export default defineEvent({
  name: Events.GuildCreate,
  async on(guild) {
    await prisma.guild.upsert({
      where: {
        originalId: guild.id,
      },
      update: {
        exitAt: null,
      },
      create: {
        originalId: guild.id,
      },
    })

    await registerCommands(guild.id)
  },
})
