import { promises as fs } from 'node:fs';
import { join, basename } from 'node:path';
import { shell } from 'electron';
import type { CategoryId, Mod } from '@shared/types';
import { guessCategory } from '@shared/categories';
import { overridesFile } from './paths';
import { readJson, writeJson } from './storage';
import { listProfiles } from './profiles';

const DISABLED_SUFFIX = '.disabled';

export async function getModsDir(profileId: string): Promise<string> {
  const gameDir = await profileGameDir(profileId);
  const dir = join(gameDir, 'mods');
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Opens the profile's mods/ folder in the OS file manager. */
export async function openModsFolder(profileId: string): Promise<string> {
  const dir = await getModsDir(profileId);
  const err = await shell.openPath(dir);
  if (err) throw new Error(err);
  return dir;
}

/**
 * Copies user-provided .jar files into the profile's mods/ folder.
 * Accepts absolute paths (from a file picker or drag-and-drop).
 * Skips anything that isn't a .jar and any file that already exists
 * (to avoid silently clobbering the user's current copy).
 */
export async function importMods(
  profileId: string,
  sourcePaths: string[]
): Promise<{ imported: string[]; skipped: string[] }> {
  const modsDir = await getModsDir(profileId);
  const imported: string[] = [];
  const skipped: string[] = [];

  for (const src of sourcePaths) {
    const name = basename(src);
    if (!name.toLowerCase().endsWith('.jar')) {
      skipped.push(`${name} (not a .jar)`);
      continue;
    }
    const dest = join(modsDir, name);
    try {
      await fs.copyFile(src, dest, fs.constants.COPYFILE_EXCL);
      imported.push(name);
    } catch (err: any) {
      if (err.code === 'EEXIST') skipped.push(`${name} (already exists)`);
      else skipped.push(`${name} (${err.message})`);
    }
  }

  return { imported, skipped };
}

/** Deletes a mod file from disk. */
export async function deleteMod(
  profileId: string,
  modId: string
): Promise<void> {
  const modsDir = await getModsDir(profileId);
  for (const candidate of [modId, modId + DISABLED_SUFFIX]) {
    const p = join(modsDir, candidate);
    try {
      await fs.unlink(p);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

interface OverrideStore {
  /** modId -> category override chosen by the user */
  categories: Record<string, CategoryId>;
  /** modId -> display-name override */
  names: Record<string, string>;
}

async function loadOverrides(): Promise<OverrideStore> {
  return readJson<OverrideStore>(overridesFile(), { categories: {}, names: {} });
}

async function saveOverrides(store: OverrideStore): Promise<void> {
  await writeJson(overridesFile(), store);
}

function stripDisabled(name: string): string {
  return name.endsWith(DISABLED_SUFFIX)
    ? name.slice(0, -DISABLED_SUFFIX.length)
    : name;
}

function prettifyName(filename: string): string {
  return stripDisabled(filename)
    .replace(/\.jar$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+\d+(\.\d+)+.*$/, '') // drop trailing version
    .trim();
}

async function profileGameDir(profileId: string): Promise<string> {
  const profile = (await listProfiles()).find((p) => p.id === profileId);
  if (!profile) throw new Error(`Profile ${profileId} not found`);
  return profile.gameDir;
}

export async function scanMods(profileId: string): Promise<Mod[]> {
  const gameDir = await profileGameDir(profileId);
  const modsDir = join(gameDir, 'mods');
  await fs.mkdir(modsDir, { recursive: true });

  const entries = await fs.readdir(modsDir);
  const overrides = await loadOverrides();
  const mods: Mod[] = [];

  for (const entry of entries) {
    if (!entry.endsWith('.jar') && !entry.endsWith(DISABLED_SUFFIX)) continue;
    const id = stripDisabled(entry);
    const enabled = !entry.endsWith(DISABLED_SUFFIX);
    const filePath = join(modsDir, entry);
    const displayName = overrides.names[id] ?? prettifyName(entry);
    const category: CategoryId =
      overrides.categories[id] ?? guessCategory(displayName);

    mods.push({
      id,
      name: displayName,
      filePath,
      enabled,
      category
      // NOTE: reading fabric.mod.json / mods.toml from the jar is a good
      // next step (use `yauzl` or `adm-zip`) to populate description,
      // author, version, mcVersion. Omitted here to keep deps minimal.
    });
  }

  return mods.sort((a, b) => a.name.localeCompare(b.name));
}

export async function setModEnabled(
  profileId: string,
  modId: string,
  enabled: boolean
): Promise<Mod> {
  const gameDir = await profileGameDir(profileId);
  const modsDir = join(gameDir, 'mods');
  const enabledPath = join(modsDir, modId);
  const disabledPath = enabledPath + DISABLED_SUFFIX;

  const hasEnabled = await exists(enabledPath);
  const hasDisabled = await exists(disabledPath);

  if (enabled && hasDisabled && !hasEnabled) {
    await fs.rename(disabledPath, enabledPath);
  } else if (!enabled && hasEnabled && !hasDisabled) {
    await fs.rename(enabledPath, disabledPath);
  }
  // If both or neither exist, we treat the on-disk state as source of truth
  // and do nothing rather than silently clobbering a user's file.

  const all = await scanMods(profileId);
  const result = all.find((m) => m.id === modId);
  if (!result) throw new Error(`Mod ${modId} not found after toggle`);
  return result;
}

export async function setModCategory(
  modId: string,
  category: CategoryId
): Promise<void> {
  const store = await loadOverrides();
  store.categories[modId] = category;
  await saveOverrides(store);
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
}
