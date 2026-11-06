import axios from 'axios';
import type { Car, NewCar } from '../models/Car';
import { api } from './api';

function normalizeCar(car: Car): Car {
  return { ...car, productionDate: car.productionDate.slice(0, 10) };
}

export async function getCars(signal?: AbortSignal): Promise<Car[]> {
  const response = await api.get<Car[]>('/cars', { signal });
  return response.data.map(normalizeCar);
}

export async function getCarById(id: string, signal?: AbortSignal): Promise<Car> {
  const response = await api.get<Car>(`/cars/${id}`, { signal });
  return normalizeCar(response.data);
}

export async function createCar(car: NewCar): Promise<Car> {
  const response = await api.post<Car>('/cars', car);
  return normalizeCar(response.data);
}

export async function updateCar(id: string, car: NewCar): Promise<void> {
  await api.put(`/cars/${id}`, car);
}

export async function deleteCar(id: string): Promise<void> {
  await api.delete(`/cars/${id}`);
}

export function isAbortError(error: unknown): boolean {
  return axios.isCancel(error);
}
