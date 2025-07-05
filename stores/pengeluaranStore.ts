import { create } from "zustand";
import pengeluaranService from "../services/pengeluaranService";

export interface Pengeluaran {
  id: number;
  user_id: number;
  tanggal: string; // ISO date string
  jumlah: number;
  metode_pembayaran: string;
  penerima: string;
  keterangan: string;
}
interface PengeluaranState {
  data: Pengeluaran[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalData: number;

  loadAll: (page?: number, limit?: number) => Promise<void>;
  addOne: (data: Omit<Pengeluaran, "id">) => Promise<Pengeluaran>;
  updateOne: (id: number, data: Partial<Omit<Pengeluaran, "id">>) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
}

export const usePengeluaranStore = create<PengeluaranState>((set) => ({
  data: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalData: 0,

  loadAll: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await pengeluaranService.loadAll(page, limit);
      set({
        data: result.items || [],
        page,
        limit,
        totalData: result.total || 0,
        loading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch pengeluaran";
      set({ error: message, loading: false });
    }
  },

  addOne: async (data) => {
    set({ loading: true, error: null });
    try {
      const newItem = await pengeluaranService.addOne(data);
      set((state) => ({
        data: [newItem, ...state.data],
        loading: false,
      }));
      return newItem;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to add pengeluaran";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateOne: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedItem = await pengeluaranService.updateOne(id, data);
      set((state) => ({
        data: state.data.map((item) =>
          item.id === id ? updatedItem : item
        ),
        loading: false,
      }));
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update pengeluaran";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteOne: async (id) => {
    set({ loading: true, error: null });
    try {
      await pengeluaranService.deleteOne(id);
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to delete pengeluaran";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));