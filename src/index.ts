import { client } from "./lib/client";
import config from "./lib/config";
import { loadCommands } from "./commands";
import { loadEvents } from "./events";

async function start() {
  const commands = await loadCommands();

  for (const [name, command] of Object.entries(commands)) {
    client.commands.set(name, command);
  }

  const events = await loadEvents();
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  await client.login(config.DISCORD_BOT_TOKEN);
}

start();
