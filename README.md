# Universal Client

A clean, modular launcher and client UI framework for **Minecraft: Java Edition**.
Manages mods, shaders, settings, and profiles with a modern dark UI.

> This is a **launcher/framework** only. It does not bundle or promote cheats,
> hacks, or any gameplay behavior that violates Mojang/Microsoft's EULA or the
> rules of any server. Mods loaded here are standard Fabric/Forge/Quilt-style
> mods that the user chooses to install.

---

## 1. Tech Stack

| Layer        | Choice                                  | Why                                            |
| ------------ | --------------------------------------- | ---------------------------------------------- |
| Shell        | **Electron**                            | Cross-platform desktop, Node FS access         |
| Build        | **Vite** + **electron-vite**            | Fast HMR, TS out of the box                    |
| UI           | **React 18** + **TypeScript**           | Component model, strong typing                 |
| State        | **Zustand**                             | Minimal, no boilerplate                        |
| Styling      | CSS variables + CSS modules             | Theme-swappable (dark default)                 |
| Launching    | Node `child_process` + minecraft-launcher-core (optional) | Spawns the Java process |
| Auth         | `msmc` (Microsoft auth) *(optional)*    | Legal MS account login                         |

## 2. Project Structure

```
universal-client/
├── package.json
├── tsconfig.json
├── electron.vite.config.ts
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # App entry, window creation
│   │   ├── ipc.ts             # IPC handlers registered here
│   │   ├── paths.ts           # User-data / .minecraft paths
│   │   ├── profiles.ts        # CRUD for profiles (JSON on disk)
│   │   ├── mods.ts            # Scan/enable/disable mod JARs
│   │   ├── shaders.ts         # Scan/enable/disable shader packs
│   │   └── launcher.ts        # Spawn Minecraft Java process
│   ├── preload/
│   │   └── index.ts           # contextBridge -> window.uc
│   ├── renderer/              # React UI
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── state/store.ts
│   │   ├── styles/theme.css
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ModCard.tsx
│   │   │   └── ProfileBar.tsx
│   │   └── pages/
│   │       ├── HomePage.tsx
│   │       ├── CategoryPage.tsx
│   │       └── SettingsPage.tsx
│   └── shared/
│       ├── types.ts           # Mod, Shader, Profile, Category
│       └── categories.ts      # Category registry (add new ones here)
└── README.md
```

## 3. Launcher / Client Architecture

```
                     ┌─────────────────────────────┐
                     │          Renderer           │
                     │   (React UI, Zustand store) │
                     └─────────────┬───────────────┘
                                   │  window.uc.*  (contextBridge)
                     ┌─────────────▼───────────────┐
                     │           Preload           │
                     │   safe IPC API surface      │
                     └─────────────┬───────────────┘
                                   │ ipcRenderer.invoke
                     ┌─────────────▼───────────────┐
                     │       Electron Main         │
                     │  profiles │ mods │ shaders  │
                     │          launcher           │
                     └─────────────┬───────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
   ~/AppData/UC/              .minecraft/                 Java process
   profiles.json              mods/, shaderpacks/         (Minecraft)
```

- **Renderer** is sandboxed; no direct Node access.
- **Preload** exposes a typed API (`window.uc`) via `contextBridge`.
- **Main** owns the filesystem, profile store, and launch process.
- Each **profile** has its own isolated `gameDir` so mod sets don't collide.

## 4. Menu / UI Layout

```
┌──────────┬──────────────────────────────────────────────────┐
│ Universal│  Search: [________]   Sort: [A-Z ▾]   [+ Profile]│
│ Client   ├──────────────────────────────────────────────────┤
│          │  Category: Performance                           │
│ 🏠 Home  │  ┌────────────────────┐ ┌────────────────────┐   │
│ ⚡ Perf   │  │ Sodium        [on] │ │ Lithium       [off]│   │
│ 🎨 Visual│  │ FPS boost…        │ │ Server tick opt…  │   │
│ ⚔ PvP    │  └────────────────────┘ └────────────────────┘   │
│ 🛠 Util  │                                                  │
│ ✨ Cosm   │  Profile: [Default ▾]    [▶ Launch Minecraft]    │
│ 🌅 Shader│                                                  │
│ ⚙ Setting└──────────────────────────────────────────────────┘
```

- Left sidebar = categories from `shared/categories.ts` (extensible).
- Top bar = search, sort, profile picker, Launch button.
- Main pane = card grid, each card has a toggle for enable/disable.

## 5. How Mods and Shaders Are Loaded / Toggled

**Mods** (`.jar` files in `<gameDir>/mods/`):
- Scanned on startup and when the user clicks refresh.
- "Disabled" = file is renamed from `foo.jar` → `foo.jar.disabled`
  (Fabric/Forge ignore non-`.jar` extensions).
- Metadata (name, description, category) is read from `fabric.mod.json`
  / `mods.toml` inside the JAR when available; otherwise falls back to
  filename + a user-maintained `metadata.json` override.

**Shaders** (packs in `<gameDir>/shaderpacks/`):
- Similar scan.
- Enabling a shader writes the selected name into
  `<gameDir>/config/iris.properties` (or `oculus.properties`) so Iris/Oculus
  picks it up on next launch.

**Categorization:**
- Each mod's category is resolved by: explicit user override → shipped
  category map → fallback `"Utility"`.
- Adding a new category = add one entry in `shared/categories.ts`.

## 6. How Settings Are Saved Locally

- All launcher state lives under `app.getPath('userData')`:
  - `profiles.json` – list of profiles + active profile id
  - `overrides.json` – per-mod metadata overrides (category, displayName)
  - `settings.json` – theme, window size, Java path, memory allocation
- JSON files are written **atomically** (write to `.tmp` then rename) to
  avoid corruption on crash.
- Profiles are self-contained and can be exported/imported as a single JSON
  file for sharing presets.

## 7. Starter Code

See the `src/` tree in this repo. Key files to read first:

- `src/shared/types.ts` – the data model
- `src/shared/categories.ts` – add categories here
- `src/main/profiles.ts` – profile persistence
- `src/main/mods.ts` – scan/toggle logic
- `src/renderer/App.tsx` – top-level UI
- `src/renderer/pages/CategoryPage.tsx` – search/sort/toggle grid

## 8. Limitations & Best Practices

**Limitations**
- Does **not** ship Minecraft itself. You still need a valid Mojang/MS
  account and the game files. Use `msmc` for authentication.
- Does **not** include Fabric/Forge installers — point `gameDir` at an
  existing modded install or integrate an installer later.
- The shader toggle assumes Iris or Oculus is installed as a mod. Vanilla
  Minecraft has no shader support.
- Mod compatibility is the user's responsibility; the launcher does not
  resolve conflicts beyond showing the list.

**Best Practices**
- Keep the **main** process small; push logic into `profiles.ts` / `mods.ts`
  modules so they're unit-testable without Electron.
- Never expose `ipcRenderer` directly — always go through the preload
  `contextBridge` with a typed surface.
- Validate every IPC payload on the main side (Zod or hand-rolled guards)
  — the renderer is an untrusted boundary.
- Write profile files atomically, and back up before destructive ops.
- Don't auto-download mods from arbitrary URLs. If adding a browser later,
  use CurseForge/Modrinth official APIs and verify checksums.
- Respect the Minecraft EULA and the rules of the servers you play on.
  Do not build features whose primary purpose is to provide an unfair
  multiplayer advantage.

## Adding Your Own Mods and Shaders

Each profile has its own isolated folder. You have three ways to add content:

1. **In-app file picker** — go to any mod category (or Shader Packs) and
   click **+ Add Mods** / **+ Add Shaders**. Pick one or more files; they
   are copied into the active profile's folder.
2. **Drag and drop** — drag `.jar` files onto any mod category page, or
   `.zip` shader packs onto the Shader Packs page. A highlighted overlay
   appears while dragging.
3. **Open the folder directly** — click **📁 Open Folder** to reveal the
   profile's `mods/` or `shaderpacks/` directory in your OS file manager,
   then drop files in there. Click **↻ Refresh** to rescan.

On disk, the per-profile layout is:

```
<userData>/instances/<profileId>/
├── mods/            ← .jar files; .jar.disabled = toggled off
├── shaderpacks/     ← .zip packs (Iris / Oculus also accept folders here)
└── config/iris.properties   ← managed by the launcher
```

Remove a mod or shader with the **Remove** link on its card (this deletes
the file; the disabled variant is cleaned up too). Disabling vs. removing:

- **Toggle off** = file renamed to `.jar.disabled` — keep it, just don't load it.
- **Remove**     = file deleted from disk.

## Expanding Later

- **New category:** add an entry to `src/shared/categories.ts`.
- **New theme:** add a CSS file in `src/renderer/styles/` and select it in
  `settings.json` — variables in `theme.css` cover the whole UI.
- **Mod browser:** add a `src/main/modrinth.ts` client that hits the
  Modrinth API and writes downloads into `<gameDir>/mods/`.
- **Auth:** wire `msmc` into `src/main/auth.ts` and pass the token to
  `launcher.ts`.
