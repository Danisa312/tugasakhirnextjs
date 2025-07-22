import axios from "axios";

export const API_URL = "https://sistem-keuangan.lantanajayadigital.cloud/api"
export const PUBLIC_URL = "https://sistem-keuangan.lantanajayadigital.cloud"

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
