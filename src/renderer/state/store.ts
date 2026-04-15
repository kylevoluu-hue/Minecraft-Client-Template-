import { create } from 'zustand';
import type {
  CategoryId,
  Mod,
  Profile,
  Shader
} from '@shared/types';

type SortKey = 'name' | 'category' | 'enabled';

interface UCState {
  profiles: Profile[];
  activeProfileId: string | null;
  mods: Mod[];
  shaders: Shader[];

  // UI
  activeCategory: CategoryId | 'home' | 'settings';
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
}

export const useStore = create<UCState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  mods: [],
  shaders: [],
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
    set({ profiles, activeProfileId, mods, shaders });
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
  }
}));
