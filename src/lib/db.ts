import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../data.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS alerts (
    channelId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    robloxChannel TEXT NOT NULL,
    customContent TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    
    PRIMARY KEY (channelId, robloxChannel)
);

CREATE TABLE IF NOT EXISTS dmAlerts (
    userId TEXT NOT NULL,
    robloxChannel TEXT NOT NULL,
    customContent TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 1,

    PRIMARY KEY (userId, robloxChannel)
);

CREATE TABLE IF NOT EXISTS knownVersions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL,
    robloxChannel TEXT NOT NULL,
    released BOOLEAN NOT NULL DEFAULT 0,
    detectedAt INTEGER NOT NULL,
    UNIQUE(hash, robloxChannel)
);

CREATE TABLE IF NOT EXISTS channelState (
    robloxChannel TEXT PRIMARY KEY,
    currentVersion TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knownVersions_robloxChannel
ON knownVersions (robloxChannel);
`);

export default db;