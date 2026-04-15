import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Atomic JSON read/write. Writes to `<file>.tmp` then renames, so a crash
 * mid-write never leaves a half-written profile file.
 */
export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const buf = await fs.readFile(file, 'utf8');
    return JSON.parse(buf) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

export async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}
