import type { Mod } from '@shared/types';
import { getCategory } from '@shared/categories';
import { useStore } from '../state/store';

interface Props {
  mod: Mod;
}

export function ModCard({ mod }: Props): JSX.Element {
  const toggle = useStore((s) => s.toggleMod);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const refreshAll = useStore((s) => s.refreshAll);
  const cat = getCategory(mod.category);

  async function handleRemove(): Promise<void> {
    if (!activeProfileId) return;
    if (!confirm(`Delete "${mod.name}" from disk? This cannot be undone.`)) return;
    await window.uc.mods.remove(activeProfileId, mod.id);
    await refreshAll();
  }

  return (
    <article className="uc-card">
      <div className="uc-card-head">
        <div className="uc-card-title">{mod.name}</div>
        <button
          className={`uc-toggle ${mod.enabled ? 'on' : ''}`}
          onClick={() => toggle(mod.id, !mod.enabled)}
          aria-label={`Toggle ${mod.name}`}
          aria-pressed={mod.enabled}
        />
      </div>
      <div className="uc-card-desc">
        {mod.description || 'No description provided.'}
      </div>
      <div className="uc-card-meta">
        <span className="uc-tag">
          {cat.icon} {cat.label}
        </span>
        {mod.version && <span className="uc-tag">v{mod.version}</span>}
        {mod.mcVersion && <span className="uc-tag">MC {mod.mcVersion}</span>}
        <span style={{ flex: 1 }} />
        <button
          className="uc-link-btn"
          onClick={handleRemove}
          title="Delete this mod file from disk"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
