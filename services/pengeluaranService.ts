import { axiosInstance } from "../utils/axiosInstance";

export interface Pengeluaran {
  id: number;
  user_id: number;
  kategori_id: number;
  tanggal: string;
  jumlah: number;
  metode_pembayaran: string;
  penerima: string;
  keterangan?: string;
}

export default {
  async loadAll(page: number = 1, limit: number = 10) {
    const response = await axiosInstance.get("/pengeluaran", {
      params: { page, limit },
    });
    return {
      items: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },
  async addOne(data: Omit<Pengeluaran, "id">) {
    const response = await axiosInstance.post("/pengeluaran", data);
    return response.data.data;
  },
  async updateOne(id: number, data: Partial<Omit<Pengeluaran, "id">>) {
    const response = await axiosInstance.put(`/pengeluaran/${id}`, data);
    return response.data.data;
  },
  async deleteOne(id: number) {
    await axiosInstance.delete(`/pengeluaran/${id}`);
  },
};