import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1/',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('clinic_name');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getClinicName(): string | null {
  return localStorage.getItem('clinic_name');
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('clinic_name');
  window.location.href = '/login';
}

export default client;
