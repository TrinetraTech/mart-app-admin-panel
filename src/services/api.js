import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://martapi.anshvarma.in/api/admin', // for live
  baseURL: '/api/admin', // for local
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supermart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('supermart_token');
      localStorage.removeItem('supermart_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;