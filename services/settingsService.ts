// /src/services/settingsService.ts
import {axiosInstance} from "../utils/axiosInstance";


const API_URL = "/settings"; // Sesuaikan dengan endpoint backend Anda

export interface Setting {
  id: number;
  user: {
    id: number;
    name: string;
  };
  nama_perusahaan: string;
  alamat: string;
  logo_path: string;
  kontak: string;
  email_perusahaan: string;
}

export default {
  async loadAll(page: number = 1, limit: number = 10) {
    const response = await axiosInstance.get(`${API_URL}`, {
      params: { page, limit },
    });
    return response.data.data; // Harus berisi { items: [], total: X }
  },

  async getOne(id: number): Promise<Setting> {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  async addOne(data: FormData) {
    const response = await axiosInstance.post(`${API_URL}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateOne(id: number, data: FormData) {
    const response = await axiosInstance.post(`${API_URL}/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteOne(id: number) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data.data;
  },
};