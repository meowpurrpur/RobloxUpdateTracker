import { Client, Collection } from "discord.js";

export const client = new Client({
  intents: ["Guilds", "GuildMessages"],
});

client.commands = new Collection();
