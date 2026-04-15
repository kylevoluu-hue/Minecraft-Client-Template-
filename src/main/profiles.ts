import { randomUUID } from 'node:crypto';
import type { Profile } from '@shared/types';
import { profilesFile, defaultGameDir } from './paths';
import { readJson, writeJson } from './storage';

interface ProfileStore {
  profiles: Profile[];
  activeProfileId: string | null;
}

const EMPTY: ProfileStore = { profiles: [], activeProfileId: null };

async function load(): Promise<ProfileStore> {
  return readJson<ProfileStore>(profilesFile(), EMPTY);
}

async function save(store: ProfileStore): Promise<void> {
  await writeJson(profilesFile(), store);
}

export async function listProfiles(): Promise<Profile[]> {
  const { profiles } = await load();
  return profiles;
}

export async function getActiveProfile(): Promise<Profile | null> {
  const { profiles, activeProfileId } = await load();
  return profiles.find((p) => p.id === activeProfileId) ?? null;
}

export async function createProfile(
  input: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Profile> {
  const store = await load();
  const id = randomUUID();
  const now = Date.now();
  const profile: Profile = {
    ...input,
    id,
    gameDir: input.gameDir || defaultGameDir(id),
    createdAt: now,
    updatedAt: now
  };
  store.profiles.push(profile);
  if (!store.activeProfileId) store.activeProfileId = id;
  await save(store);
  return profile;
}

export async function updateProfile(
  id: string,
  patch: Partial<Profile>
): Promise<Profile> {
  const store = await load();
  const idx = store.profiles.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Profile ${id} not found`);
  const updated: Profile = {
    ...store.profiles[idx],
    ...patch,
    id, // id is immutable
    updatedAt: Date.now()
  };
  store.profiles[idx] = updated;
  await save(store);
  return updated;
}

export async function removeProfile(id: string): Promise<void> {
  const store = await load();
  store.profiles = store.profiles.filter((p) => p.id !== id);
  if (store.activeProfileId === id) {
    store.activeProfileId = store.profiles[0]?.id ?? null;
  }
  await save(store);
}

export async function setActiveProfile(id: string): Promise<void> {
  const store = await load();
  if (!store.profiles.some((p) => p.id === id)) {
    throw new Error(`Profile ${id} not found`);
  }
  store.activeProfileId = id;
  await save(store);
}

/** Bootstraps a default profile on first launch so the UI isn't empty. */
export async function ensureSeedProfile(): Promise<void> {
  const store = await load();
  if (store.profiles.length > 0) return;
  await createProfile({
    name: 'Default',
    mcVersion: '1.20.4',
    loader: 'fabric',
    gameDir: '',
    memoryMb: 4096,
    enabledMods: [],
    selectedShader: null
  });
}
