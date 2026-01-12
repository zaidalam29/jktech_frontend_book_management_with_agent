import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Change this to your actual backend URL
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log('Token being sent:', token ? 'Present' : 'Missing');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('Backend server is not running on http://127.0.0.1:8000');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
