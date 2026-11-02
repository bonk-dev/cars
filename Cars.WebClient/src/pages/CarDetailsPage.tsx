import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Car } from '../models/Car';
import { bodyTypeLabel, fuelTypeLabel } from '../models/carOptions';
import { getCarById, isAbortError } from '../services/carService';

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    getCarById(id, controller.signal)
      .then((data) => setCar(data))
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać samochodu.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const backLink = <Link to="/cars" className="btn">Powrót do listy</Link>;

  if (isLoading) return <p className="message">Ładowanie...</p>;

  if (error || !car) {
    return (
      <section>
        <p className="message error">{error ?? 'Nie znaleziono samochodu.'}</p>
        {backLink}
      </section>
    );
  }

  return (
    <section>
      <h1>{car.brand} {car.model}</h1>

      <dl className="details">
        <dt>ID</dt><dd>{car.id}</dd>
        <dt>Marka</dt><dd>{car.brand}</dd>
        <dt>Model</dt><dd>{car.model}</dd>
        <dt>Liczba drzwi</dt><dd>{car.doorsNumber}</dd>
        <dt>Pojemność bagażnika</dt><dd>{car.luggageCapacity} l</dd>
        <dt>Pojemność silnika</dt><dd>{car.engineCapacity} cm³</dd>
        <dt>Rodzaj paliwa</dt><dd>{fuelTypeLabel(car.fuelType)}</dd>
        <dt>Data produkcji</dt><dd>{car.productionDate}</dd>
        <dt>Średnie spalanie</dt><dd>{car.averageFuelConsumption} l/100 km</dd>
        <dt>Typ nadwozia</dt><dd>{bodyTypeLabel(car.bodyType)}</dd>
      </dl>

      <div className="actions">
        {backLink}
        <Link to={`/cars/${car.id}/edit`} className="btn primary">Edytuj</Link>
      </div>
    </section>
  );
}
