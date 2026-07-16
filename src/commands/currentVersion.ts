import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { CLIENTSETTINGS_BASE, ROBLOX_CHANNELS } from "../lib/constants";

export const data = new SlashCommandBuilder()
  .setName("current-version")
  .setDescription("Shows the current windows version on the specified channel")
  .addStringOption((option) =>
    option
      .setName("channel")
      .setDescription(
        "Roblox channel to get the current version of (Default: LIVE)",
      )
      .setRequired(false)
      .addChoices(
        ...ROBLOX_CHANNELS.map((channel) => ({
          name: channel,
          value: channel,
        })),
      ),
  );

async function getVersion(channel: string): Promise<string | null> {
  const response = await fetch(
    `${CLIENTSETTINGS_BASE}/v2/client-version/WindowsPlayer/channel/${channel}`,
  );
  if (!response.ok) return null;

  const json = await response.json();
  return json?.clientVersionUpload;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getString("channel") || "LIVE";
  const version = await getVersion(channel);

  if (version) {
    interaction.reply({
      content: `The current version for the \`${channel}\` channel is \`${version}\`.`,
      flags: MessageFlags.Ephemeral,
    });
  } else {
    interaction.reply({
      content:
        "Failed to get version info at this time, the channel might be inactive.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
