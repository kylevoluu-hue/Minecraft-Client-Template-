import { useEffect } from 'react';
import { useStore } from './state/store';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App(): JSX.Element {
  const active = useStore((s) => s.activeCategory);
  const refreshAll = useStore((s) => s.refreshAll);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="uc-app">
      <div className="uc-brand">
        <div className="uc-brand-dot" />
        Universal Client
      </div>
      <TopBar />
      <Sidebar />
      <main className="uc-main">
        {active === 'home' && <HomePage />}
        {active === 'settings' && <SettingsPage />}
        {active !== 'home' && active !== 'settings' && (
          <CategoryPage categoryId={active} />
        )}
      </main>
    </div>
  );
}
