import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { ROBLOX_CHANNELS } from "../lib/constants";
import db from "../lib/db";

export const data = new SlashCommandBuilder()
  .setName("dm-alert")
  .setDescription("Manage Roblox update alerts (to your DMs)")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Enable DM alerts")
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
      .setDescription("Disable DM alerts")
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
    subcommand.setName("list").setDescription("List configured DM alerts"),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in DMs.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const subcommand = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  if (subcommand === "add") {
    const channel = interaction.options.getString("channel", true);
    const message = interaction.options.getString("message") ?? "";

    db.prepare(
      `
      INSERT INTO dmAlerts (
        userId,
        robloxChannel,
        customContent
      )
      VALUES (?, ?, ?)
      ON CONFLICT(userId, robloxChannel)
      DO UPDATE SET
        customContent = excluded.customContent,
        enabled = 1
      `,
    ).run(userId, channel, message);

    return interaction.reply({
      content: `Enabled ${channel} update alerts in your DMs.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (subcommand === "remove") {
    const channel = interaction.options.getString("channel", true);

    const result = db
      .prepare(
        `
        DELETE FROM dmAlerts
        WHERE userId = ?
        AND robloxChannel = ?
        `,
      )
      .run(userId, channel);

    return interaction.reply({
      content: result.changes
        ? `Removed ${channel} DM alerts.`
        : "No alerts found.",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (subcommand === "list") {
    const alerts = db
      .prepare(
        `
        SELECT robloxChannel, customContent, enabled
        FROM dmAlerts
        WHERE userId = ?
        `,
      )
      .all(userId) as {
      robloxChannel: string;
      customContent: string;
      enabled: boolean;
    }[];

    if (alerts.length === 0) {
      return interaction.reply({
        content: "No DM alerts are set up.",
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
