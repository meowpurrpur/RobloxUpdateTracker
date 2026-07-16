import dotenv from "dotenv";
import path from "path";
dotenv.config({ quiet: true, path: path.join(__dirname, "../../.env") });

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, CLIENTSETTINGS_BASE } =
  process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID || !CLIENTSETTINGS_BASE) {
  throw new Error("Required environment variables are missing!");
}

export default { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, CLIENTSETTINGS_BASE };
