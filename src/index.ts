import { client } from "./lib/client";
import config from "./lib/config";
import { startMonitoring } from "./monitoring";
import { commands } from "./commands";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands[interaction.commandName as keyof typeof commands];
  if (command) {
    await command.execute(interaction);
  }
});

client.once("clientReady", () => {
  console.log("Logged into Discord bot!");
  startMonitoring();
});

client.login(config.DISCORD_BOT_TOKEN);
