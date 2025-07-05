// /src/services/pendapatanService.ts
import {axiosInstance} from "../utils/axiosInstance";

const API_URL = "/pendapatan"; // Sesuaikan dengan endpoint backend Anda

export interface Pendapatan {
  id: number;
  user_id: number;
  tanggal: string; // format date: YYYY-MM-DD
  sumber: string;
  jumlah: number;
  metode_pembayaran: string;
  keterangan?: string;
}

export default {
  async loadAll(page: number = 1, limit: number = 10) {
    const response = await axiosInstance.get(`${API_URL}`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  async getOne(id: number): Promise<Pendapatan> {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  async addOne(data: Omit<Pendapatan, "id">) {
    const response = await axiosInstance.post(`${API_URL}`, data);
    return response.data.data;
  },

  async updateOne(id: number, data: Partial<Omit<Pendapatan, "id">>) {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  async deleteOne(id: number) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data.data;
  },
};