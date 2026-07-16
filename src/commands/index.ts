import fs from "node:fs";
import path from "node:path";

type Command = {
  data: {
    name: string;
  };
  execute: (...args: any[]) => any;
};

export async function loadCommands(): Promise<Record<string, Command>> {
  const commandsPath = __dirname;
  const commands: Record<string, Command> = {};

  for (const file of fs.readdirSync(commandsPath)) {
    if (!file.endsWith(".ts") || file === "index.ts") {
      continue;
    }

    const command = (await import(path.join(commandsPath, file))) as Command;
    commands[command.data.name] = command;
  }

  return commands;
}
