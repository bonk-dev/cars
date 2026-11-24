import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import type { CarFormValues } from '../models/CarFormValues';
import { bodyTypes, fuelTypes } from '../models/carOptions';
import { getFeatures } from '../services/carService';
import { queryKeys } from '../queries/queryKeys';

const emptyValues: CarFormValues = {
  brand: '',
  model: '',
  doorsNumber: 5,
  luggageCapacity: 400,
  engineCapacity: 1600,
  fuelType: fuelTypes[0].value,
  productionDate: '',
  averageFuelConsumption: 6.5,
  bodyType: bodyTypes[0].value,
  featureIds: [],
};

interface CarFormProps {
  // Wartości z API (edycja). Mogą pojawić się asynchronicznie.
  initialValues?: CarFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  error?: string | null;
  cancelTo: string;
  onSubmit: (values: CarFormValues) => void;
}

export default function CarForm({
  initialValues,
  submitLabel,
  isSubmitting,
  error,
  cancelTo,
  onSubmit,
}: CarFormProps) {
  // Dzisiejsza data (yyyy-MM-dd) – górna granica daty produkcji.
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  // ========================================================
  // REACT HOOK FORM
  // ========================================================

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormValues>({
    defaultValues: initialValues ?? emptyValues,
  });

  // Dane z API pojawiają się asynchronicznie – reset() ustawia cały formularz.
  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  // ========================================================
  // TANSTACK QUERY -- LISTA WYPOSAŻENIA
  // ========================================================

  const {
    data: features = [],
    isPending: areFeaturesPending,
    isError: areFeaturesError,
    error: featuresError,
  } = useQuery({
    queryKey: queryKeys.features,
    queryFn: ({ signal }) => getFeatures(signal),
  });

  function submit(values: CarFormValues) {
    // Przy jednym checkboksie React Hook Form zwraca string/false zamiast tablicy.
    const rawIds: unknown = values.featureIds;
    const featureIds = Array.isArray(rawIds)
      ? rawIds
      : typeof rawIds === 'string'
        ? [rawIds]
        : [];

    onSubmit({
      ...values,
      brand: values.brand.trim(),
      model: values.model.trim(),
      featureIds,
    });
  }

  return (
    <form className="car-form" onSubmit={handleSubmit(submit)} noValidate>
      {error && <p className="alert alert-danger">{error}</p>}

      <fieldset>
        <legend>Dane podstawowe</legend>

        <div className="form-grid">
          <div className="field-row-stacked">
            <label htmlFor="brand">Marka</label>
            <input
              id="brand"
              type="text"
              aria-invalid={Boolean(errors.brand)}
              {...register('brand', {
                required: 'Marka jest wymagana',
                minLength: { value: 2, message: 'Marka musi mieć co najmniej 2 znaki' },
                maxLength: { value: 50, message: 'Marka może mieć maksymalnie 50 znaków' },
              })}
            />
            {errors.brand && <span className="field-error">{errors.brand.message}</span>}
          </div>

          <div className="field-row-stacked">
            <label htmlFor="model">Model</label>
            <input
              id="model"
              type="text"
              aria-invalid={Boolean(errors.model)}
              {...register('model', {
                required: 'Model jest wymagany',
                maxLength: { value: 50, message: 'Model może mieć maksymalnie 50 znaków' },
              })}
            />
            {errors.model && <span className="field-error">{errors.model.message}</span>}
          </div>

          <div className="field-row-stacked">
            <label htmlFor="doorsNumber">Liczba drzwi</label>
            <input
              id="doorsNumber"
              type="number"
              step={1}
              aria-invalid={Boolean(errors.doorsNumber)}
              {...register('doorsNumber', {
                // Bez tego HTML zwróciłby string.
                valueAsNumber: true,
                required: 'Podaj liczbę drzwi',
                min: { value: 2, message: 'Minimum 2 drzwi' },
                max: { value: 5, message: 'Maksimum 5 drzwi' },
                validate: (v) => Number.isInteger(v) || 'Podaj liczbę całkowitą',
              })}
            />
            {errors.doorsNumber && (
              <span className="field-error">{errors.doorsNumber.message}</span>
            )}
          </div>

          <div className="field-row-stacked">
            <label htmlFor="luggageCapacity">Pojemność bagażnika [l]</label>
            <input
              id="luggageCapacity"
              type="number"
              step={1}
              aria-invalid={Boolean(errors.luggageCapacity)}
              {...register('luggageCapacity', {
                valueAsNumber: true,
                required: 'Podaj pojemność bagażnika',
                min: { value: 0, message: 'Wartość nie może być ujemna' },
                validate: (v) => Number.isInteger(v) || 'Podaj liczbę całkowitą',
              })}
            />
            {errors.luggageCapacity && (
              <span className="field-error">{errors.luggageCapacity.message}</span>
            )}
          </div>

          <div className="field-row-stacked">
            <label htmlFor="engineCapacity">Pojemność silnika [cm³]</label>
            <input
              id="engineCapacity"
              type="number"
              step={1}
              aria-invalid={Boolean(errors.engineCapacity)}
              {...register('engineCapacity', {
                valueAsNumber: true,
                required: 'Podaj pojemność silnika',
                min: { value: 1, message: 'Wartość musi być dodatnia' },
                validate: (v) => Number.isInteger(v) || 'Podaj liczbę całkowitą',
              })}
            />
            {errors.engineCapacity && (
              <span className="field-error">{errors.engineCapacity.message}</span>
            )}
          </div>

          <div className="field-row-stacked">
            <label htmlFor="averageFuelConsumption">Średnie spalanie [l/100 km]</label>
            <input
              id="averageFuelConsumption"
              type="number"
              step={0.1}
              aria-invalid={Boolean(errors.averageFuelConsumption)}
              {...register('averageFuelConsumption', {
                valueAsNumber: true,
                required: 'Podaj średnie spalanie',
                min: { value: 0.1, message: 'Wartość musi być dodatnia' },
              })}
            />
            {errors.averageFuelConsumption && (
              <span className="field-error">{errors.averageFuelConsumption.message}</span>
            )}
          </div>

          <div className="field-row-stacked">
            <label htmlFor="fuelType">Rodzaj paliwa</label>
            <select id="fuelType" {...register('fuelType', { valueAsNumber: true })}>
              {fuelTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row-stacked">
            <label htmlFor="bodyType">Typ nadwozia</label>
            <select id="bodyType" {...register('bodyType', { valueAsNumber: true })}>
              {bodyTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row-stacked">
            <label htmlFor="productionDate">Data produkcji</label>
            <input
              id="productionDate"
              type="date"
              max={today}
              aria-invalid={Boolean(errors.productionDate)}
              {...register('productionDate', {
                required: 'Podaj datę produkcji',
                validate: (v) => v <= today || 'Data produkcji nie może być z przyszłości',
              })}
            />
            {errors.productionDate && (
              <span className="field-error">{errors.productionDate.message}</span>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Wyposażenie</legend>

        {areFeaturesPending && <p>Ładowanie wyposażenia...</p>}

        {areFeaturesError && <p className="field-error">{featuresError.message}</p>}

        {!areFeaturesPending && !areFeaturesError && features.length === 0 && (
          <p>Brak dostępnego wyposażenia.</p>
        )}

        {!areFeaturesPending && !areFeaturesError && features.length > 0 && (
          <div className="checkbox-grid">
            {features.map((feature) => (
              <div className="field-row" key={feature.id}>
                <input
                  id={`feature-${feature.id}`}
                  type="checkbox"
                  value={feature.id}
                  {...register('featureIds')}
                />
                <label htmlFor={`feature-${feature.id}`}>{feature.name}</label>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <div className="actions">
        <button type="submit" className="default" disabled={isSubmitting}>
          {isSubmitting ? 'Zapisywanie...' : submitLabel}
        </button>
        <Link className="btn" to={cancelTo}>
          Anuluj
        </Link>
      </div>
    </form>
  );
}
