import { Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(...args: any[]) {
  console.log("Logged into Discord bot!");
}
