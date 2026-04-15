import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { Shader } from '@shared/types';
import { listProfiles, updateProfile } from './profiles';

async function profileGameDir(profileId: string): Promise<string> {
  const profile = (await listProfiles()).find((p) => p.id === profileId);
  if (!profile) throw new Error(`Profile ${profileId} not found`);
  return profile.gameDir;
}

export async function scanShaders(profileId: string): Promise<Shader[]> {
  const gameDir = await profileGameDir(profileId);
  const dir = join(gameDir, 'shaderpacks');
  await fs.mkdir(dir, { recursive: true });

  const entries = await fs.readdir(dir);
  const profile = (await listProfiles()).find((p) => p.id === profileId)!;

  return entries
    .filter((e) => e.endsWith('.zip') || e.endsWith('.zip.disabled'))
    .map<Shader>((e) => {
      const id = e.replace(/\.disabled$/, '');
      return {
        id,
        name: id.replace(/\.zip$/, '').replace(/[-_]+/g, ' '),
        filePath: join(dir, e),
        enabled: profile.selectedShader === id
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Selects (or clears) the active shader for a profile and writes Iris's
 * config file so the selection is picked up on next launch.
 */
export async function selectShader(
  profileId: string,
  shaderId: string | null
): Promise<void> {
  const gameDir = await profileGameDir(profileId);
  const configDir = join(gameDir, 'config');
  await fs.mkdir(configDir, { recursive: true });

  const irisProps = join(configDir, 'iris.properties');
  const existing = await readPropsSafe(irisProps);
  if (shaderId) {
    existing['shaderPack'] = shaderId;
    existing['enableShaders'] = 'true';
  } else {
    existing['shaderPack'] = '';
    existing['enableShaders'] = 'false';
  }
  await fs.writeFile(irisProps, serializeProps(existing), 'utf8');
  await updateProfile(profileId, { selectedShader: shaderId });
}

async function readPropsSafe(path: string): Promise<Record<string, string>> {
  try {
    const text = await fs.readFile(path, 'utf8');
    const out: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
    return out;
  } catch {
    return {};
  }
}

function serializeProps(map: Record<string, string>): string {
  return (
    '# Managed by Universal Client\n' +
    Object.entries(map)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') +
    '\n'
  );
}
