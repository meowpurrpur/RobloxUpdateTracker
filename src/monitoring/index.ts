import fetch from "node-fetch";
import db from "../lib/db";
import {
  ROBLOX_CHANNELS,
  RobloxChannel,
} from "../lib/constants";
import CLIENTSETTINGS_BASE from "../lib/config";
import { sendUpdate, sendPreUpdate, sendRevert } from "./alerts";

function getChannelUrl(channel: RobloxChannel) {
  return `${CLIENTSETTINGS_BASE}/v2/client-version/WindowsPlayer/channel/${channel}`;
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

async function checkChannel(channel: RobloxChannel) {
  const response = await fetch(getChannelUrl(channel));
  if(!response.ok) return;
  
  const data = (await response.json()) as {
    clientVersionUpload?: string;
  };

  const hash = data.clientVersionUpload;
  if (!hash) {
    return;
  }

  const currentState = db
    .prepare(
      `
        SELECT currentVersion
        FROM channelState
        WHERE robloxChannel = ?
      `,
    )
    .get(channel) as {
    currentVersion: string;
  } | undefined;

  const versionExists = hasVersion(hash, channel);
  if (channel !== "ZBeta" && currentState && currentState.currentVersion !== hash) {
    if (versionExists) {
      console.log(
        `${channel} version reverted: ${currentState.currentVersion} -> ${hash}`,
      );

      await sendRevert(hash, currentState.currentVersion, channel);
    } else {
      console.log(
        `New ${channel} version: ${hash}`,
      );

      addVersion(hash, channel);
      await sendUpdate(hash, channel);
    }

    db.prepare(
      `
        INSERT INTO channelState (
          robloxChannel,
          currentVersion
        )
        VALUES (?, ?)
        ON CONFLICT(robloxChannel)
        DO UPDATE SET currentVersion = excluded.currentVersion
      `,
    ).run(channel, hash);

    return;
  }

  if (!versionExists) {
    console.log(`New ${channel} version: ${hash}`);
    addVersion(hash, channel);

    if (channel === "ZBeta") {
      await sendPreUpdate(hash, channel);
    } else {
      await sendUpdate(hash, channel);
    }

    if (channel !== "ZBeta") {
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

  db.prepare(
    `
      INSERT INTO channelState (
        robloxChannel,
        currentVersion
      )
      VALUES (?, ?)
      ON CONFLICT(robloxChannel)
      DO UPDATE SET currentVersion = excluded.currentVersion
    `,
  ).run(channel, hash);
}

export async function startMonitoring() {
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

  await check();
  setInterval(check, 10000);
}
