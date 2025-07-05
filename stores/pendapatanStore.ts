import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";

type Pendapatan = {
  id: number;
  user_id: number;
  tanggal: string;
  sumber: string;
  jumlah: number;
  metode_pembayaran: string;
  keterangan: string;
};

type PendapatanStore = {
  data: Pendapatan[];
  loading: boolean;
  error: string | null;
  totalData: number;
  page: number;
  limit: number;
  loadAll: (page: number, limit: number) => Promise<void>;
  addOne: (payload: Partial<Pendapatan>) => Promise<void>;
  updateOne: (id: number, payload: Partial<Pendapatan>) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
};

export const usePendapatanStore = create<PendapatanStore>((set) => ({
  data: [],
  loading: false,
  error: null,
  totalData: 0,
  page: 1,
  limit: 10,

  loadAll: async (page, limit) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/pendapatan", {
        params: { page, limit },
      });
      set({
        data: res.data.data,
        totalData: res.data.total,
        page,
        limit,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch pendapatan",
        loading: false,
      });
    }
  },

  addOne: async (payload) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/pendapatan", payload);
      await usePendapatanStore.getState().loadAll(1, 10);
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to add pendapatan" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateOne: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.put(`/pendapatan/${id}`, payload);
      await usePendapatanStore.getState().loadAll(1, 10);
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to update pendapatan" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteOne: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/pendapatan/${id}`);
      await usePendapatanStore.getState().loadAll(1, 10);
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to delete pendapatan" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));