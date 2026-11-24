import type { CarPhoto } from './CarPhoto';
import type { Feature } from './Feature';

export interface Car {
  id: string;
  brand: string;
  model: string;
  doorsNumber: number;
  luggageCapacity: number;
  engineCapacity: number;
  fuelType: number;
  productionDate: string;
  averageFuelConsumption: number;
  bodyType: number;
  photos: CarPhoto[];
  features: Feature[];
}
