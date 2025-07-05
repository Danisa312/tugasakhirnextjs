// /stores/saldoStore.ts
import { create } from "zustand";
import { fetchAllSaldo, createSaldo, updateSaldo, deleteSaldo, Saldo } from "../services/saldoService";

interface SaldoState {
  data: Saldo[];
  loading: boolean;
  error: string | null;
  totalData: number;
  page: number;
  limit: number;
  loadAll: (page: number, limit: number) => void;
  addOne: (payload: Partial<Saldo>) => Promise<void>;
  updateOne: (id: number, payload: Partial<Saldo>) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
}

export const useSaldoStore = create<SaldoState>((set) => ({
  data: [],
  loading: false,
  error: null,
  totalData: 0,
  page: 1,
  limit: 10,
  loadAll: async (page, limit) => {
    set({ loading: true, error: null });
    try {
      const result: any = await fetchAllSaldo({ page, limit });
      set({
        data: result.data,
        totalData: result.total,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addOne: async (payload) => {
    try {
      const result: any = await createSaldo(payload as Omit<Saldo, "id">);
      set((state) => ({
        data: [...state.data, result],
        totalData: state.totalData + 1,
      }));
    } catch (err: any) {
      throw err;
    }
  },
  updateOne: async (id, payload) => {
    try {
      const result: any = await updateSaldo(id, payload);
      set((state) => ({
        data: state.data.map((item) =>
          item.id === id ? result : item
        ),
      }));
    } catch (err: any) {
      throw err;
    }
  },
  deleteOne: async (id) => {
    try {
      await deleteSaldo(id);
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        totalData: state.totalData - 1,
      }));
    } catch (err: any) {
      throw err;
    }
  },
}));