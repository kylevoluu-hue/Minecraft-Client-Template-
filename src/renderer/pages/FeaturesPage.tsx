import { FEATURES } from '@shared/features';
import type { CrosshairStyle } from '@shared/features';
import { useStore } from '../state/store';
import { LaunchBar } from '../components/LaunchBar';
import { CrosshairPreview } from '../components/CrosshairPreview';

/**
 * Built-in Client Features. Toggles are persisted per-profile and written
 * to <gameDir>/config/universal-client.json, which the companion Fabric
 * mod reads at game launch.
 */
export function FeaturesPage(): JSX.Element {
  const { features, patchFeatures, resetFeatures } = useStore();

  return (
    <>
      <h1 className="uc-page-title">✨ Client Features</h1>
      <p className="uc-page-sub">
        Built-in, pre-installed features. Toggle them here; settings are saved
        per profile and applied in-game by the companion mod.
      </p>

      <div className="uc-feat-list">
        {/* --- Motion Blur --- */}
        <FeatureRow
          def={FEATURES.find((f) => f.id === 'motionBlur')!}
          enabled={features.motionBlur.enabled}
          onToggle={(enabled) => patchFeatures({ motionBlur: { enabled } })}
        >
          <Slider
            label="Intensity"
            min={0}
            max={100}
            value={features.motionBlur.intensity}
            onChange={(intensity) => patchFeatures({ motionBlur: { intensity } })}
            suffix="%"
          />
        </FeatureRow>

        {/* --- Hitboxes --- */}
        <FeatureRow
          def={FEATURES.find((f) => f.id === 'hitboxes')!}
          enabled={features.hitboxes.enabled}
          onToggle={(enabled) => patchFeatures({ hitboxes: { enabled } })}
        >
          <Color
            label="Box color"
            value={features.hitboxes.color}
            onChange={(color) => patchFeatures({ hitboxes: { color } })}
          />
          <Check
            label="Show eye-line"
            value={features.hitboxes.showEyeLine}
            onChange={(showEyeLine) =>
              patchFeatures({ hitboxes: { showEyeLine } })
            }
          />
        </FeatureRow>

        {/* --- Reach Display --- */}
        <FeatureRow
          def={FEATURES.find((f) => f.id === 'reachDisplay')!}
          enabled={features.reachDisplay.enabled}
          onToggle={(enabled) => patchFeatures({ reachDisplay: { enabled } })}
        >
          <Color
            label="Text color"
            value={features.reachDisplay.color}
            onChange={(color) => patchFeatures({ reachDisplay: { color } })}
          />
          <Slider
            label="Decimals"
            min={0}
            max={3}
            value={features.reachDisplay.precision}
            onChange={(precision) =>
              patchFeatures({ reachDisplay: { precision } })
            }
          />
          <Check
            label="Players only"
            value={features.reachDisplay.playersOnly}
            onChange={(playersOnly) =>
              patchFeatures({ reachDisplay: { playersOnly } })
            }
          />
        </FeatureRow>

        {/* --- Custom Crosshair --- */}
        <FeatureRow
          def={FEATURES.find((f) => f.id === 'crosshair')!}
          enabled={features.crosshair.enabled}
          onToggle={(enabled) => patchFeatures({ crosshair: { enabled } })}
          extraHead={<CrosshairPreview settings={features.crosshair} />}
        >
          <Radio
            label="Style"
            value={features.crosshair.style}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'cross', label: 'Cross' },
              { value: 'dot', label: 'Dot' },
              { value: 'circle', label: 'Circle' },
              { value: 't-shape', label: 'T-Shape' }
            ]}
            onChange={(style) =>
              patchFeatures({ crosshair: { style: style as CrosshairStyle } })
            }
          />
          <Color
            label="Color"
            value={features.crosshair.color}
            onChange={(color) => patchFeatures({ crosshair: { color } })}
          />
          <Slider
            label="Size"
            min={4}
            max={32}
            value={features.crosshair.size}
            onChange={(size) => patchFeatures({ crosshair: { size } })}
            suffix="px"
          />
          <Slider
            label="Opacity"
            min={0}
            max={100}
            value={features.crosshair.opacity}
            onChange={(opacity) => patchFeatures({ crosshair: { opacity } })}
            suffix="%"
          />
        </FeatureRow>

        {/* --- HUD Overlays --- */}
        <FeatureRow
          def={FEATURES.find((f) => f.id === 'hudOverlays')!}
          enabled={features.hudOverlays.enabled}
          onToggle={(enabled) => patchFeatures({ hudOverlays: { enabled } })}
        >
          <Check
            label="FPS counter"
            value={features.hudOverlays.fps}
            onChange={(fps) => patchFeatures({ hudOverlays: { fps } })}
          />
          <Check
            label="Coordinates"
            value={features.hudOverlays.coordinates}
            onChange={(coordinates) =>
              patchFeatures({ hudOverlays: { coordinates } })
            }
          />
          <Check
            label="Time"
            value={features.hudOverlays.time}
            onChange={(time) => patchFeatures({ hudOverlays: { time } })}
          />
          <Check
            label="Ping"
            value={features.hudOverlays.ping}
            onChange={(ping) => patchFeatures({ hudOverlays: { ping } })}
          />
          <Check
            label="Armor status"
            value={features.hudOverlays.armor}
            onChange={(armor) => patchFeatures({ hudOverlays: { armor } })}
          />
          <Radio
            label="Position"
            value={features.hudOverlays.position}
            options={[
              { value: 'top-left', label: '↖ TL' },
              { value: 'top-right', label: '↗ TR' },
              { value: 'bottom-left', label: '↙ BL' },
              { value: 'bottom-right', label: '↘ BR' }
            ]}
            onChange={(position) =>
              patchFeatures({ hudOverlays: { position: position as any } })
            }
          />
        </FeatureRow>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="uc-btn" onClick={resetFeatures}>
          Reset all features to defaults
        </button>
      </div>

      <LaunchBar />
    </>
  );
}

// ---------- Small presentational helpers ----------

interface FeatureRowProps {
  def: { name: string; icon: string; description: string };
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
  extraHead?: React.ReactNode;
}

function FeatureRow({
  def,
  enabled,
  onToggle,
  children,
  extraHead
}: FeatureRowProps): JSX.Element {
  return (
    <section className={`uc-feat-card ${enabled ? 'on' : ''}`}>
      <header className="uc-feat-head">
        <div className="uc-feat-title">
          <span className="uc-feat-icon">{def.icon}</span>
          <div>
            <div className="uc-feat-name">{def.name}</div>
            <div className="uc-feat-desc">{def.description}</div>
          </div>
        </div>
        <div className="uc-feat-head-right">
          {extraHead}
          <button
            className={`uc-toggle ${enabled ? 'on' : ''}`}
            onClick={() => onToggle(!enabled)}
            aria-pressed={enabled}
          />
        </div>
      </header>
      {enabled && children && <div className="uc-feat-body">{children}</div>}
    </section>
  );
}

function Slider(props: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}): JSX.Element {
  return (
    <label className="uc-control">
      <span className="uc-control-label">{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <span className="uc-control-value">
        {props.value}
        {props.suffix ?? ''}
      </span>
    </label>
  );
}

function Color(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <label className="uc-control">
      <span className="uc-control-label">{props.label}</span>
      <input
        type="color"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
      <span className="uc-control-value">{props.value}</span>
    </label>
  );
}

function Check(props: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}): JSX.Element {
  return (
    <label className="uc-control uc-control-check">
      <input
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span>{props.label}</span>
    </label>
  );
}

function Radio<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}): JSX.Element {
  return (
    <div className="uc-control uc-control-radio">
      <span className="uc-control-label">{props.label}</span>
      <div className="uc-radio-group">
        {props.options.map((opt) => (
          <button
            key={opt.value}
            className={`uc-btn ${props.value === opt.value ? 'primary' : ''}`}
            onClick={() => props.onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
