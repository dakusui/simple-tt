import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import SuperJSON from "superjson";
export function ensureDirectoryExists(dirName: string) {
  if (!existsSync(dirName)) mkdirSync(dirName, {recursive: true});
}

export function saveFile(fileName: string, content: string) {
  writeFileSync(fileName, content);
}

export function readJsonSync<T>(filePath: string): T {
  const fileContent = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent) as T;
}

export function readObjectFromJson<T>(filePath: string): T {
  const fileContent = readFileSync(filePath, "utf-8");
  return SuperJSON.parse(fileContent) as T;
}

