import type { Category, CategoryId } from './types';

// Add a new category by appending an entry here. The sidebar, category
// resolution, and filtering all pick it up automatically.
export const CATEGORIES: Category[] = [
  {
    id: 'performance',
    label: 'Performance',
    icon: '⚡',
    description: 'FPS, memory, and tick-rate optimizations.'
  },
  {
    id: 'visuals',
    label: 'Visuals',
    icon: '🎨',
    description: 'Rendering, lighting, particles, and world visuals.'
  },
  {
    id: 'pvp',
    label: 'PvP',
    icon: '⚔️',
    description: 'Combat HUDs, hitbox overlays, and ping indicators.'
  },
  {
    id: 'utility',
    label: 'Utility',
    icon: '🛠️',
    description: 'Quality-of-life tools and info overlays.'
  },
  {
    id: 'cosmetics',
    label: 'Cosmetics',
    icon: '✨',
    description: 'Capes, emotes, and purely cosmetic additions.'
  },
  {
    id: 'shaders',
    label: 'Shader Packs',
    icon: '🌅',
    description: 'Iris / Oculus shader packs.'
  }
];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

export function getCategory(id: CategoryId): Category {
  const match = CATEGORIES.find((c) => c.id === id);
  if (!match) throw new Error(`Unknown category: ${id}`);
  return match;
}

/**
 * Best-effort guess of a mod's category from its name. Users can always
 * override this in the UI; the override is stored in `overrides.json`.
 */
export function guessCategory(name: string): CategoryId {
  const n = name.toLowerCase();
  if (/(sodium|lithium|phosphor|ferrite|starlight|krypton|lazydfu)/.test(n))
    return 'performance';
  if (/(iris|oculus|shader)/.test(n)) return 'shaders';
  if (/(cape|emote|skin|cosmetic)/.test(n)) return 'cosmetics';
  if (/(hitbox|reach|ping|toggle-sprint|keystrokes)/.test(n)) return 'pvp';
  if (/(distanthorizons|entityculling|entity-culling|bettergrass|continuity|lambdynamic)/.test(n))
    return 'visuals';
  return 'utility';
}
