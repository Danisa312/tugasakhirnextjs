// /src/services/laporanBulananService.ts
import {axiosInstance} from "../utils/axiosInstance";
const API_URL = "/laporan_bulanan"; // Sesuaikan dengan endpoint backend Anda

export interface LaporanBulanan {
  id: number;
  user: {
    id: number;
    name: string;
  };
  bulan: number; // 1 - 12
  tahun: number;
  total_pendapatan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  catatan?: string;
}

export default {
  async loadAll(page: number = 1, limit: number = 10) {
    const response = await axiosInstance.get(`${API_URL}`, {
      params: { page, limit },
    });
    return response.data; // Harus berisi { items: [], total: X }
  },

  async getOne(id: number): Promise<LaporanBulanan> {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  async addOne(data: Omit<LaporanBulanan, "id">) {
    const response = await axiosInstance.post(`${API_URL}`, data);
    return response.data;
  },

  async updateOne(id: number, data: Partial<Omit<LaporanBulanan, "id">>) {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  async deleteOne(id: number) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },
};