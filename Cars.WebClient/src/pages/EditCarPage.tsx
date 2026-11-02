import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import CarForm from '../components/CarForm';
import type { Car, NewCar } from '../models/Car';
import { getCarById, isAbortError, updateCar } from '../services/carService';

export default function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  async function handleSubmit(updated: NewCar) {
    if (!id) return;
    await updateCar(id, updated);
    navigate(`/cars/${id}`);
  }

  if (isLoading) return <p className="message">Ładowanie...</p>;

  if (error || !car) {
    return (
      <section>
        <p className="message error">{error ?? 'Nie znaleziono samochodu.'}</p>
        <Link to="/cars" className="btn">← Powrót do listy</Link>
      </section>
    );
  }

  const { id: _id, ...initialValues } = car;

  return (
    <section>
      <h1>Edytuj: {car.brand} {car.model}</h1>
      <CarForm key={car.id} initialValues={initialValues} submitLabel="Zapisz zmiany" onSubmit={handleSubmit} />
      <p><Link to={`/cars/${car.id}`}>← Anuluj i wróć do szczegółów</Link></p>
    </section>
  );
}
