import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Подставляем токен из localStorage в каждый запрос
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// При 401 — чистим токен и редиректим на логин
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

// ── Auth ─────────────────────────────────────────────────────────
export const login = (email, password) =>
  client.post('/auth/token/login/', { email, password });

export const logout = () =>
  client.post('/auth/token/logout/');

export const register = (data) =>
  client.post('/users/', data);

export const getMe = () =>
  client.get('/users/me/');

// ── Entries ──────────────────────────────────────────────────────
export const getEntries = (params = {}) =>
  client.get('/entries/', { params });

export const createEntry = (formData) =>
  client.post('/entries/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateEntry = (id, formData) =>
  client.patch(`/entries/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteEntry = (id) =>
  client.delete(`/entries/${id}/`);

export const gradeEntry = (id, grade) =>
  client.patch(`/entries/${id}/grade/`, { grade });

export const getGroups = () =>
  client.get('/groups/');
