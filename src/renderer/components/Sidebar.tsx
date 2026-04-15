import { CATEGORIES } from '@shared/categories';
import { useStore } from '../state/store';

export function Sidebar(): JSX.Element {
  const active = useStore((s) => s.activeCategory);
  const setActive = useStore((s) => s.setActiveCategory);

  return (
    <aside className="uc-sidebar">
      <button
        className={`uc-nav-btn ${active === 'home' ? 'active' : ''}`}
        onClick={() => setActive('home')}
      >
        <span className="uc-nav-icon">🏠</span>
        Home
      </button>

      <div className="uc-nav-section">Categories</div>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`uc-nav-btn ${active === cat.id ? 'active' : ''}`}
          onClick={() => setActive(cat.id)}
          title={cat.description}
        >
          <span className="uc-nav-icon">{cat.icon}</span>
          {cat.label}
        </button>
      ))}

      <div className="uc-nav-section">Launcher</div>
      <button
        className={`uc-nav-btn ${active === 'features' ? 'active' : ''}`}
        onClick={() => setActive('features')}
      >
        <span className="uc-nav-icon">✨</span>
        Client Features
      </button>
      <button
        className={`uc-nav-btn ${active === 'settings' ? 'active' : ''}`}
        onClick={() => setActive('settings')}
      >
        <span className="uc-nav-icon">⚙️</span>
        Settings
      </button>
    </aside>
  );
}
