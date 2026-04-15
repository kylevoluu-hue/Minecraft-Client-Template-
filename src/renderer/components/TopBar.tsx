import { useStore } from '../state/store';

export function TopBar(): JSX.Element {
  const {
    search,
    setSearch,
    sort,
    setSort,
    profiles,
    activeProfileId,
    setActiveProfile
  } = useStore();

  return (
    <header className="uc-topbar">
      <div className="uc-search">
        <span>🔎</span>
        <input
          placeholder="Search mods, shaders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="uc-select"
        value={sort}
        onChange={(e) => setSort(e.target.value as any)}
      >
        <option value="name">Sort: A–Z</option>
        <option value="enabled">Sort: Enabled first</option>
        <option value="category">Sort: Category</option>
      </select>

      <select
        className="uc-select"
        value={activeProfileId ?? ''}
        onChange={(e) => setActiveProfile(e.target.value)}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.loader} {p.mcVersion}
          </option>
        ))}
      </select>
    </header>
  );
}
