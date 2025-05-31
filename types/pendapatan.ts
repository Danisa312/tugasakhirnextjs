export interface Pendapatan {
  id: number;
  user_id: number;
  tanggal: string;
  sumber: string;
  jumlah: number;
  metode_pembayaran: 'tunai' | 'transfer' | 'qris';
  keterangan: string | null;
  user?: {
    id: number;
    name: string;
  };
}
