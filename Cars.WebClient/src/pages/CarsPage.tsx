import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Car } from '../models/Car';
import { deleteCar, getCars, isAbortError } from '../services/carService';

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getCars(controller.signal)
      .then((data) => setCars(data))
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać listy samochodów.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function handleDelete(car: Car) {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć samochód ${car.brand} ${car.model}?`
    );
    if (!confirmed) return;

    setDeletingId(car.id);
    try {
      await deleteCar(car.id);
      setCars((prev) => prev.filter((c) => c.id !== car.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć samochodu.');
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <p className="message">Ładowanie listy...</p>;

  return (
    <section>
      <div className="page-header">
        <h1>Samochody</h1>
        <Link to="/cars/new" className="btn primary">Dodaj samochód</Link>
      </div>

      {error && <p className="message error">{error}</p>}

      {!error && cars.length === 0 && (
        <p className="message">Brak samochodów na liście.</p>
      )}

      {cars.length > 0 && (
        <ul className="car-list">
          {cars.map((car) => (
            <li key={car.id} className="car-item">
              <span className="car-name">
                <strong>{car.brand}</strong> {car.model}
              </span>
              <span className="actions">
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
