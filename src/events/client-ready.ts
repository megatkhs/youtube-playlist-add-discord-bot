import { defineEvent } from '@/discord/events'
import { prisma } from '@/libs/prisma'
import { ChannelType, DiscordAPIError, Events } from 'discord.js'

export default defineEvent({
  name: Events.ClientReady,
  async once(client) {
    console.log('[ready]', `${client.user.tag}が正常に起動しました。`)

    const notificationChannels = await prisma.channel.findMany({
      where: {
        OR: [
          {
            wakeUpNotification: true,
          },
          // 管理者チャンネルにも通知を行う
          {
            id: Bun.env.DISCORD_ADMIN_CHANNEL_ID,
          },
        ],
      },
      select: {
        originalId: true,
      },
    })

    if (notificationChannels.length === 0) {
      console.log(
        '[ready]',
        'Botの起動を通知するチャンネルがありませんでした。',
      )
      return
    }

    console.log('[ready]', 'チャンネルに通知を送っています...')
    await Promise.all(
      notificationChannels.map(async ({ originalId: channelId }) => {
        try {
          const channel = await client.channels.fetch(channelId)
          if (channel?.type === ChannelType.GuildText) {
            await channel.send(`\`${client.user.tag}\` が正常に起動しました。`)
          }
        } catch (error) {
          console.error('[ready]', 'メッセージ送信に失敗しました。')

          if (error instanceof DiscordAPIError) {
            switch (error.code) {
              case 10003: // Unknown Channel
                console.error(
                  '[ready]',
                  `\`channelId:${channelId}\`が見つかりませんでした。`,
                )
                return

              case 50001: // Missing Access
                console.error(
                  '[ready]',
                  `\`channelId:${channelId}\`にアクセスする権限がありませんでした。`,
                )
                return
            }
          }

          console.error(error)
        }
      }),
    )
    console.log('[ready]', 'チャンネルに通知を送信しました。')
  },
})
