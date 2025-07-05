// /src/services/userService.ts
import {axiosInstance} from "../utils/axiosInstance";

const baseURL = "/users"; // Sesuaikan dengan endpoint backend Anda

export const getAllUsers = (page = 1, limit = 10) =>
  axiosInstance.get(`${baseURL}?page=${page}&limit=${limit}`);

export const getUserById = (id: number | string) =>
  axiosInstance.get(`${baseURL}/${id}`);

export const createUser = (data: any) =>
  axiosInstance.post(baseURL, data);

export const updateUser = (id: number | string, data: any) =>
  axiosInstance.put(`${baseURL}/${id}`, data);

export const deleteUser = (id: number | string) =>
  axiosInstance.delete(`${baseURL}/${id}`);