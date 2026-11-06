import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import FavoriteButton from '../components/FavoriteButton';
import type { Car } from '../models/Car';
import { deleteCar, getCars, isAbortError } from '../services/carService';
import { useCarsUiStore } from '../stores/useCarsUiStore';

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchText = useCarsUiStore((state) => state.searchText);
  const showOnlyFavorites = useCarsUiStore((state) => state.showOnlyFavorites);
  const favoriteIds = useCarsUiStore((state) => state.favoriteIds);
  const setSearchText = useCarsUiStore((state) => state.setSearchText);
  const setShowOnlyFavorites = useCarsUiStore((state) => state.setShowOnlyFavorites);
  const removeFavorite = useCarsUiStore((state) => state.removeFavorite);
  const syncFavorites = useCarsUiStore((state) => state.syncFavorites);

  useEffect(() => {
    const controller = new AbortController();

    getCars(controller.signal)
      .then((data) => {
        setCars(data);
        syncFavorites(data.map((car) => car.id));
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać listy samochodów.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [syncFavorites]);

  async function handleDelete(car: Car) {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć samochód ${car.brand} ${car.model}?`
    );
    if (!confirmed) return;

    setDeletingId(car.id);
    try {
      await deleteCar(car.id);
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      removeFavorite(car.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć samochodu.');
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <p className="message">Ładowanie listy...</p>;

  const query = searchText.trim().toLowerCase();
  const visibleCars = cars.filter((car) => {
    const matchesSearch = `${car.brand} ${car.model}`.toLowerCase().includes(query);
    const matchesFavorites = !showOnlyFavorites || favoriteIds.includes(car.id);
    return matchesSearch && matchesFavorites;
  });

  return (
    <section>
      <div className="page-header">
        <h1>Samochody</h1>
        <Link to="/cars/new" className="btn primary">Dodaj samochód</Link>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Szukaj po marce i modelu"
          aria-label="Szukaj po marce i modelu"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={(event) => setShowOnlyFavorites(event.target.checked)}
          />
          {' '}Tylko ulubione
        </label>
      </div>

      {error && <p className="message error">{error}</p>}

      {!error && cars.length === 0 && (
        <p className="message">Brak samochodów na liście.</p>
      )}

      {cars.length > 0 && visibleCars.length === 0 && (
        <p className="message">Brak samochodów spełniających kryteria.</p>
      )}

      {visibleCars.length > 0 && (
        <ul className="car-list">
          {visibleCars.map((car) => (
            <li key={car.id} className="car-item">
              <span className="car-name">
                <strong>{car.brand}</strong> {car.model}
              </span>
              <span className="actions">
                <FavoriteButton carId={car.id} />
                <Link to={`/cars/${car.id}`} className="btn">Szczegóły</Link>
                <Link to={`/cars/${car.id}/edit`} className="btn">Edytuj</Link>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => handleDelete(car)}
                  disabled={deletingId === car.id}
                >
                  {deletingId === car.id ? 'Usuwanie...' : 'Usuń'}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
