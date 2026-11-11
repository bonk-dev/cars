import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  if (axios.isAxiosError<{ errors?: Record<string, string[]> }>(error)) {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    const validationErrors = error.response?.data?.errors;

    if (validationErrors) {
      error.message = Object.values(validationErrors).flat().join(" ");
    } else if (error.response?.status === 404) {
      error.message = "Nie znaleziono samochodu.";
    } else if (!error.response && !axios.isCancel(error)) {
      error.message = "Brak połączenia z serwerem.";
    }
  }

  return Promise.reject(error);
});
