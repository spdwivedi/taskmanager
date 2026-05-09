// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
  // Vite uses import.meta.env for environment variables
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
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