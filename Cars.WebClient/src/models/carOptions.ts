export interface Option {
  value: number;
  label: string;
}

export const fuelTypes: Option[] = [
  { value: 1, label: 'Benzyna' },
  { value: 2, label: 'Diesel' },
  { value: 3, label: 'LPG' },
  { value: 4, label: 'Hybryda' },
  { value: 5, label: 'Elektryczny' },
];

export const bodyTypes: Option[] = [
  { value: 1, label: 'Hatchback' },
  { value: 2, label: 'Sedan' },
  { value: 3, label: 'Kombi' },
  { value: 4, label: 'SUV' },
  { value: 5, label: 'Coupe' },
  { value: 6, label: 'Kabriolet' },
  { value: 7, label: 'Van' },
];

function labelOf(options: Option[], value: number): string {
  return options.find((o) => o.value === value)?.label ?? `Nieznany (${value})`;
}

export const fuelTypeLabel = (value: number) => labelOf(fuelTypes, value);
export const bodyTypeLabel = (value: number) => labelOf(bodyTypes, value);
