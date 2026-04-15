import { spawn } from 'node:child_process';
import { listProfiles } from './profiles';
import { getSettings } from './settings';

/**
 * Spawns the Minecraft Java process for a profile.
 *
 * This is intentionally a thin wrapper. For a production launcher you should
 * use `minecraft-launcher-core` (listed as an optional dep) which handles:
 *   - downloading the vanilla client jar, libraries, and assets
 *   - building the full classpath and JVM arg list
 *   - Fabric / Forge / Quilt loader bootstrapping
 *   - Microsoft account auth tokens (via `msmc`)
 *
 * Wiring that in is straightforward:
 *
 *   import { Client } from 'minecraft-launcher-core';
 *   const client = new Client();
 *   client.launch({
 *     authorization: await authManager.getProfile(),
 *     root: profile.gameDir,
 *     version: { number: profile.mcVersion, type: 'release' },
 *     memory: { max: `${profile.memoryMb}M`, min: '1024M' }
 *   });
 *
 * The stub below just verifies the Java path is runnable so the UI round-trip
 * works end-to-end during development.
 */
export async function startMinecraft(
  profileId: string
): Promise<{ pid: number } | { error: string }> {
  const profile = (await listProfiles()).find((p) => p.id === profileId);
  if (!profile) return { error: `Profile ${profileId} not found` };
  const settings = await getSettings();
  const java = settings.javaPath || 'java';

  try {
    const child = spawn(java, ['-version'], {
      cwd: profile.gameDir,
      stdio: 'ignore',
      detached: false
    });
    if (!child.pid) return { error: 'Failed to spawn Java process' };
    return { pid: child.pid };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
