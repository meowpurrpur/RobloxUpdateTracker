import db from "../lib/db";
import { client } from "../lib/client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { RDD_BASE } from "../lib/constants";

export async function sendPreUpdate(hash: string, channel: string) {
  const alerts = db
    .prepare(
      `
        SELECT channelId, customContent
        FROM alerts
        WHERE robloxChannel = ?
        AND enabled = 1
    `,
    )
    .all(channel) as {
    channelId: string;
    customContent: string;
  }[];

  for (const alert of alerts) {
    try {
      const discordChannel = await client.channels.fetch(alert.channelId);
      if (!discordChannel?.isTextBased() || !discordChannel?.isSendable()) {
        continue;
      }

      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Download Version")
          .setStyle(ButtonStyle.Link)
          .setEmoji("💠")
          .setURL(
            `https://rdd.whatexpsare.online/?channel=${channel}&binaryType=WindowsPlayer&version=${hash}`,
          ),
      );

      const embed = new EmbedBuilder()
        .setTitle("Future Update Detected")
        .setDescription(
          `A future Roblox update has been detected on the \`${channel}\` channel.\n
        This does not effect most users but this version should be released onto the \`LIVE\` channel in the next ~24 hours.`,
        )
        .setColor("Blue")
        .addFields(
          {
            name: "Version",
            value: `\`${hash}\``,
            inline: true,
          },
          {
            name: "Timestamp",
            value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({
          text: "Roblox Update Tracker",
        });

      await discordChannel.send({
        content: alert.customContent,
        embeds: [embed],
        components: [button],
      });
    } catch (e) {}
  }
}

export async function sendUpdate(hash: string, channel: string) {
  const alerts = db
    .prepare(
      `
        SELECT channelId, customContent
        FROM alerts
        WHERE robloxChannel = ?
        AND enabled = 1
    `,
    )
    .all(channel) as {
    channelId: string;
    customContent: string;
  }[];

  for (const alert of alerts) {
    try {
      const discordChannel = await client.channels.fetch(alert.channelId);
      if (!discordChannel?.isTextBased() || !discordChannel?.isSendable()) {
        continue;
      }

      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Download Version")
          .setStyle(ButtonStyle.Link)
          .setEmoji("💠")
          .setURL(
            `${RDD_BASE}/?channel=${channel}&binaryType=WindowsPlayer&version=${hash}`,
          ),
      );

      const embed = new EmbedBuilder()
        .setTitle("Update Detected")
        .setDescription(
          `A new Roblox update has been released and is now available on the \`${channel}\` channel.`,
        )
        .setColor("Red")
        .addFields(
          {
            name: "Version",
            value: `\`${hash}\``,
            inline: true,
          },
          {
            name: "Timestamp",
            value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({
          text: "Roblox Update Tracker",
        });

      await discordChannel.send({
        content: alert.customContent,
        embeds: [embed],
        components: [button],
      });
    } catch (e) {}
  }
}

export async function sendRevert(
  hash: string,
  previousVersion: string,
  channel: string,
) {
  const alerts = db
    .prepare(
      `
    SELECT channelId, customContent
    FROM alerts
    WHERE robloxChannel = ?
    AND enabled = 1
  `,
    )
    .all(channel) as {
    channelId: string;
    customContent: string;
  }[];

  for (const alert of alerts) {
    try {
      const discordChannel = await client.channels.fetch(alert.channelId);
      if (!discordChannel?.isTextBased() || !discordChannel?.isSendable()) {
        continue;
      }

      const embed = new EmbedBuilder()
        .setTitle("Update Reverted")
        .setDescription(
          `The \`${channel}\` channel has reverted back to a previous version.`,
        )
        .setColor("Purple")
        .addFields(
          {
            name: "Reverted To",
            value: `\`${hash}\``,
            inline: true,
          },
          {
            name: "Previous Version",
            value: `\`${previousVersion}\``,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({
          text: "Roblox Update Tracker",
        });

      await discordChannel.send({
        content: alert.customContent,
        embeds: [embed],
      });
    } catch (e) {}
  }
}
