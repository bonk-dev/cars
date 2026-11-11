import { NavLink, Outlet, useNavigate } from "react-router";
import { useCarsUiStore } from "../stores/useCarsUiStore";
import { useAuthStore } from "../stores/useAuthStore";

export default function RootLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const favoritesCount = useCarsUiStore((state) =>
    user ? (state.favoriteCarIdsByUser[user.id] ?? []).length : 0,
  );

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="site-header">
        <span className="logo">Cars</span>
        <nav>
          <NavLink to="/" end>
            Strona główna
          </NavLink>

          {user && (
            <>
              <NavLink to="/cars" end>
                Samochody
              </NavLink>
              <NavLink to="/cars/new">Dodaj samochód</NavLink>
            </>
          )}

          <NavLink to="/about">O aplikacji</NavLink>

          {user ? (
            <>
              <span className="favorite-counter">
                Ulubione: {favoritesCount}
              </span>
              <span className="user-info">
                {user.userName}
                {" ("}
                {user.roles.join(", ")}
                {")"}
              </span>
              <button
                type="button"
                className="nav-button"
                onClick={handleLogout}
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Logowanie</NavLink>
              <NavLink to="/register">Rejestracja</NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
