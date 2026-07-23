export const RDD_BASE = "https://rdd.weao.gg"
export const ROBLOX_CHANNELS = ["LIVE", "ZBeta"] as const;

export type RobloxChannel = (typeof ROBLOX_CHANNELS)[number];
