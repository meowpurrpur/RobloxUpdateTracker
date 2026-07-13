import dotenv from "dotenv";
import path from "path";
dotenv.config({ quiet: true, path: path.join(__dirname, "../../.env") });

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Required environment variables are missing!");
}

export default { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID };
