// Registry of built-in "client features" (not jar mods). These are toggles
// the launcher owns; a companion Fabric mod reads the generated config file
// from <gameDir>/config/universal-client.json and actually renders them
// inside the Minecraft game loop.

export type FeatureId =
  | 'motionBlur'
  | 'hitboxes'
  | 'reachDisplay'
  | 'crosshair'
  | 'hudOverlays';

export interface FeatureDef {
  id: FeatureId;
  name: string;
  icon: string;
  description: string;
  category: 'visuals' | 'pvp' | 'utility' | 'cosmetics';
}

export const FEATURES: FeatureDef[] = [
  {
    id: 'motionBlur',
    name: 'Motion Blur',
    icon: '💨',
    description: 'Smooths fast camera movement with a configurable blur.',
    category: 'visuals'
  },
  {
    id: 'hitboxes',
    name: 'Show Hitboxes',
    icon: '📦',
    description: 'Draws entity hitboxes (same as vanilla F3+B, with color control).',
    category: 'pvp'
  },
  {
    id: 'reachDisplay',
    name: 'Reach Display',
    icon: '📏',
    description: 'Displays your measured reach after each attack.',
    category: 'pvp'
  },
  {
    id: 'crosshair',
    name: 'Custom Crosshair',
    icon: '✛',
    description: 'Replace the vanilla crosshair with a custom style.',
    category: 'cosmetics'
  },
  {
    id: 'hudOverlays',
    name: 'HUD Overlays',
    icon: '🖥️',
    description: 'FPS, coordinates, time, ping, and armor overlays.',
    category: 'utility'
  }
];

export type CrosshairStyle = 'default' | 'cross' | 'dot' | 'circle' | 't-shape';

// Per-feature settings. Kept flat-ish so serializing to JSON is trivial.
export interface FeatureSettings {
  motionBlur: {
    enabled: boolean;
    /** 0-100, how strong the blur is */
    intensity: number;
  };
  hitboxes: {
    enabled: boolean;
    color: string; // hex
    /** Also draw the eye-line + look vector */
    showEyeLine: boolean;
  };
  reachDisplay: {
    enabled: boolean;
    color: string;
    /** Decimal places, 0-3 */
    precision: number;
    /** Only show when attacking a player */
    playersOnly: boolean;
  };
  crosshair: {
    enabled: boolean;
    style: CrosshairStyle;
    color: string;
    /** 4-32 px */
    size: number;
    /** 0-100 */
    opacity: number;
  };
  hudOverlays: {
    enabled: boolean;
    fps: boolean;
    coordinates: boolean;
    time: boolean;
    ping: boolean;
    armor: boolean;
    /** 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' */
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

export const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
  motionBlur: { enabled: false, intensity: 40 },
  hitboxes: { enabled: false, color: '#ff5ca7', showEyeLine: false },
  reachDisplay: {
    enabled: false,
    color: '#7c5cff',
    precision: 2,
    playersOnly: true
  },
  crosshair: {
    enabled: false,
    style: 'default',
    color: '#ffffff',
    size: 12,
    opacity: 100
  },
  hudOverlays: {
    enabled: false,
    fps: true,
    coordinates: true,
    time: false,
    ping: false,
    armor: false,
    position: 'top-left'
  }
};
