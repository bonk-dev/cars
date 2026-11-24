export const queryKeys = {
  cars: ['cars'] as const,

  car: (id: string) => ['car', id] as const,

  features: ['features'] as const,
};
