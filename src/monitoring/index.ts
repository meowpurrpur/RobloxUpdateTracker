import fetch from "node-fetch";
import db from "../lib/db";
import { ROBLOX_CHANNELS, RobloxChannel } from "../lib/constants";
import config from "../lib/config";
import { sendUpdate, sendPreUpdate, sendRevert } from "./alerts";

function getChannelUrl(channel: RobloxChannel) {
  return `${config.CLIENTSETTINGS_BASE}/v2/client-version/WindowsPlayer/channel/${channel}`;
}

function hasVersion(hash: string, channel: string) {
  return db
    .prepare(
      `
        SELECT 1
        FROM knownVersions
        WHERE hash = ?
        AND robloxChannel = ?
    `,
    )
    .get(hash, channel);
}

function addVersion(hash: string, channel: string) {
  db.prepare(
    `
        INSERT OR IGNORE INTO knownVersions (
            hash,
            robloxChannel,
            detectedAt
        )
        VALUES (?, ?, ?)
    `,
  ).run(hash, channel, Date.now());
}

function markReleased(hash: string) {
  db.prepare(
    `
        UPDATE knownVersions
        SET released = 1
        WHERE hash = ?
    `,
  ).run(hash);
}

function updateChannelState(channel: RobloxChannel, hash: string) {
  db.prepare(
    `
      INSERT INTO channelState (
        robloxChannel,
        currentVersion,
        previousVersion
      )
      VALUES (?, ?, NULL)
      ON CONFLICT(robloxChannel)
      DO UPDATE SET
        previousVersion = channelState.currentVersion,
        currentVersion = excluded.currentVersion
    `,
  ).run(channel, hash);
}

async function checkChannel(channel: RobloxChannel) {
  const response = await fetch(getChannelUrl(channel));
  if (!response.ok) return;

  const data = (await response.json()) as {
    clientVersionUpload?: string;
  };

  const hash = data.clientVersionUpload;
  if (!hash) return;

  const currentState = db
    .prepare(
      `
        SELECT currentVersion, previousVersion
        FROM channelState
        WHERE robloxChannel = ?
      `,
    )
    .get(channel) as
    | {
        currentVersion: string;
        previousVersion: string | null;
      }
    | undefined;

  const versionExists = hasVersion(hash, channel);

  console.log({
    channel,
    current: currentState?.currentVersion,
    previous: currentState?.previousVersion,
    hash,
    same: currentState?.currentVersion === hash,
    versionExists: !!versionExists,
  });

  if (currentState && currentState.currentVersion === hash) {
    return;
  }

  if (channel !== "ZBeta" && currentState) {
    if (currentState.currentVersion === hash) {
      return;
    }

    const isRevert = currentState.previousVersion === hash;
    updateChannelState(channel, hash);

    if (versionExists && !isRevert) {
      return;
    }

    if (isRevert) {
      console.log(
        `${channel} version reverted: ${currentState.currentVersion} -> ${hash}`,
      );

      await sendRevert(hash, currentState.currentVersion, channel);
    } else {
      console.log(`New ${channel} version: ${hash}`);
      await sendUpdate(hash, channel);
    }

    if (!versionExists) {
      addVersion(hash, channel);
    }

    return;
  }

  if (!versionExists) {
    console.log(`New ${channel} version: ${hash}`);
    addVersion(hash, channel);

    if (channel === "ZBeta") {
      await sendPreUpdate(hash, channel);
    } else {
      await sendUpdate(hash, channel);

      const betaVersion = db
        .prepare(
          `
            SELECT 1
            FROM knownVersions
            WHERE hash = ?
            AND robloxChannel = 'ZBeta'
          `,
        )
        .get(hash);

      if (betaVersion) {
        markReleased(hash);
        console.log(`${hash} has been released`);
      }
    }
  }

  updateChannelState(channel, hash);
}

let monitoring = false;
export async function startMonitoring() {
  if (monitoring) {
    console.log("Update monitoring already running.");
    return;
  }

  monitoring = true;
  console.log("Update monitoring running.");

  async function check() {
    for (const channel of ROBLOX_CHANNELS) {
      try {
        await checkChannel(channel);
      } catch (error) {
        console.error(`Error while checking ${channel}:`, error);
      }
    }
  }

  while (monitoring) {
    await check();
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
