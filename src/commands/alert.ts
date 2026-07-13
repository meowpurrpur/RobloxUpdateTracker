import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { ROBLOX_CHANNELS } from "../lib/constants";
import db from "../lib/db";

export const data = new SlashCommandBuilder()
  .setName("alert")
  .setDescription("Manage Roblox update alerts")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Enable alerts in this channel")
      .addStringOption((option) =>
        option
          .setName("channel")
          .setDescription("Roblox channel to monitor")
          .setRequired(true)
          .addChoices(
            ...ROBLOX_CHANNELS.map((channel) => ({
              name: channel,
              value: channel,
            })),
          ),
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Message content before the embed (e.g. @everyone)")
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Disable alerts in this channel")
      .addStringOption((option) =>
        option
          .setName("channel")
          .setDescription("Roblox channel to remove")
          .setRequired(true)
          .addChoices(
            ...ROBLOX_CHANNELS.map((channel) => ({
              name: channel,
              value: channel,
            })),
          ),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("list").setDescription("List configured alerts"),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "You need administrator permissions to manage alerts.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const subcommand = interaction.options.getSubcommand();
  if (!interaction.guildId || !interaction.channelId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (subcommand === "add") {
    const channel = interaction.options.getString("channel", true);
    const message = interaction.options.getString("message") ?? "";

    db.prepare(
      `
      INSERT INTO alerts (
        channelId,
        guildId,
        robloxChannel,
        customContent
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(channelId, robloxChannel)
      DO UPDATE SET
        customContent = excluded.customContent,
        enabled = 1
    `,
    ).run(interaction.channelId, interaction.guildId, channel, message);

    return interaction.reply({
      content: `Enabled ${channel} update alerts in this channel.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (subcommand === "remove") {
    const channel = interaction.options.getString("channel", true);

    const result = db
      .prepare(
        `
      DELETE FROM alerts
      WHERE channelId = ?
      AND robloxChannel = ?
    `,
      )
      .run(interaction.channelId, channel);

    return interaction.reply({
      content: result.changes
        ? `Removed ${channel} alerts from this channel.`
        : "No alerts found.",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (subcommand === "list") {
    const alerts = db
      .prepare(
        `
      SELECT robloxChannel, customContent, enabled
      FROM alerts
      WHERE guildId = ?
    `,
      )
      .all(interaction.guildId) as {
      robloxChannel: string;
      customContent: string;
      enabled: boolean;
    }[];

    if (alerts.length === 0) {
      return interaction.reply({
        content: "No alerts are set up.",
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({
      content: alerts
        .map(
          (alert) =>
            `${alert.robloxChannel}: ${alert.enabled ? "enabled" : "disabled"}`,
        )
        .join("\n"),
      flags: MessageFlags.Ephemeral,
    });
  }
}
