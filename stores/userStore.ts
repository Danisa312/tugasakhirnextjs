// @/stores/userStore.tsx
import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
  password?: string;
}

interface UserStore {
  data: User[];
  loading: boolean;
  error: string | null;
  totalData: number;
  page: number;
  limit: number;
  loadAll: (page: number, limit: number) => Promise<void>;
  addOne: (userData: Partial<User>) => Promise<void>;
  updateOne: (id: number, userData: Partial<User>) => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  data: [],
  loading: false,
  error: null,
  totalData: 0,
  page: 1,
  limit: 10,

  loadAll: async (page, limit) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/users", {
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
      set({ error: err.response?.data?.message || "Failed to fetch users", loading: false });
    }
  },

  addOne: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/users", userData);
      set((state) => ({
        data: [...state.data, res.data.data],
        totalData: state.totalData + 1,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to add user", loading: false });
      throw err;
    }
  },

  updateOne: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.put(`/users/${id}`, userData);
      set((state) => ({
        data: state.data.map((item) => (item.id === id ? { ...item, ...userData } : item)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to update user", loading: false });
      throw err;
    }
  },

  deleteOne: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/users/${id}`);
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        totalData: state.totalData - 1,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to delete user", loading: false });
      throw err;
    }
  },
}));