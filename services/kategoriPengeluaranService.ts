// /src/services/kategoriPengeluaranService.ts
import {axiosInstance} from "../utils/axiosInstance";

const API_URL = "/kategori_pengeluaran"; 

export interface KategoriPengeluaran {
  id: number;
  nama: string;
  deskripsi?: string;
   created_at?: string;
  updated_at?: string;

}

export default {
  async loadAll(page: number = 1, limit: number = 10) {
    const response = await axiosInstance.get(`${API_URL}`, {
      params: { page, limit },
    });
    return response.data.data; 
  },

  async getOne(id: number): Promise<KategoriPengeluaran> {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  async addOne(data: Omit<KategoriPengeluaran, "id">) {
    const response = await axiosInstance.post(`${API_URL}`, data);
    return response.data.data;
  },

  async updateOne(id: number, data: Partial<Omit<KategoriPengeluaran, "id">>) {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  async deleteOne(id: number) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data.data;
  },
};