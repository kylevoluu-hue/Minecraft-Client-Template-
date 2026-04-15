// Shared data model between main and renderer processes.
// Keep this dependency-free so both sides can import it.

export type CategoryId =
  | 'performance'
  | 'visuals'
  | 'pvp'
  | 'utility'
  | 'cosmetics'
  | 'shaders';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // emoji or icon key; rendered by the sidebar
  description: string;
}

export interface Mod {
  /** Stable id. Uses the filename (without .disabled) so toggles are stable. */
  id: string;
  /** Human-readable name, from mod metadata or filename fallback. */
  name: string;
  description?: string;
  author?: string;
  version?: string;
  /** Absolute path to the jar on disk. */
  filePath: string;
  /** True when the file ends in .jar, false when .jar.disabled. */
  enabled: boolean;
  category: CategoryId;
  /** MC version this mod targets, if the metadata declared one. */
  mcVersion?: string;
}

export interface Shader {
  id: string;
  name: string;
  filePath: string;
  enabled: boolean; // only one shader is "active"; this reflects the selection
}

export interface Profile {
  id: string;
  name: string;
  /** Minecraft version e.g. "1.20.4". */
  mcVersion: string;
  /** "vanilla" | "fabric" | "forge" | "quilt" */
  loader: 'vanilla' | 'fabric' | 'forge' | 'quilt';
  /** Per-profile game directory. Mods/shaders resolve against this. */
  gameDir: string;
  /** JVM memory in MB. */
  memoryMb: number;
  /** Mod ids the user has marked enabled in this profile. */
  enabledMods: string[];
  /** Selected shader pack filename, or null. */
  selectedShader: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ImportResult {
  imported: string[];
  skipped: string[];
}

export interface LauncherSettings {
  theme: 'dark' | 'light';
  javaPath?: string;
  defaultMemoryMb: number;
  activeProfileId: string | null;
}

// ---------- IPC surface (exposed via preload as window.uc) ----------

export interface UCApi {
  profiles: {
    list(): Promise<Profile[]>;
    create(input: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile>;
    update(id: string, patch: Partial<Profile>): Promise<Profile>;
    remove(id: string): Promise<void>;
    setActive(id: string): Promise<void>;
    getActive(): Promise<Profile | null>;
  };
  mods: {
    scan(profileId: string): Promise<Mod[]>;
    setEnabled(profileId: string, modId: string, enabled: boolean): Promise<Mod>;
    setCategory(modId: string, category: CategoryId): Promise<void>;
    /** Open the profile's mods/ folder in the OS file manager. */
    openFolder(profileId: string): Promise<string>;
    /** Pick .jar files via native file dialog and copy them in. */
    pickAndImport(profileId: string): Promise<ImportResult>;
    /** Import a list of absolute .jar paths (e.g. from drag-and-drop). */
    importPaths(profileId: string, paths: string[]): Promise<ImportResult>;
    /** Permanently delete a mod file (both enabled and disabled variants). */
    remove(profileId: string, modId: string): Promise<void>;
  };
  shaders: {
    scan(profileId: string): Promise<Shader[]>;
    select(profileId: string, shaderId: string | null): Promise<void>;
    openFolder(profileId: string): Promise<string>;
    pickAndImport(profileId: string): Promise<ImportResult>;
    importPaths(profileId: string, paths: string[]): Promise<ImportResult>;
    remove(profileId: string, shaderId: string): Promise<void>;
  };
  settings: {
    get(): Promise<LauncherSettings>;
    update(patch: Partial<LauncherSettings>): Promise<LauncherSettings>;
  };
  launch: {
    start(profileId: string): Promise<{ pid: number } | { error: string }>;
  };
}

declare global {
  interface Window {
    uc: UCApi;
  }
}
