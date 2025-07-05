// @/stores/laporanBulananStore.ts
import { create } from "zustand";
import laporanBulananService from "../services/laporanBulananService";

export interface LaporanBulanan {
  id: number;
  bulan: string;
  tahun: number;
  total_pendapatan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  catatan: string;
}

interface LaporanBulananState {
  data: LaporanBulanan[];
  loading: boolean;
  error: string | null;
  totalData: number;
  page: number;
  limit: number;
  loadAll: (page: number, limit: number) => Promise<void>;
  addOne: (payload: Partial<LaporanBulanan>) => Promise<void>;
  updateOne: (id: number, payload: Partial<LaporanBulanan>) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
}

export const useLaporanBulananStore = create<LaporanBulananState>((set) => ({
  data: [], // Correctly initialize as an empty array
  loading: false,
  error: null,
  totalData: 0,
  page: 1,
  limit: 10,

  loadAll: async (page, limit) => {
    set({ loading: true });
    try {
      const data = await laporanBulananService.loadAll(page, limit);
      set({
        data: data.data,
        totalData: data.total,
        loading: false,
      });
    } catch (err: any) {
      console.log(err);
      const message =
        err.response?.data?.message || "Failed to fetch monthly reports";
      set({ error: message, loading: false });
    }
  },

  addOne: async (payload) => {
    set({ loading: true });
    try {
      const result = await laporanBulananService.addOne(payload);
      set((state) => ({
        data: [
          ...state.data,
          {
            ...result,
            tahun: Number(result.tahun),
            total_pendapatan: Number(result.total_pendapatan),
            total_pengeluaran: Number(result.total_pengeluaran),
            saldo_akhir: Number(result.saldo_akhir),
          },
        ],
        totalData: state.totalData + 1,
        loading: false,
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to add monthly report";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateOne: async (id, payload) => {
    set({ loading: true });
    try {
      const result = await laporanBulananService.updateOne(id, payload);
      set((state) => ({
        data: state.data.map((item) =>
          item.id === id
            ? {
                ...result,
                tahun: Number(result.tahun),
                total_pendapatan: Number(result.total_pendapatan),
                total_pengeluaran: Number(result.total_pengeluaran),
                saldo_akhir: Number(result.saldo_akhir),
              }
            : item
        ),
        loading: false,
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to update monthly report";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteOne: async (id) => {
    set({ loading: true });
    try {
      await laporanBulananService.deleteOne(id);
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        totalData: state.totalData - 1,
        loading: false,
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to delete monthly report";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));