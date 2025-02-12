import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
export function ensureDirectoryExists(dirName: string) {
  if (!existsSync(dirName)) mkdirSync(dirName, {recursive: true});
}

export function saveFile(fileName: string, content: string) {
  writeFileSync(fileName, content);
}

export function readJsonSync(filePath: string) {
  const fileContent = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}
