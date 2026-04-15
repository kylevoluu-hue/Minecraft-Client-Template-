import { useMemo } from 'react';
import type { CategoryId, Mod } from '@shared/types';
import { getCategory } from '@shared/categories';
import { useStore } from '../state/store';
import { ModCard } from '../components/ModCard';
import { LaunchBar } from '../components/LaunchBar';
import { ImportToolbar } from '../components/ImportToolbar';
import { DropZone } from '../components/DropZone';

interface Props {
  categoryId: CategoryId;
}

export function CategoryPage({ categoryId }: Props): JSX.Element {
  const { mods, shaders, search, sort, selectShader } = useStore();
  const cat = getCategory(categoryId);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const refreshAll = useStore((s) => s.refreshAll);

  // Hooks must run on every render path, so compute the mod list here
  // even when we'll render the shader view.
  const filteredMods = useMemo(() => {
    const needle = search.toLowerCase();
    const base = mods
      .filter((m) => m.category === categoryId)
      .filter((m) => !needle || m.name.toLowerCase().includes(needle));
    return sortMods(base, sort);
  }, [mods, categoryId, search, sort]);

  async function removeShader(id: string, name: string): Promise<void> {
    if (!activeProfileId) return;
    if (!confirm(`Delete shader pack "${name}" from disk?`)) return;
    await window.uc.shaders.remove(activeProfileId, id);
    await refreshAll();
  }

  // Shader category is a special view - one-of-N selection rather than toggles.
  if (categoryId === 'shaders') {
    const filtered = shaders.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <DropZone kind="shaders">
        <h1 className="uc-page-title">
          {cat.icon} {cat.label}
        </h1>
        <p className="uc-page-sub">{cat.description}</p>

        <ImportToolbar kind="shaders" />

        <div className="uc-grid">
          <article className="uc-card">
            <div className="uc-card-head">
              <div className="uc-card-title">No shader</div>
              <button
                className={`uc-toggle ${
                  shaders.every((s) => !s.enabled) ? 'on' : ''
                }`}
                onClick={() => selectShader(null)}
                aria-label="Disable shaders"
              />
            </div>
            <div className="uc-card-desc">Run Minecraft without a shader pack.</div>
          </article>

          {filtered.map((s) => (
            <article key={s.id} className="uc-card">
              <div className="uc-card-head">
                <div className="uc-card-title">{s.name}</div>
                <button
                  className={`uc-toggle ${s.enabled ? 'on' : ''}`}
                  onClick={() => selectShader(s.enabled ? null : s.id)}
                  aria-pressed={s.enabled}
                />
              </div>
              <div className="uc-card-desc">Iris / Oculus shader pack.</div>
              <div className="uc-card-meta">
                <span style={{ flex: 1 }} />
                <button
                  className="uc-link-btn"
                  onClick={() => removeShader(s.id, s.name)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <LaunchBar />
      </DropZone>
    );
  }

  return (
    <DropZone kind="mods">
      <h1 className="uc-page-title">
        {cat.icon} {cat.label}
      </h1>
      <p className="uc-page-sub">{cat.description}</p>

      <ImportToolbar kind="mods" />

      {filteredMods.length === 0 ? (
        <div className="uc-card" style={{ maxWidth: 480 }}>
          <div className="uc-card-title">No mods in this category yet</div>
          <div className="uc-card-desc">
            Click <strong>Add Mods</strong>, drag <code>.jar</code> files
            anywhere on this page, or use <strong>Open Folder</strong> to
            copy them in manually. Mods auto-categorize by name, and you
            can always re-categorize them later.
          </div>
        </div>
      ) : (
        <div className="uc-grid">
          {filteredMods.map((m) => (
            <ModCard key={m.id} mod={m} />
          ))}
        </div>
      )}

      <LaunchBar />
    </DropZone>
  );
}

function sortMods(mods: Mod[], sort: 'name' | 'category' | 'enabled'): Mod[] {
  const copy = [...mods];
  if (sort === 'name') copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'category')
    copy.sort((a, b) => a.category.localeCompare(b.category));
  if (sort === 'enabled')
    copy.sort((a, b) => Number(b.enabled) - Number(a.enabled));
  return copy;
}
