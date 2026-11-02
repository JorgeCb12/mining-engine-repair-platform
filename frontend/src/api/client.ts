import axios from "axios";

const AUTH_URL = import.meta.env.VITE_AUTH_API_URL || "http://localhost:3001";
const BUSINESS_URL =
  import.meta.env.VITE_BUSINESS_API_URL || "http://localhost:8000";

export const authApi = axios.create({
  baseURL: AUTH_URL,
});

export const businessApi = axios.create({
  baseURL: BUSINESS_URL,
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

businessApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
