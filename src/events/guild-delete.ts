import { defineEvent } from '@/discord/events'
import { prisma } from '@/libs/prisma'
import { Events } from 'discord.js'

// ボットがサーバーから離脱した際に実行される
export default defineEvent({
  name: Events.GuildDelete,
  async on(guild) {
    await prisma.guild.update({
      where: {
        originalId: guild.id,
      },
      data: {
        exitAt: new Date(),
      },
    })

    await prisma.channel.updateMany({
      where: {
        guild: {
          originalId: guild.id,
        },
      },
      data: {
        active: false,
      },
    })
  },
})
