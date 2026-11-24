import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';

import CarForm from '../components/CarForm';
import type { CarFormValues } from '../models/CarFormValues';
import { getCarById, updateCar } from '../services/carService';
import { queryKeys } from '../queries/queryKeys';

export default function EditCarPage() {
  // ========================================================
  // ROUTING
  // ========================================================

  // useParams() zwraca string | undefined. Query i tak nie zostanie
  // wykonane, jeśli id nie istnieje (enabled: Boolean(id)).
  const { id } = useParams();
  const carId = id ?? '';
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  // ========================================================
  // TANSTACK QUERY -- POBRANIE SAMOCHODU
  // ========================================================

  const {
    data: car,
    isPending: isCarPending,
    isError: isCarError,
    error: carError,
  } = useQuery({
    // Każdy samochód ma osobny wpis w cache: ['car', 'guid-samochodu'].
    queryKey: queryKeys.car(carId),
    // TanStack Query przekazuje AbortSignal – nie tworzymy własnego AbortController.
    queryFn: ({ signal }) => getCarById(carId, signal),
    enabled: Boolean(id),
  });

  // Dane z API -> wartości formularza. CarForm wywoła reset(), gdy się pojawią.
  const initialValues = useMemo<CarFormValues | undefined>(() => {
    if (!car) {
      return undefined;
    }

    return {
      brand: car.brand,
      model: car.model,
      doorsNumber: car.doorsNumber,
      luggageCapacity: car.luggageCapacity,
      engineCapacity: car.engineCapacity,
      fuelType: car.fuelType,
      // input type="date" oczekuje yyyy-MM-dd.
      productionDate: car.productionDate.substring(0, 10),
      averageFuelConsumption: car.averageFuelConsumption,
      bodyType: car.bodyType,
      // Backend zwraca features: [{ id, name }], formularz potrzebuje tylko id.
      featureIds: car.features.map((feature) => feature.id),
    };
  }, [car]);

  // ========================================================
  // TANSTACK QUERY -- AKTUALIZACJA SAMOCHODU
  // ========================================================

  const updateMutation = useMutation({
    mutationFn: (values: CarFormValues) => updateCar(carId, values),

    onSuccess: () => {
      // Lista samochodów oraz szczegóły auta mogą zawierać stare dane.
      queryClient.invalidateQueries({ queryKey: queryKeys.cars });
      queryClient.invalidateQueries({ queryKey: queryKeys.car(carId) });

      navigate(`/cars/${carId}`);
    },
  });

  const backLink = (
    <Link className="btn" to="/cars">
      Wróć do listy
    </Link>
  );

  if (!id) {
    return (
      <section>
        <h1>Błąd</h1>
        <p className="alert alert-danger">Brak identyfikatora samochodu.</p>
        {backLink}
      </section>
    );
  }

  if (isCarPending) {
    return <p>Ładowanie samochodu...</p>;
  }

  if (isCarError) {
    return (
      <section>
        <h1>Błąd</h1>
        <p className="alert alert-danger">{carError.message}</p>
        {backLink}
      </section>
    );
  }

  return (
    <section>
      <h1>
        Edytuj: {car.brand} {car.model}
      </h1>

      <CarForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        isSubmitting={updateMutation.isPending}
        error={updateMutation.isError ? updateMutation.error.message : null}
        cancelTo={`/cars/${carId}`}
        onSubmit={(values) => updateMutation.mutate(values)}
      />
    </section>
  );
}
