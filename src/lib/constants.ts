export const CLIENTSETTINGS_BASE = "https://clientsettings.roblox.com";
export const RDD_BASE = "https://rdd.whatexpsare.online"
export const ROBLOX_CHANNELS = ["LIVE", "ZBeta"] as const;

export type RobloxChannel = (typeof ROBLOX_CHANNELS)[number];
