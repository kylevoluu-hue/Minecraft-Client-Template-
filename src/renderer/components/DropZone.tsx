import { useCallback, useState, type ReactNode } from 'react';
import type { ImportResult } from '@shared/types';
import { useStore } from '../state/store';

interface Props {
  kind: 'mods' | 'shaders';
  children: ReactNode;
}

/**
 * Wraps a page in a drag-and-drop zone. Files dropped on the page are
 * imported into the active profile. Uses Electron's `webUtils.getPathForFile`
 * when available (Electron >= 32) and falls back to `file.path` on older
 * versions — both give us the absolute path to the file on disk.
 */
export function DropZone({ kind, children }: Props): JSX.Element {
  const { activeProfileId, refreshAll } = useStore();
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<string>('');

  const onDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent): void => {
    // Only clear when leaving the outer element, not a child.
    if (e.currentTarget === e.target) setDragging(false);
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent): Promise<void> => {
      e.preventDefault();
      setDragging(false);
      if (!activeProfileId) return;

      const paths: string[] = [];
      for (const file of Array.from(e.dataTransfer.files)) {
        // `file.path` is non-standard but populated by Electron. Newer
        // Electron versions deprecate it in favor of webUtils.
        const anyFile = file as File & { path?: string };
        if (anyFile.path) paths.push(anyFile.path);
      }
      if (paths.length === 0) {
        setStatus('Drop did not include file paths');
        return;
      }

      const result: ImportResult =
        kind === 'mods'
          ? await window.uc.mods.importPaths(activeProfileId, paths)
          : await window.uc.shaders.importPaths(activeProfileId, paths);

      const parts: string[] = [];
      if (result.imported.length)
        parts.push(`Imported ${result.imported.length}`);
      if (result.skipped.length)
        parts.push(`Skipped ${result.skipped.length}`);
      setStatus(parts.join(' • '));
      await refreshAll();
    },
    [activeProfileId, kind, refreshAll]
  );

  return (
    <div
      className={`uc-dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {dragging && (
        <div className="uc-dropzone-overlay">
          <div className="uc-dropzone-card">
            <div className="uc-dropzone-icon">⬇</div>
            <div className="uc-dropzone-title">
              Drop to add {kind === 'mods' ? '.jar mods' : '.zip shader packs'}
            </div>
          </div>
        </div>
      )}
      {status && <div className="uc-dropzone-status">{status}</div>}
    </div>
  );
}
