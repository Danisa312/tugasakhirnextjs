import axios from "axios";

export const API_URL = "http://localhost:8000/api"
export const PUBLIC_URL = "http://localhost:8000"

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axiosInstance };
