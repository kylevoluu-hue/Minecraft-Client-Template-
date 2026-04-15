import { app } from 'electron';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

// Centralized path helpers. Everything the launcher writes lives under
// userData, so uninstalling is a clean rm -rf.

export function userDataDir(): string {
  return app.getPath('userData');
}

export function profilesFile(): string {
  return join(userDataDir(), 'profiles.json');
}

export function settingsFile(): string {
  return join(userDataDir(), 'settings.json');
}

export function overridesFile(): string {
  return join(userDataDir(), 'overrides.json');
}

export function defaultGameDir(profileId: string): string {
  const dir = join(userDataDir(), 'instances', profileId);
  mkdirSync(join(dir, 'mods'), { recursive: true });
  mkdirSync(join(dir, 'shaderpacks'), { recursive: true });
  mkdirSync(join(dir, 'config'), { recursive: true });
  return dir;
}
