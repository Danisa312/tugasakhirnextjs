import {axiosInstance} from "../utils/axiosInstance";
import { AxiosError } from "axios";

// Tipe untuk Saldo
export interface Saldo {
  id: number;
  tanggal: string; // format date: "YYYY-MM-DD"
  saldo_awal: number;
  total_pendapatan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
}

// Tipe untuk response sukses
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Tipe untuk response list
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// Params untuk request pagination
export interface FetchSaldoParams {
  page?: number;
  limit?: number;
}

// GET: Ambil semua saldo dengan pagination
export const fetchAllSaldo = async (
  params: FetchSaldoParams = {}
) => {
  try {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Saldo>>>("/saldo", {
      params,
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Gagal mengambil data saldo");
  }
};

// POST: Tambah saldo baru
export const createSaldo = async (payload: Omit<Saldo, "id">) => {
  try {
    const response = await axiosInstance.post<ApiResponse<Saldo>>("/saldo", payload);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Gagal menambahkan saldo");
  }
};

// PUT: Perbarui saldo berdasarkan ID
export const updateSaldo = async (
  id: number,
  payload: Partial<Omit<Saldo, "id">>
) => {
  try {
    const response = await axiosInstance.put<ApiResponse<Saldo>>(`/saldo/${id}`, payload);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Gagal memperbarui saldo");
  }
};

// DELETE: Hapus saldo berdasarkan ID
export const deleteSaldo = async (id: number) => {
  try {
    await axiosInstance.delete<ApiResponse<void>>(`/saldo/${id}`);
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Gagal menghapus saldo");
  }
};