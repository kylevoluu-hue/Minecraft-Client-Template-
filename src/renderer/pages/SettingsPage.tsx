import { useEffect, useState } from 'react';
import type { LauncherSettings, Profile } from '@shared/types';
import { useStore } from '../state/store';

export function SettingsPage(): JSX.Element {
  const { profiles, activeProfileId, refreshAll } = useStore();
  const [settings, setSettings] = useState<LauncherSettings | null>(null);

  useEffect(() => {
    window.uc.settings.get().then(setSettings);
  }, []);

  async function patchSettings(patch: Partial<LauncherSettings>): Promise<void> {
    const next = await window.uc.settings.update(patch);
    setSettings(next);
  }

  async function createProfile(): Promise<void> {
    const name = prompt('Profile name?');
    if (!name) return;
    await window.uc.profiles.create({
      name,
      mcVersion: '1.20.4',
      loader: 'fabric',
      gameDir: '',
      memoryMb: 4096,
      enabledMods: [],
      selectedShader: null
    });
    await refreshAll();
  }

  async function patchProfile(
    id: string,
    patch: Partial<Profile>
  ): Promise<void> {
    await window.uc.profiles.update(id, patch);
    await refreshAll();
  }

  async function removeProfile(id: string): Promise<void> {
    if (!confirm('Delete this profile? Mods on disk are kept.')) return;
    await window.uc.profiles.remove(id);
    await refreshAll();
  }

  return (
    <>
      <h1 className="uc-page-title">⚙️ Settings</h1>
      <p className="uc-page-sub">Launcher preferences and profile management.</p>

      <section style={{ marginBottom: 28 }}>
        <h3>Launcher</h3>
        <div className="uc-card" style={{ maxWidth: 560 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span>Theme</span>
            <select
              className="uc-select"
              value={settings?.theme ?? 'dark'}
              onChange={(e) => patchSettings({ theme: e.target.value as any })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span>Default memory (MB)</span>
            <input
              className="uc-select"
              type="number"
              step={512}
              min={1024}
              value={settings?.defaultMemoryMb ?? 4096}
              onChange={(e) =>
                patchSettings({ defaultMemoryMb: Number(e.target.value) })
              }
              style={{ width: 120 }}
            />
          </label>
          <label style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>Java path (optional)</span>
            <input
              className="uc-select"
              placeholder="auto-detect"
              value={settings?.javaPath ?? ''}
              onChange={(e) => patchSettings({ javaPath: e.target.value })}
              style={{ flex: 1 }}
            />
          </label>
        </div>
      </section>

      <section>
        <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Profiles / Presets</span>
          <button className="uc-btn" onClick={createProfile}>+ New profile</button>
        </h3>
        <div className="uc-grid">
          {profiles.map((p) => (
            <article key={p.id} className="uc-card">
              <div className="uc-card-head">
                <div className="uc-card-title">
                  {p.name}
                  {p.id === activeProfileId && (
                    <span className="uc-tag" style={{ marginLeft: 8 }}>active</span>
                  )}
                </div>
                <button
                  className="uc-btn"
                  onClick={() => removeProfile(p.id)}
                  style={{ color: 'var(--uc-danger)' }}
                >
                  Delete
                </button>
              </div>
              <div className="uc-card-desc">
                {p.loader} {p.mcVersion} • {p.memoryMb} MB
              </div>
              <label style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span style={{ width: 90 }}>Loader</span>
                <select
                  className="uc-select"
                  value={p.loader}
                  onChange={(e) =>
                    patchProfile(p.id, { loader: e.target.value as any })
                  }
                  style={{ flex: 1 }}
                >
                  <option value="vanilla">Vanilla</option>
                  <option value="fabric">Fabric</option>
                  <option value="forge">Forge</option>
                  <option value="quilt">Quilt</option>
                </select>
              </label>
              <label style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: 90 }}>MC version</span>
                <input
                  className="uc-select"
                  value={p.mcVersion}
                  onChange={(e) =>
                    patchProfile(p.id, { mcVersion: e.target.value })
                  }
                  style={{ flex: 1 }}
                />
              </label>
              <label style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: 90 }}>Memory MB</span>
                <input
                  className="uc-select"
                  type="number"
                  value={p.memoryMb}
                  onChange={(e) =>
                    patchProfile(p.id, { memoryMb: Number(e.target.value) })
                  }
                  style={{ flex: 1 }}
                />
              </label>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
