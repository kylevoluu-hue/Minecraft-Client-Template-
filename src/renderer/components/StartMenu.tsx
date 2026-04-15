import { useEffect, useState } from 'react';
import { useStore } from '../state/store';

interface Props {
  onEnter: () => void;
}

/**
 * Animated start menu. CSS-only galaxy background — no assets required.
 * Three parallax star layers + a slow-drifting nebula + a pulsing brand mark.
 */
export function StartMenu({ onEnter }: Props): JSX.Element {
  const active = useStore((s) =>
    s.profiles.find((p) => p.id === s.activeProfileId)
  );
  const [leaving, setLeaving] = useState(false);

  function handleEnter(): void {
    setLeaving(true);
    // Match the CSS fade-out duration.
    setTimeout(onEnter, 450);
  }

  // Allow Enter / Space to trigger too.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Enter' || e.key === ' ') handleEnter();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`uc-start ${leaving ? 'leaving' : ''}`}>
      <div className="uc-galaxy">
        <div className="uc-nebula uc-nebula-a" />
        <div className="uc-nebula uc-nebula-b" />
        <div className="uc-nebula uc-nebula-c" />
        <div className="uc-stars uc-stars-1" />
        <div className="uc-stars uc-stars-2" />
        <div className="uc-stars uc-stars-3" />
        <div className="uc-shooting" />
        <div className="uc-shooting uc-shooting-2" />
      </div>

      <div className="uc-start-content">
        <div className="uc-logo">
          <div className="uc-logo-ring" />
          <div className="uc-logo-ring uc-logo-ring-2" />
          <div className="uc-logo-core" />
        </div>
        <h1 className="uc-start-title">Universal Client</h1>
        <p className="uc-start-tag">A modern launcher for Minecraft: Java Edition</p>

        <button className="uc-start-btn" onClick={handleEnter}>
          <span>▶ Enter Client</span>
        </button>

        <div className="uc-start-meta">
          {active
            ? `${active.name} • ${active.loader} ${active.mcVersion}`
            : 'No profile selected'}
          <span className="uc-start-hint">  press Enter</span>
        </div>
      </div>
    </div>
  );
}
