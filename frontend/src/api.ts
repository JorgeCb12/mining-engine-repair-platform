import axios from "axios";

export const authApi = axios.create({
  baseURL: "http://localhost:3001",
});

export const businessApi = axios.create({
  baseURL: "http://localhost:8000",
});

businessApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
