import { create } from 'zustand';
import type {
  CategoryId,
  FeatureSettings,
  Mod,
  Profile,
  Shader
} from '@shared/types';
import { DEFAULT_FEATURE_SETTINGS } from '@shared/features';

type SortKey = 'name' | 'category' | 'enabled';

interface UCState {
  profiles: Profile[];
  activeProfileId: string | null;
  mods: Mod[];
  shaders: Shader[];
  features: FeatureSettings;

  // UI
  activeCategory: CategoryId | 'home' | 'settings' | 'features';
  search: string;
  sort: SortKey;

  // actions
  setActiveCategory: (c: UCState['activeCategory']) => void;
  setSearch: (s: string) => void;
  setSort: (s: SortKey) => void;

  refreshAll: () => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
  toggleMod: (modId: string, enabled: boolean) => Promise<void>;
  selectShader: (shaderId: string | null) => Promise<void>;
  launch: () => Promise<{ pid: number } | { error: string }>;
  patchFeatures: (patch: any) => Promise<void>;
  resetFeatures: () => Promise<void>;
}

export const useStore = create<UCState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  mods: [],
  shaders: [],
  features: DEFAULT_FEATURE_SETTINGS,
  activeCategory: 'home',
  search: '',
  sort: 'name',

  setActiveCategory: (c) => set({ activeCategory: c }),
  setSearch: (s) => set({ search: s }),
  setSort: (s) => set({ sort: s }),

  refreshAll: async () => {
    const profiles = await window.uc.profiles.list();
    const active = await window.uc.profiles.getActive();
    const activeProfileId = active?.id ?? null;
    const mods = activeProfileId
      ? await window.uc.mods.scan(activeProfileId)
      : [];
    const shaders = activeProfileId
      ? await window.uc.shaders.scan(activeProfileId)
      : [];
    const features = activeProfileId
      ? await window.uc.features.get(activeProfileId)
      : DEFAULT_FEATURE_SETTINGS;
    set({ profiles, activeProfileId, mods, shaders, features });
  },

  setActiveProfile: async (id) => {
    await window.uc.profiles.setActive(id);
    await get().refreshAll();
  },

  toggleMod: async (modId, enabled) => {
    const { activeProfileId } = get();
    if (!activeProfileId) return;
    const updated = await window.uc.mods.setEnabled(
      activeProfileId,
      modId,
      enabled
    );
    set((s) => ({
      mods: s.mods.map((m) => (m.id === modId ? updated : m))
    }));
  },

  selectShader: async (shaderId) => {
    const { activeProfileId } = get();
    if (!activeProfileId) return;
    await window.uc.shaders.select(activeProfileId, shaderId);
    const shaders = await window.uc.shaders.scan(activeProfileId);
    set({ shaders });
  },

  launch: async () => {
    const { activeProfileId } = get();
    if (!activeProfileId) return { error: 'No active profile' };
    return window.uc.launch.start(activeProfileId);
  },

  patchFeatures: async (patch) => {
    const { activeProfileId } = get();
    if (!activeProfileId) return;
    const next = await window.uc.features.update(activeProfileId, patch);
    set({ features: next });
  },

  resetFeatures: async () => {
    const { activeProfileId } = get();
    if (!activeProfileId) return;
    const next = await window.uc.features.reset(activeProfileId);
    set({ features: next });
  }
}));
