import { NavLink, Outlet } from 'react-router';
import { useCarsUiStore } from '../stores/useCarsUiStore';

export default function RootLayout() {
  const favoritesCount = useCarsUiStore((state) => state.favoriteIds.length);

  return (
    <>
      <header className="site-header">
        <span className="logo">Cars</span>
        <nav>
          <NavLink to="/" end>Strona główna</NavLink>
          <NavLink to="/cars" end>Samochody</NavLink>
          <NavLink to="/cars/new">Dodaj samochód</NavLink>
          <span>Ulubione: {favoritesCount}</span>
        </nav>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
