// @/stores/settingsStore.ts

import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";

interface Setting {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  logo_path: string;
  kontak: string;
  email_perusahaan: string;
}

interface SettingState {
  data: Setting[];
  loading: boolean;
  error: string | null;
  totalData: number;
  page: number;
  limit: number;
  loadAll: (page: number, limit: number) => Promise<void>;
  addOne: (payload: FormData) => Promise<void>;
  updateOne: (id: number, payload: FormData) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
}

export const useSettingsStore = create<SettingState>((set) => ({
  data: [],
  loading: false,
  error: null,
  totalData: 0,
  page: 1,
  limit: 10,

  loadAll: async (page, limit) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/settings", {
        params: { page, limit },
      });
      const data = res.data.data;
      set({
        data: data.items || data,
        totalData: data.total || data.length,
        loading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memuat pengaturan";
      set({ error: message, loading: false });
    }
  },

  addOne: async (payload: FormData) => {
    set({ loading: true });
    try {
      const res = await import('../services/settingsService').then(s => s.default.addOne(payload));
      const result = res;
      set((state) => ({
        data: [...state.data, result],
        totalData: state.totalData + 1,
        loading: false,
      }));
    } catch (err: any) {
        const message =
      err.response?.data?.errors ||
      err.response?.data?.message ||
      "Gagal menambahkan pengaturan";
    set({ error: JSON.stringify(message), loading: false });
    throw new Error(message);
  }
},

  updateOne: async (id: number, payload: FormData) => {
    set({ loading: true });
    try {
      const res = await import('../services/settingsService').then(s => s.default.updateOne(id, payload));
      const result = res;
      set((state) => ({
        data: state.data.map((item) => (item.id === id ? result : item)),
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal mengubah pengaturan";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteOne: async (id) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/settings/${id}`);
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        totalData: state.totalData - 1,
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal menghapus pengaturan";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));