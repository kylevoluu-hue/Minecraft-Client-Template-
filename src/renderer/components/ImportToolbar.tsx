import { useState } from 'react';
import type { ImportResult } from '@shared/types';
import { useStore } from '../state/store';

type Kind = 'mods' | 'shaders';

interface Props {
  kind: Kind;
}

/**
 * Toolbar shown on category pages: "Add Files…", "Open Folder", "Refresh".
 * The open-folder button reveals the profile's mods/ or shaderpacks/
 * directory in the OS file manager, so users can drop files in manually.
 */
export function ImportToolbar({ kind }: Props): JSX.Element {
  const { activeProfileId, refreshAll } = useStore();
  const [status, setStatus] = useState<string>('');

  async function handlePick(): Promise<void> {
    if (!activeProfileId) return;
    const result: ImportResult =
      kind === 'mods'
        ? await window.uc.mods.pickAndImport(activeProfileId)
        : await window.uc.shaders.pickAndImport(activeProfileId);
    reportImport(result);
    await refreshAll();
  }

  async function handleOpenFolder(): Promise<void> {
    if (!activeProfileId) return;
    const path =
      kind === 'mods'
        ? await window.uc.mods.openFolder(activeProfileId)
        : await window.uc.shaders.openFolder(activeProfileId);
    setStatus(`Opened: ${path}`);
  }

  function reportImport(r: ImportResult): void {
    const parts: string[] = [];
    if (r.imported.length) parts.push(`Imported ${r.imported.length}`);
    if (r.skipped.length) parts.push(`Skipped ${r.skipped.length}`);
    setStatus(parts.join(' • ') || 'Nothing selected');
  }

  const label = kind === 'mods' ? '.jar mods' : '.zip shader packs';

  return (
    <div className="uc-toolbar">
      <button className="uc-btn primary" onClick={handlePick}>
        + Add {kind === 'mods' ? 'Mods' : 'Shaders'}
      </button>
      <button className="uc-btn" onClick={handleOpenFolder}>
        📁 Open Folder
      </button>
      <button className="uc-btn" onClick={refreshAll}>
        ↻ Refresh
      </button>
      <span className="uc-toolbar-hint">
        {status || `Drag ${label} anywhere on this page to add them`}
      </span>
    </div>
  );
}
