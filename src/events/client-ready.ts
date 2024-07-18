import { defineEvent } from '@/discord/events'
import { prisma } from '@/libs/prisma'
import { ChannelType, DiscordAPIError, Events } from 'discord.js'

export default defineEvent({
  name: Events.ClientReady,
  async once(client) {
    console.log(`${client.user.tag}が正常に起動しました。`)

    console.log('チャンネルに通知を送っています...')
    const notificationChannels = await prisma.channel.findMany({
      where: {
        wakeUpNotification: true,
      },
      select: {
        originalId: true,
      },
    })
    await Promise.all(
      notificationChannels.map(async ({ originalId: channelId }) => {
        try {
          const channel = await client.channels.fetch(channelId)
          if (channel?.type === ChannelType.GuildText) {
            await channel.send(`\`${client.user.tag}\` が正常に起動しました。`)
          }
        } catch (error) {
          console.error('メッセージ送信に失敗しました。')

          if (error instanceof DiscordAPIError) {
            switch (error.code) {
              case 10003: // Unknown Channel
                console.error(
                  `\`channelId:${channelId}\`が見つかりませんでした。`,
                )
                return

              case 50001: // Missing Access
                console.error(
                  `\`channelId:${channelId}\`にアクセスする権限がありませんでした。`,
                )
                return
            }
          }

          console.error(error)
        }
      }),
    )
    console.log('チャンネルに通知を送信しました。')
  },
})
