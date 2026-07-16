//export const CLIENTSETTINGS_BASE = "https://clientsettings.roblox.com";
export const CLIENTSETTINGS_BASE = "http://localhost:7722";

export const RDD_BASE = "https://rdd.latte.to"
export const ROBLOX_CHANNELS = ["LIVE", "ZBeta"] as const;

export type RobloxChannel = (typeof ROBLOX_CHANNELS)[number];
