import type { Interaction } from "discord.js";

export const name = "interactionCreate";

export async function execute(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);
  if (command) {
    await command.execute(interaction);
  }
}
