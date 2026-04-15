import type { FeatureSettings } from '@shared/types';

/** Live SVG preview of the current crosshair settings. */
export function CrosshairPreview({
  settings
}: {
  settings: FeatureSettings['crosshair'];
}): JSX.Element {
  const { style, color, size, opacity } = settings;
  const c = 40; // svg center
  const half = size / 2;
  const op = opacity / 100;
  const stroke = 2;

  return (
    <div className="uc-crosshair-preview">
      <svg width={80} height={80} viewBox="0 0 80 80">
        <defs>
          <pattern id="chk" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#2a2f42" />
            <rect x="4" y="4" width="4" height="4" fill="#2a2f42" />
          </pattern>
        </defs>
        <rect width="80" height="80" fill="url(#chk)" rx="6" />
        <g stroke={color} fill={color} strokeWidth={stroke} opacity={op}>
          {style === 'default' && (
            <>
              <line x1={c - half} y1={c} x2={c - 2} y2={c} />
              <line x1={c + 2} y1={c} x2={c + half} y2={c} />
              <line x1={c} y1={c - half} x2={c} y2={c - 2} />
              <line x1={c} y1={c + 2} x2={c} y2={c + half} />
            </>
          )}
          {style === 'cross' && (
            <>
              <line x1={c - half} y1={c} x2={c + half} y2={c} />
              <line x1={c} y1={c - half} x2={c} y2={c + half} />
            </>
          )}
          {style === 'dot' && (
            <circle cx={c} cy={c} r={Math.max(1, size / 6)} stroke="none" />
          )}
          {style === 'circle' && (
            <circle cx={c} cy={c} r={half} fill="none" />
          )}
          {style === 't-shape' && (
            <>
              <line x1={c - half} y1={c} x2={c + half} y2={c} />
              <line x1={c} y1={c} x2={c} y2={c + half} />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
