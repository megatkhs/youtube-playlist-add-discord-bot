import { prisma } from '@/libs/prisma'
import { registerCommands } from '@/utils/discord/commands/register'

try {
  console.log('スラッシュコマンドを登録します')

  const guilds = await prisma.guild.findMany({
    where: {
      exitAt: null,
    },
  })

  for (const { originalId: guildId } of guilds) {
    await registerCommands(guildId)
  }

  console.log('すべて登録完了！')
} catch (error) {
  console.error(error)
}

process.exit()
