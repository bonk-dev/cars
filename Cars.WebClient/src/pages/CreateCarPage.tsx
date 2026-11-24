import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import CarForm from '../components/CarForm';
import type { CarFormValues } from '../models/CarFormValues';
import { createCar } from '../services/carService';
import { queryKeys } from '../queries/queryKeys';

export default function CreateCarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ========================================================
  // TANSTACK QUERY -- CREATE
  // ========================================================

  const createMutation = useMutation({
    mutationFn: (values: CarFormValues) => createCar(values),

    onSuccess: (createdCar) => {
      // Lista aut w cache jest już nieaktualna.
      queryClient.invalidateQueries({ queryKey: queryKeys.cars });

      // Przechodzimy do szczegółów nowo utworzonego samochodu.
      navigate(`/cars/${createdCar.id}`);
    },
  });

  return (
    <section>
      <h1>Dodaj samochód</h1>

      <CarForm
        submitLabel="Dodaj samochód"
        isSubmitting={createMutation.isPending}
        error={createMutation.isError ? createMutation.error.message : null}
        cancelTo="/cars"
        onSubmit={(values) => createMutation.mutate(values)}
      />
    </section>
  );
}
