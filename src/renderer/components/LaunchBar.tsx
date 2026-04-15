import { useState } from 'react';
import { useStore } from '../state/store';

export function LaunchBar(): JSX.Element {
  const launch = useStore((s) => s.launch);
  const active = useStore((s) =>
    s.profiles.find((p) => p.id === s.activeProfileId)
  );
  const [status, setStatus] = useState<string>('');

  async function onLaunch(): Promise<void> {
    setStatus('Launching…');
    const result = await launch();
    if ('error' in result) setStatus(`Error: ${result.error}`);
    else setStatus(`Started (pid ${result.pid})`);
  }

  return (
    <div className="uc-launchbar">
      <div style={{ color: 'var(--uc-text-dim)' }}>
        Profile: <strong style={{ color: 'var(--uc-text)' }}>{active?.name ?? '—'}</strong>
        {active && `  •  ${active.loader} ${active.mcVersion}  •  ${active.memoryMb} MB`}
      </div>
      <div className="spacer" />
      <span style={{ color: 'var(--uc-text-dim)' }}>{status}</span>
      <button className="uc-btn primary" onClick={onLaunch} disabled={!active}>
        ▶ Launch Minecraft
      </button>
    </div>
  );
}
