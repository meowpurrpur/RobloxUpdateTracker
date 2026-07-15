import db from "../lib/db";
import { client } from "../lib/client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";
import type { MessageCreateOptions, RGBTuple } from "discord.js";
import { RDD_BASE } from "../lib/constants";

type Alert = {
  channelId: string | null;
  userId: string | null;
  customContent: string;
  type: "channel" | "dm";
};

const emojis = {
  roblox: "<:roblox:1526968978935779442>",
  revert: "<:revert:1526970489694585043>",
  warning: "<:warning:1526970756356116633>",
  download: "<:download:1526971517823488141>",
  hash: "<:hash:1526971544465707100>",
  clock: "<:clock:1526971573586886756>",
};

const colors = {
  preUpdate: [75, 173, 234] as RGBTuple,
  update: [219, 43, 46] as RGBTuple,
  revert: [229, 115, 22] as RGBTuple,
};

function getAlerts(channel: string) {
  return db
    .prepare(
      `
      SELECT channelId, customContent, NULL AS userId, 'channel' AS type
      FROM alerts
      WHERE robloxChannel = ?
      AND enabled = 1

      UNION ALL

      SELECT NULL AS channelId, customContent, userId, 'dm' AS type
      FROM dmAlerts
      WHERE robloxChannel = ?
      AND enabled = 1
      `,
    )
    .all(channel, channel) as Alert[];
}

async function sendAlert(alert: Alert, payload: MessageCreateOptions) {
  const message = {
    content: alert.customContent,
    ...payload,
  };

  if (alert.type === "dm") {
    const user = await client.users.fetch(alert.userId!);
    await user.send(message);
    return;
  }

  const channel = await client.channels.fetch(alert.channelId!);
  if (!channel?.isTextBased() || !channel.isSendable()) {
    return;
  }

  await channel.send(message);
}

function createText(content: string) {
  return new TextDisplayBuilder().setContent(content);
}

function createDownloadButton(channel: string, hash: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Download")
      .setStyle(ButtonStyle.Link)
      .setEmoji(emojis.download)
      .setURL(
        `${RDD_BASE}/?channel=${channel}&binaryType=WindowsPlayer&version=${hash}`,
      ),
  );
}

function createSeparator() {
  return new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(SeparatorSpacingSize.Small);
}

function createTimestamp() {
  return `<t:${Math.floor(Date.now() / 1000)}:R>`;
}

function createVersionInfo(hash: string) {
  return createText(
    [
      `${emojis.hash} **Version**`,
      `\`${hash}\``,
      "",
      `${emojis.clock} **Detected**`,
      createTimestamp(),
    ].join("\n"),
  );
}

function createRevertInfo(hash: string, previousVersion: string) {
  return createText(
    [
      `${emojis.hash} **Reverted To**`,
      `\`${hash}\``,
      "",
      `${emojis.hash} **Previous Version**`,
      `\`${previousVersion}\``,
      "",
      `${emojis.clock} **Detected**`,
      createTimestamp(),
    ].join("\n"),
  );
}

function createUpdateContainer(
  title: string,
  description: string,
  color: RGBTuple,
  info: TextDisplayBuilder,
) {
  return new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents(createText(`### ${title}`))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createText(description))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(info)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createText("-# Roblox Update Tracker"));
}

async function sendComponentAlert(
  channel: string,
  components: (ContainerBuilder | ActionRowBuilder<ButtonBuilder>)[],
) {
  for (const alert of getAlerts(channel)) {
    try {
      await sendAlert(alert, {
        flags: MessageFlags.IsComponentsV2,
        components,
      });
    } catch (e) {
      console.log(`Failed to send alert to ${channel}, error: ${e}`);
    }
  }
}

export async function sendPreUpdate(hash: string, channel: string) {
  await sendComponentAlert(channel, [
    createUpdateContainer(
      `${emojis.warning} Future Update Detected`,
      [
        `A future Roblox update has been detected on the \`${channel}\` channel.`,
        "This version will likely release onto the `LIVE` channel within ~24 hours.",
      ].join("\n"),
      colors.preUpdate,
      createVersionInfo(hash),
    ),
    createDownloadButton(channel, hash),
  ]);
}

export async function sendUpdate(hash: string, channel: string) {
  await sendComponentAlert(channel, [
    createUpdateContainer(
      `${emojis.roblox} Update Released`,
      [
        `A new Roblox update has been released on the \`${channel}\` channel.`,
        channel === "LIVE"
          ? "This update will be given to most users."
          : "This update will not affect most users.",
      ].join("\n"),
      colors.update,
      createVersionInfo(hash),
    ),
    createDownloadButton(channel, hash),
  ]);
}

export async function sendRevert(
  hash: string,
  previousVersion: string,
  channel: string,
) {
  await sendComponentAlert(channel, [
    createUpdateContainer(
      `${emojis.revert} Update Reverted`,
      `The \`${channel}\` channel has reverted back to a previous version.`,
      colors.revert,
      createRevertInfo(hash, previousVersion),
    ),
  ]);
}
