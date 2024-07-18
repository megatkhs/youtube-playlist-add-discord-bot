import { prisma } from '@/libs/prisma'
import type { SlashCommandModule } from 'discord.js'

export default {
  name: 'register',
  description: '実行したチャンネルをサービスに登録します',
  async execute(interaction) {
    if (interaction.guildId === null) {
      return
    }

    const channel = await prisma.channel.findUnique({
      where: {
        originalId: interaction.channelId,
      },
    })

    if (channel !== null) {
      interaction.reply('⚠️ このチャンネルは既に登録済みです！')
      return
    }

    const guild = await prisma.guild.upsert({
      where: {
        originalId: interaction.guildId,
      },
      update: {},
      create: {
        originalId: interaction.guildId,
      },
    })

    await prisma.channel.create({
      data: {
        originalId: interaction.channelId,
        guildId: guild.id,
      },
    })

    interaction.reply('✅ 登録しました！')
  },
} satisfies SlashCommandModule
