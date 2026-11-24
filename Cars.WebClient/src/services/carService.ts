import axios from 'axios';

import type { Car } from '../models/Car';
import type { CarFormValues } from '../models/CarFormValues';
import type { CarPhoto } from '../models/CarPhoto';
import type { Feature } from '../models/Feature';
import { api } from './api';

// ========================================================
// POMOCNICZA OBSŁUGA BŁĘDÓW
// ========================================================

function createServiceError(error: unknown, defaultMessage: string): Error {
  // Błąd pochodzi z Axiosa.
  if (axios.isAxiosError(error)) {
    // Serwer odpowiedział kodem błędu, np. 400, 401, 403, 404, 500.
    if (error.response) {
      const { status, data } = error.response;

      // Szczegóły z backendu: błędy walidacji (interceptor w api.ts
      // składa je w error.message) albo zwykły tekst, np. BadRequest("...").
      let details = '';
      if (data && typeof data === 'object' && 'errors' in data) {
        details = ` ${error.message}`;
      } else if (typeof data === 'string' && data) {
        details = ` ${data}`;
      }

      return new Error(`${defaultMessage} Status: ${status}.${details}`, {
        cause: error,
      });
    }

    // Żądanie zostało wysłane, ale nie otrzymaliśmy odpowiedzi.
    if (error.request) {
      return new Error('Brak odpowiedzi z serwera.', { cause: error });
    }

    // Inny błąd związany z Axiosem.
    return new Error(error.message, { cause: error });
  }

  // Zwykły błąd JavaScript.
  if (error instanceof Error) {
    return new Error(error.message, { cause: error });
  }

  return new Error(defaultMessage);
}

function normalizeCar(car: Car): Car {
  return { ...car, productionDate: car.productionDate.slice(0, 10) };
}

// ========================================================
// GET /api/cars
// ========================================================

export async function getCars(signal?: AbortSignal): Promise<Car[]> {
  try {
    const response = await api.get<Car[]>('/cars', { signal });
    return response.data.map(normalizeCar);
  } catch (error) {
    // Anulowanie requestu przekazujemy dalej.
    if (axios.isCancel(error)) {
      throw error;
    }
    throw createServiceError(error, 'Nie udało się pobrać samochodów.');
  }
}

// ========================================================
// GET /api/cars/{id}
// ========================================================

export async function getCarById(id: string, signal?: AbortSignal): Promise<Car> {
  try {
    const response = await api.get<Car>(`/cars/${id}`, { signal });
    return normalizeCar(response.data);
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
    throw createServiceError(error, 'Nie udało się pobrać samochodu.');
  }
}

// ========================================================
// GET /api/features
// ========================================================

export async function getFeatures(signal?: AbortSignal): Promise<Feature[]> {
  try {
    const response = await api.get<Feature[]>('/features', { signal });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
    throw createServiceError(error, 'Nie udało się pobrać wyposażenia.');
  }
}

// ========================================================
// POST /api/cars
// ========================================================

export async function createCar(values: CarFormValues): Promise<Car> {
  try {
    // featureIds nie są częścią podstawowego DTO samochodu
    // wysyłanego do POST /cars.
    const { featureIds, ...carData } = values;

    // Najpierw tworzymy samochód.
    const response = await api.post<Car>('/cars', carData);
    const createdCar = response.data;

    // Następnie przypisujemy wyposażenie.
    await updateCarFeatures(createdCar.id, featureIds);

    // Pobieramy aktualny samochód, już razem z Features i Photos.
    return await getCarById(createdCar.id);
  } catch (error) {
    throw createServiceError(error, 'Nie udało się utworzyć samochodu.');
  }
}

// ========================================================
// PUT /api/cars/{id}
// ========================================================

export async function updateCar(id: string, values: CarFormValues): Promise<void> {
  try {
    const { featureIds, ...carData } = values;

    // Aktualizacja podstawowych danych auta.
    await api.put(`/cars/${id}`, carData);

    // Aktualizacja relacji Car <-> Feature.
    await updateCarFeatures(id, featureIds);
  } catch (error) {
    throw createServiceError(error, 'Nie udało się zaktualizować samochodu.');
  }
}

// ========================================================
// DELETE /api/cars/{id}
// ========================================================

export async function deleteCar(id: string): Promise<void> {
  try {
    await api.delete(`/cars/${id}`);
  } catch (error) {
    throw createServiceError(error, 'Nie udało się usunąć samochodu.');
  }
}

// ========================================================
// PUT /api/cars/{id}/features
// ========================================================

export async function updateCarFeatures(carId: string, featureIds: string[]): Promise<void> {
  try {
    await api.put(`/cars/${carId}/features`, { featureIds });
  } catch (error) {
    throw createServiceError(error, 'Nie udało się zaktualizować wyposażenia.');
  }
}

// ========================================================
// POST /api/cars/{id}/photos
// ========================================================

export async function uploadCarPhoto(carId: string, file: File): Promise<CarPhoto> {
  try {
    const formData = new FormData();

    // Nazwa "file" musi odpowiadać parametrowi backendu: IFormFile file.
    // Content-Type (multipart/form-data + boundary) ustawi przeglądarka.
    formData.append('file', file);

    const response = await api.post<CarPhoto>(`/cars/${carId}/photos`, formData);
    return response.data;
  } catch (error) {
    throw createServiceError(error, 'Nie udało się wysłać zdjęcia.');
  }
}

// ========================================================
// DELETE /api/cars/{id}/photos/{photoId}
// ========================================================

export async function deleteCarPhoto(carId: string, photoId: string): Promise<void> {
  try {
    await api.delete(`/cars/${carId}/photos/${photoId}`);
  } catch (error) {
    throw createServiceError(error, 'Nie udało się usunąć zdjęcia.');
  }
}
