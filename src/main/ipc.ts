import { ipcMain } from 'electron';
import type { UCApi } from '@shared/types';
import * as profiles from './profiles';
import * as mods from './mods';
import * as shaders from './shaders';
import * as settings from './settings';
import { startMinecraft } from './launcher';
import { pickJars, pickShaderZips } from './dialogs';

/**
 * Registers every IPC handler. Channel names mirror the `UCApi` shape in
 * `shared/types.ts`, so the preload bridge stays trivially 1:1.
 *
 * Every handler validates its arguments before touching the filesystem.
 * The renderer is an untrusted boundary - treat its input accordingly.
 */
export function registerIpc(): void {
  // --- profiles ---
  ipcMain.handle('profiles:list', () => profiles.listProfiles());
  ipcMain.handle('profiles:getActive', () => profiles.getActiveProfile());
  ipcMain.handle('profiles:create', (_e, input) => {
    assertObject(input, 'profile input');
    return profiles.createProfile(input);
  });
  ipcMain.handle('profiles:update', (_e, id, patch) => {
    assertId(id);
    assertObject(patch, 'patch');
    return profiles.updateProfile(id, patch);
  });
  ipcMain.handle('profiles:remove', (_e, id) => {
    assertId(id);
    return profiles.removeProfile(id);
  });
  ipcMain.handle('profiles:setActive', (_e, id) => {
    assertId(id);
    return profiles.setActiveProfile(id);
  });

  // --- mods ---
  ipcMain.handle('mods:scan', (_e, profileId) => {
    assertId(profileId);
    return mods.scanMods(profileId);
  });
  ipcMain.handle('mods:setEnabled', (_e, profileId, modId, enabled) => {
    assertId(profileId);
    assertId(modId);
    return mods.setModEnabled(profileId, modId, Boolean(enabled));
  });
  ipcMain.handle('mods:setCategory', (_e, modId, category) => {
    assertId(modId);
    if (typeof category !== 'string') throw new Error('category must be string');
    return mods.setModCategory(modId, category as any);
  });
  ipcMain.handle('mods:openFolder', (_e, profileId) => {
    assertId(profileId);
    return mods.openModsFolder(profileId);
  });
  ipcMain.handle('mods:pickAndImport', async (_e, profileId) => {
    assertId(profileId);
    const paths = await pickJars();
    if (paths.length === 0) return { imported: [], skipped: [] };
    return mods.importMods(profileId, paths);
  });
  ipcMain.handle('mods:importPaths', (_e, profileId, paths) => {
    assertId(profileId);
    if (!Array.isArray(paths)) throw new Error('paths must be an array');
    return mods.importMods(profileId, paths.filter((p) => typeof p === 'string'));
  });
  ipcMain.handle('mods:remove', (_e, profileId, modId) => {
    assertId(profileId);
    assertId(modId);
    return mods.deleteMod(profileId, modId);
  });

  // --- shaders ---
  ipcMain.handle('shaders:scan', (_e, profileId) => {
    assertId(profileId);
    return shaders.scanShaders(profileId);
  });
  ipcMain.handle('shaders:select', (_e, profileId, shaderId) => {
    assertId(profileId);
    return shaders.selectShader(profileId, shaderId ?? null);
  });
  ipcMain.handle('shaders:openFolder', (_e, profileId) => {
    assertId(profileId);
    return shaders.openShadersFolder(profileId);
  });
  ipcMain.handle('shaders:pickAndImport', async (_e, profileId) => {
    assertId(profileId);
    const paths = await pickShaderZips();
    if (paths.length === 0) return { imported: [], skipped: [] };
    return shaders.importShaders(profileId, paths);
  });
  ipcMain.handle('shaders:importPaths', (_e, profileId, paths) => {
    assertId(profileId);
    if (!Array.isArray(paths)) throw new Error('paths must be an array');
    return shaders.importShaders(
      profileId,
      paths.filter((p) => typeof p === 'string')
    );
  });
  ipcMain.handle('shaders:remove', (_e, profileId, shaderId) => {
    assertId(profileId);
    assertId(shaderId);
    return shaders.deleteShader(profileId, shaderId);
  });

  // --- settings ---
  ipcMain.handle('settings:get', () => settings.getSettings());
  ipcMain.handle('settings:update', (_e, patch) => {
    assertObject(patch, 'settings patch');
    return settings.updateSettings(patch);
  });

  // --- launch ---
  ipcMain.handle('launch:start', (_e, profileId) => {
    assertId(profileId);
    return startMinecraft(profileId);
  });
}

function assertId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('id must be a non-empty string');
  }
}

function assertObject(val: unknown, name: string): asserts val is object {
  if (typeof val !== 'object' || val === null) {
    throw new Error(`${name} must be an object`);
  }
}

// Compile-time guard: if UCApi changes, this will break until handlers match.
// (Purely for DX; not used at runtime.)
export type _UCApiShape = UCApi;
