import { REST, Routes } from "discord.js";
import config from "./config";
import { loadCommands } from "../commands";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_BOT_TOKEN);

export async function registerCommands() {
  try {
    const commands = await loadCommands();
    const commandsData = Object.values(commands).map((command) => command.data);

    console.log("Started registering commands.");

    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: commandsData,
    });

    console.log("Successfully registered commands.");
  } catch (error) {
    console.error(error);
  }
}

registerCommands();
