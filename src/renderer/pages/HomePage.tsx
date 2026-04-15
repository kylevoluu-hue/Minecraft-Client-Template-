import { useStore } from '../state/store';
import { CATEGORIES } from '@shared/categories';
import { LaunchBar } from '../components/LaunchBar';

export function HomePage(): JSX.Element {
  const { mods, shaders, profiles, features, setActiveCategory } = useStore();
  const enabledCount = mods.filter((m) => m.enabled).length;
  const featureCount = Object.values(features).filter(
    (v: any) => v?.enabled
  ).length;

  return (
    <>
      <h1 className="uc-page-title">Welcome to Universal Client</h1>
      <p className="uc-page-sub">
        {profiles.length} profile{profiles.length === 1 ? '' : 's'} •{' '}
        {mods.length} mods ({enabledCount} enabled) • {shaders.length} shader
        pack{shaders.length === 1 ? '' : 's'} • {featureCount} client feature
        {featureCount === 1 ? '' : 's'} on
      </p>

      <div className="uc-grid">
        {CATEGORIES.map((c) => {
          const count =
            c.id === 'shaders'
              ? shaders.length
              : mods.filter((m) => m.category === c.id).length;
          return (
            <button
              key={c.id}
              className="uc-card"
              style={{ textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setActiveCategory(c.id)}
            >
              <div className="uc-card-head">
                <div className="uc-card-title">
                  {c.icon} {c.label}
                </div>
                <span className="uc-tag">{count}</span>
              </div>
              <div className="uc-card-desc">{c.description}</div>
            </button>
          );
        })}
      </div>

      <LaunchBar />
    </>
  );
}
