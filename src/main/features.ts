import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { FeatureSettings } from '@shared/features';
import { DEFAULT_FEATURE_SETTINGS } from '@shared/features';
import { listProfiles } from './profiles';
import { readJson, writeJson } from './storage';

// Per-profile feature settings. Stored in the launcher's userData AND
// mirrored into <gameDir>/config/universal-client.json so the companion
// Fabric mod can read it at game launch.

async function profileGameDir(profileId: string): Promise<string> {
  const profile = (await listProfiles()).find((p) => p.id === profileId);
  if (!profile) throw new Error(`Profile ${profileId} not found`);
  return profile.gameDir;
}

function featureFile(gameDir: string): string {
  return join(gameDir, 'config', 'universal-client.json');
}

/** Shape written to disk: the settings plus a tiny version marker. */
interface OnDisk {
  schemaVersion: 1;
  settings: FeatureSettings;
}

export async function getFeatures(profileId: string): Promise<FeatureSettings> {
  const gameDir = await profileGameDir(profileId);
  const onDisk = await readJson<OnDisk>(featureFile(gameDir), {
    schemaVersion: 1,
    settings: DEFAULT_FEATURE_SETTINGS
  });
  // Merge in case new fields were added since the file was last written.
  return deepMergeDefaults(onDisk.settings, DEFAULT_FEATURE_SETTINGS);
}

export async function updateFeatures(
  profileId: string,
  patch: DeepPartial<FeatureSettings>
): Promise<FeatureSettings> {
  const current = await getFeatures(profileId);
  const next = deepMerge(current, patch);
  const gameDir = await profileGameDir(profileId);
  await fs.mkdir(join(gameDir, 'config'), { recursive: true });
  await writeJson(featureFile(gameDir), { schemaVersion: 1, settings: next });
  return next;
}

export async function resetFeatures(profileId: string): Promise<FeatureSettings> {
  const gameDir = await profileGameDir(profileId);
  await fs.mkdir(join(gameDir, 'config'), { recursive: true });
  await writeJson(featureFile(gameDir), {
    schemaVersion: 1,
    settings: DEFAULT_FEATURE_SETTINGS
  });
  return DEFAULT_FEATURE_SETTINGS;
}

// ---------- small helpers ----------
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge<T extends object>(base: T, patch: DeepPartial<T>): T {
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge((base as any)[k] ?? {}, v as any);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

/** Fill in any missing keys from defaults without overwriting user values. */
function deepMergeDefaults<T extends object>(value: T, defaults: T): T {
  const out: any = { ...defaults, ...value };
  for (const k of Object.keys(defaults) as (keyof T)[]) {
    const d = (defaults as any)[k];
    const v = (value as any)[k];
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      out[k] = deepMergeDefaults(v ?? {}, d);
    }
  }
  return out;
}
