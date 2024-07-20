import type { CommandInteraction, InteractionReplyOptions } from 'discord.js'

export async function reply(
  interaction: CommandInteraction,
  options: string | InteractionReplyOptions,
) {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(options)
  } else {
    await interaction.reply(options)
  }
}
