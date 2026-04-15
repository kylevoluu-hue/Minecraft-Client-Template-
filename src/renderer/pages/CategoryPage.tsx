import { useMemo } from 'react';
import type { CategoryId, Mod } from '@shared/types';
import { getCategory } from '@shared/categories';
import { useStore } from '../state/store';
import { ModCard } from '../components/ModCard';
import { LaunchBar } from '../components/LaunchBar';

interface Props {
  categoryId: CategoryId;
}

export function CategoryPage({ categoryId }: Props): JSX.Element {
  const { mods, shaders, search, sort, selectShader } = useStore();
  const cat = getCategory(categoryId);

  // Shader category is a special view - one-of-N selection rather than toggles.
  if (categoryId === 'shaders') {
    const filtered = shaders.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <>
        <h1 className="uc-page-title">
          {cat.icon} {cat.label}
        </h1>
        <p className="uc-page-sub">{cat.description}</p>

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
            </article>
          ))}
        </div>

        <LaunchBar />
      </>
    );
  }

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    const base = mods
      .filter((m) => m.category === categoryId)
      .filter((m) => !needle || m.name.toLowerCase().includes(needle));
    return sortMods(base, sort);
  }, [mods, categoryId, search, sort]);

  return (
    <>
      <h1 className="uc-page-title">
        {cat.icon} {cat.label}
      </h1>
      <p className="uc-page-sub">{cat.description}</p>

      {filtered.length === 0 ? (
        <div className="uc-card" style={{ maxWidth: 420 }}>
          <div className="uc-card-title">Nothing here yet</div>
          <div className="uc-card-desc">
            Drop <code>.jar</code> files into your profile's{' '}
            <code>mods/</code> folder and click a category to see them.
          </div>
        </div>
      ) : (
        <div className="uc-grid">
          {filtered.map((m) => (
            <ModCard key={m.id} mod={m} />
          ))}
        </div>
      )}

      <LaunchBar />
    </>
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
