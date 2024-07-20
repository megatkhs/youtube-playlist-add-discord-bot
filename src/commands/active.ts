import { prisma } from '@/libs/prisma'
import { defaineCommand } from '@/utils/discord/helper/define-command'
import { reply } from '@/utils/discord/helper/reply'
import { ChannelType } from 'discord.js'

export default defaineCommand({
  name: 'active',
  description: 'このコマンドを実行したテキストチャンネルをサービスに登録します',
  async execute(interaction) {
    if (
      interaction.guildId === null ||
      interaction.channel?.type !== ChannelType.GuildText ||
      !interaction.channel.viewable
    ) {
      await reply(interaction, {
        content: `⛔ \`${interaction.client.user.tag}\`が参加しているテキストチャンネルで実行してください。`,
        ephemeral: true,
      })
      return
    }

    const channel = await prisma.channel.findFirst({
      where: {
        originalId: interaction.channelId,
        active: true,
      },
    })

    if (channel !== null) {
      await reply(interaction, {
        content: '⚠️ このチャンネルは既に登録済みです！',
        ephemeral: true,
      })
      return
    }

    await prisma.channel.upsert({
      where: {
        originalId: interaction.channelId,
      },
      update: {
        active: true,
      },
      create: {
        originalId: interaction.channelId,
        guild: {
          connect: {
            originalId: interaction.guildId,
          },
        },
      },
    })

    await reply(interaction, {
      content: '✅ 登録しました！',
      ephemeral: true,
    })
  },
})
