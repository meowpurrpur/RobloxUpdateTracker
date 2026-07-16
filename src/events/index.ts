import fs from "node:fs";
import path from "node:path";

type Event = {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => any;
};

export async function loadEvents(): Promise<Event[]> {
  const eventsPath = __dirname;

  return Promise.all(
    fs
      .readdirSync(eventsPath)
      .filter(
        (file) =>
          (file.endsWith(".ts") || file.endsWith(".js")) &&
          file !== "index.ts" &&
          file !== "index.js",
      )
      .map(async (file) => {
        const event = await import(path.join(eventsPath, file));

        return event.default ?? event;
      }),
  );
}
