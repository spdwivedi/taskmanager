// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
  // Vite uses import.meta.env for environment variables
  baseURL: 'https://taskmanager-production-18e6.up.railway.app/api', 
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;