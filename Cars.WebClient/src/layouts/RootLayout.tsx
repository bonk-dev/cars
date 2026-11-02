import { NavLink, Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <>
      <header className="site-header">
        <span className="logo">Cars</span>
        <nav>
          <NavLink to="/" end>Strona główna</NavLink>
          <NavLink to="/cars" end>Samochody</NavLink>
          <NavLink to="/cars/new">Dodaj samochód</NavLink>
        </nav>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
