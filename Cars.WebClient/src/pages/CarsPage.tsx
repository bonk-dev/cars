import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';

import CarCard from '../components/CarCard';
import type { Car } from '../models/Car';
import { deleteCar, getCars } from '../services/carService';
import { queryKeys } from '../queries/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';
import { useCarsUiStore } from '../stores/useCarsUiStore';

export default function CarsPage() {
  // ========================================================
  // TANSTACK QUERY
  // ========================================================

  // QueryClient pozwala m.in. oznaczać dane w cache jako nieaktualne.
  const queryClient = useQueryClient();

  // TanStack Query przejmuje odpowiedzialność za dane, stan oczekiwania,
  // stan błędu i cache.
  const {
    data: cars = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.cars,
    queryFn: ({ signal }) => getCars(signal),
  });

  // ========================================================
  // ZUSTAND -- STAN UŻYTKOWNIKA I INTERFEJSU
  // ========================================================

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles.includes('Admin') ?? false;

  const searchTerm = useCarsUiStore((state) => state.searchTerm);
  const setSearchTerm = useCarsUiStore((state) => state.setSearchTerm);
  const showFavoritesOnly = useCarsUiStore((state) => state.showFavoritesOnly);
  const setShowFavoritesOnly = useCarsUiStore((state) => state.setShowFavoritesOnly);
  const favoriteCarIdsByUser = useCarsUiStore((state) => state.favoriteCarIdsByUser);
  const removeFavorite = useCarsUiStore((state) => state.removeFavorite);

  // Ulubione auta aktualnego użytkownika.
  const favoriteCarIds = user ? (favoriteCarIdsByUser[user.id] ?? []) : [];

  // ========================================================
  // MUTACJA -- USUWANIE SAMOCHODU
  // ========================================================

  const deleteMutation = useMutation({
    mutationFn: deleteCar,

    onSuccess: (_data, deletedCarId) => {
      // Usuwamy samochód również z ulubionych aktualnego użytkownika.
      if (user) {
        removeFavorite(user.id, deletedCarId);
      }

      // Lista w cache jest nieaktualna – TanStack Query pobierze ją ponownie.
      queryClient.invalidateQueries({ queryKey: queryKeys.cars });
      queryClient.removeQueries({ queryKey: queryKeys.car(deletedCarId) });
    },
  });

  function handleDelete(car: Car) {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć samochód ${car.brand} ${car.model}?`
    );
    if (!confirmed) {
      return;
    }

    // Operacją zarządza useMutation.
    deleteMutation.mutate(car.id);
  }

  // ========================================================
  // FILTROWANIE
  // ========================================================

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleCars = cars.filter((car) => {
    const matchesSearch = `${car.brand} ${car.model}`
      .toLowerCase()
      .includes(normalizedSearch);
    const matchesFavorite = !showFavoritesOnly || favoriteCarIds.includes(car.id);
    return matchesSearch && matchesFavorite;
  });

  // ========================================================
  // STANY QUERY
  // ========================================================

  if (isPending) {
    return (
      <section>
        <h1>Samochody</h1>
        <p>Ładowanie samochodów...</p>
        <progress />
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h1>Samochody</h1>
        <p className="alert alert-danger">{error.message}</p>
      </section>
    );
  }

  // ========================================================
  // WIDOK
  // ========================================================

  return (
    <section>
      <div className="page-header">
        <h1>Samochody</h1>
        <Link to="/cars/new" className="btn">
          Dodaj samochód
        </Link>
      </div>

      {deleteMutation.isError && (
        <p className="alert alert-danger">{deleteMutation.error.message}</p>
      )}

      <div className="toolbar">
        <div className="field-row">
          <label htmlFor="car-search">Szukaj:</label>
          <input
            id="car-search"
            type="search"
            placeholder="Marka lub model..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="field-row">
          <input
            id="favorites-only"
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(event) => setShowFavoritesOnly(event.target.checked)}
          />
          <label htmlFor="favorites-only">Tylko ulubione</label>
        </div>

        <span className="toolbar-count">
          Wyświetlono: {visibleCars.length} z {cars.length}
        </span>
      </div>

      {visibleCars.length === 0 ? (
        <p>
          {cars.length === 0
            ? 'Brak samochodów na liście.'
            : 'Brak samochodów spełniających kryteria.'}
        </p>
      ) : (
        <div className="cars-grid">
          {visibleCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              canDelete={isAdmin}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === car.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
