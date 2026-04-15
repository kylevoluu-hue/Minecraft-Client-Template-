import type { LauncherSettings } from '@shared/types';
import { settingsFile } from './paths';
import { readJson, writeJson } from './storage';

const DEFAULTS: LauncherSettings = {
  theme: 'dark',
  defaultMemoryMb: 4096,
  activeProfileId: null
};

export async function getSettings(): Promise<LauncherSettings> {
  return readJson<LauncherSettings>(settingsFile(), DEFAULTS);
}

export async function updateSettings(
  patch: Partial<LauncherSettings>
): Promise<LauncherSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await writeJson(settingsFile(), next);
  return next;
}
