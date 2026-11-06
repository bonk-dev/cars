export interface Option {
  value: number;
  label: string;
}

export const fuelTypes: Option[] = [
  { value: 0, label: 'Benzyna' },
  { value: 1, label: 'Diesel' },
  { value: 2, label: 'Hybryda' },
  { value: 3, label: 'Elektryczny' },
  { value: 4, label: 'LPG' },
];

export const bodyTypes: Option[] = [
  { value: 0, label: 'Hatchback' },
  { value: 1, label: 'Sedan' },
  { value: 2, label: 'Kombi' },
  { value: 3, label: 'SUV' },
  { value: 4, label: 'Roadster' },
];

function labelOf(options: Option[], value: number): string {
  return options.find((o) => o.value === value)?.label ?? `Nieznany (${value})`;
}

export const fuelTypeLabel = (value: number) => labelOf(fuelTypes, value);
export const bodyTypeLabel = (value: number) => labelOf(bodyTypes, value);
