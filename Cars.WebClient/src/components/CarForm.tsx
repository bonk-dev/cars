import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { NewCar } from '../models/Car';
import { bodyTypes, fuelTypes } from '../models/carOptions';

interface CarFormValues {
  brand: string;
  model: string;
  doorsNumber: string;
  luggageCapacity: string;
  engineCapacity: string;
  fuelType: string;
  productionDate: string;
  averageFuelConsumption: string;
  bodyType: string;
}

const emptyValues: CarFormValues = {
  brand: '',
  model: '',
  doorsNumber: '5',
  luggageCapacity: '',
  engineCapacity: '',
  fuelType: String(fuelTypes[0].value),
  productionDate: '',
  averageFuelConsumption: '',
  bodyType: String(bodyTypes[0].value),
};

function toFormValues(car: NewCar): CarFormValues {
  return {
    brand: car.brand,
    model: car.model,
    doorsNumber: String(car.doorsNumber),
    luggageCapacity: String(car.luggageCapacity),
    engineCapacity: String(car.engineCapacity),
    fuelType: String(car.fuelType),
    productionDate: car.productionDate,
    averageFuelConsumption: String(car.averageFuelConsumption),
    bodyType: String(car.bodyType),
  };
}

function toNewCar(values: CarFormValues): NewCar {
  return {
    brand: values.brand.trim(),
    model: values.model.trim(),
    doorsNumber: Number(values.doorsNumber),
    luggageCapacity: Number(values.luggageCapacity),
    engineCapacity: Number(values.engineCapacity),
    fuelType: Number(values.fuelType),
    productionDate: values.productionDate,
    averageFuelConsumption: Number(values.averageFuelConsumption),
    bodyType: Number(values.bodyType),
  };
}

function validate(car: NewCar): string | null {
  if (!car.brand) return 'Podaj markę.';
  if (!car.model) return 'Podaj model.';
  if (car.brand.length > 50) return 'Marka nie może być dłuższa niż 50 znaków.';
  if (car.model.length > 50) return 'Model nie może być dłuższy niż 50 znaków.';
  if (!Number.isInteger(car.doorsNumber) || car.doorsNumber < 2 || car.doorsNumber > 5) return 'Liczba drzwi musi być liczbą całkowitą od 2 do 5.';
  if (!Number.isInteger(car.luggageCapacity) || car.luggageCapacity < 0) return 'Pojemność bagażnika musi być nieujemną liczbą całkowitą.';
  if (!Number.isInteger(car.engineCapacity) || car.engineCapacity <= 0) return 'Pojemność silnika musi być dodatnią liczbą całkowitą.';
  if (!car.productionDate) return 'Podaj datę produkcji.';
  if (car.productionDate > new Date().toISOString().slice(0, 10)) return 'Data produkcji nie może być z przyszłości.';
  if (!(car.averageFuelConsumption > 0)) return 'Średnie spalanie musi być większe od 0.';
  return null;
}

interface CarFormProps {
  initialValues?: NewCar;
  submitLabel: string;
  onSubmit: (car: NewCar) => Promise<void>;
}

export default function CarForm({ initialValues, submitLabel, onSubmit }: CarFormProps) {
  const [values, setValues] = useState<CarFormValues>(
    initialValues ? toFormValues(initialValues) : emptyValues
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const car = toNewCar(values);
    const validationError = validate(car);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(car);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać samochodu.');
      setIsSubmitting(false);
    }
  }

  return (
    <form className="car-form" onSubmit={handleSubmit} noValidate>
      <label>
        Marka
        <input name="brand" value={values.brand} onChange={handleChange} required />
      </label>

      <label>
        Model
        <input name="model" value={values.model} onChange={handleChange} required />
      </label>

      <label>
        Liczba drzwi
        <input type="number" name="doorsNumber" min={2} max={5} step={1} value={values.doorsNumber} onChange={handleChange} />
      </label>

      <label>
        Pojemność bagażnika (l)
        <input type="number" name="luggageCapacity" min={0} value={values.luggageCapacity} onChange={handleChange} />
      </label>

      <label>
        Pojemność silnika (cm³)
        <input type="number" name="engineCapacity" min={0} value={values.engineCapacity} onChange={handleChange} />
      </label>

      <label>
        Rodzaj paliwa
        <select name="fuelType" value={values.fuelType} onChange={handleChange}>
          {fuelTypes.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label>
        Data produkcji
        <input type="date" name="productionDate" value={values.productionDate} onChange={handleChange} />
      </label>

      <label>
        Średnie spalanie (l/100 km)
        <input type="number" name="averageFuelConsumption" min={0} step={0.1} value={values.averageFuelConsumption} onChange={handleChange} />
      </label>

      <label>
        Typ nadwozia
        <select name="bodyType" value={values.bodyType} onChange={handleChange}>
          {bodyTypes.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {error && <p className="message error">{error}</p>}

      <button type="submit" className="btn primary" disabled={isSubmitting}>
        {isSubmitting ? 'Zapisywanie...' : submitLabel}
      </button>
    </form>
  );
}
