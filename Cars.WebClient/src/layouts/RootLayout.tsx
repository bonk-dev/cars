import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useCarsUiStore } from '../stores/useCarsUiStore';

interface Tab {
  to: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

const homeTab: Tab = { to: '/', label: 'Strona główna', isActive: (p) => p === '/' };
const aboutTab: Tab = { to: '/about', label: 'O aplikacji', isActive: (p) => p === '/about' };

const userTabs: Tab[] = [
  homeTab,
  {
    to: '/cars',
    label: 'Samochody',
    isActive: (p) => p.startsWith('/cars') && p !== '/cars/new',
  },
  { to: '/cars/new', label: 'Dodaj samochód', isActive: (p) => p === '/cars/new' },
  aboutTab,
];

const guestTabs: Tab[] = [
  homeTab,
  aboutTab,
  { to: '/login', label: 'Logowanie', isActive: (p) => p === '/login' },
  { to: '/register', label: 'Rejestracja', isActive: (p) => p === '/register' },
];

export default function RootLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const favoritesCount = useCarsUiStore((state) =>
    user ? (state.favoriteCarIdsByUser[user.id] ?? []).length : 0,
  );

  const tabs = user ? userTabs : guestTabs;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="window app-window">
      <div className="title-bar">
        <div className="title-bar-text">Cars</div>
        <div className="title-bar-controls">
          <button aria-label="Help" title="O aplikacji" onClick={() => navigate('/about')} />
        </div>
      </div>

      <div className="window-body">
        <nav className="app-nav">
          <menu role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.to}
                role="tab"
                aria-selected={tab.isActive(pathname)}
                onClick={() => navigate(tab.to)}
              >
                {tab.label}
              </button>
            ))}
          </menu>

          {user && (
            <button type="button" className="logout-button" onClick={handleLogout}>
              Wyloguj
            </button>
          )}
        </nav>

        <main role="tabpanel">
          <Outlet />
        </main>
      </div>

      <div className="status-bar">
        {user ? (
          <>
            <p className="status-bar-field">
              Zalogowano: {user.userName} ({user.roles.join(', ')})
            </p>
            <p className="status-bar-field">Ulubione: {favoritesCount}</p>
          </>
        ) : (
          <p className="status-bar-field">Niezalogowany</p>
        )}
      </div>
    </div>
  );
}
