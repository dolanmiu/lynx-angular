import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type BlotchConfig = {
  aliases: {
    components: string;
    utils: string;
    theme: string;
  };
};

const CONFIG_FILE = 'blotch.config.json';

export const getConfigPath = (cwd: string): string => {
  return resolve(cwd, CONFIG_FILE);
};

export const configExists = (cwd: string): boolean => {
  return existsSync(getConfigPath(cwd));
};

export const readConfig = (cwd: string): BlotchConfig => {
  const path = getConfigPath(cwd);
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as BlotchConfig;
};

export const writeConfig = (cwd: string, config: BlotchConfig): void => {
  const path = getConfigPath(cwd);
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
};
