// @/stores/kategori_pengeluaranStore.ts

import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";

export interface KategoriPengeluaran {
  id: number;
  nama: string;
  deskripsi: string;
}

type KategoriPengeluaranState = {
  data: KategoriPengeluaran[];
  loading: boolean;
  error: string | null;
  totalData: number;
  page: number;
  limit: number;
  loadAll: (page: number, limit: number) => Promise<void>;
  addOne: (payload: Omit<KategoriPengeluaran, "id">) => Promise<void>;
  updateOne: (id: number, payload: Partial<Omit<KategoriPengeluaran, "id">>) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
};

export const useKategoriPengeluaranStore = create<KategoriPengeluaranState>((set) => ({
  data: [],
  loading: false,
  error: null,
  totalData: 0,
  page: 1,
  limit: 10,

  loadAll: async (page, limit) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/kategori_pengeluaran", {
        params: { page, limit },
      });
      set({
        data: res.data.data,
        totalData: res.data.total || res.data.data.length,
        page,
        limit,
        loading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memuat data";
      set({ error: message, loading: false });
    }
  },

  addOne: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/kategori_pengeluaran", payload);
      set((state) => ({
        data: [...state.data, res.data.data],
        totalData: state.totalData + 1,
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal menambah data";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateOne: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.put(`/kategori_pengeluaran/${id}`, payload);
      set((state) => ({
        data: state.data.map((item) => (item.id === id ? { ...item, ...payload } : item)),
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal mengubah data";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteOne: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/kategori_pengeluaran/${id}`);
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        totalData: state.totalData - 1,
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal menghapus data";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));