import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(undefined, (error) => {
  if (axios.isAxiosError<{ errors?: Record<string, string[]> }>(error)) {
    const validationErrors = error.response?.data?.errors;

    if (validationErrors) {
      error.message = Object.values(validationErrors).flat().join(' ');
    } else if (error.response?.status === 404) {
      error.message = 'Nie znaleziono samochodu.';
    } else if (!error.response && !axios.isCancel(error)) {
      error.message = 'Brak połączenia z serwerem.';
    }
  }

  return Promise.reject(error);
});
