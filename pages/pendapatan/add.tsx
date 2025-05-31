import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import { useRouter } from "next/router";
import { axiosInstance } from "../../utils/axiosInstance";

export default function TambahPendapatan() {
  const router = useRouter();
  const [form, setForm] = useState({
    user_id: 1,
    tanggal: "",
    sumber: "",
    jumlah: "",
    metode_pembayaran: "tunai",
    keterangan: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/pendapatan", {
        ...form,
        jumlah: parseFloat(form.jumlah),
      });
      router.push("/pendapatan");
    } catch (err) {
      console.error("Gagal menyimpan:", err);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "2rem" }}>
      <h2>Tambah Pendapatan</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Tanggal"
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            fullWidth
            required
          />
        </div>

        <div className="mb-4">
          <Input
            label="Sumber"
            name="sumber"
            value={form.sumber}
            onChange={handleChange}
            fullWidth
            required
          />
        </div>

        <div className="mb-4">
          <Input
            label="Jumlah"
            name="jumlah"
            type="number"
            value={form.jumlah}
            onChange={handleChange}
            fullWidth
            required
          />
        </div>

        <div className="mb-4">
          <label style={{ display: "block", marginBottom: "4px" }}>Metode Pembayaran</label>
          <select
            name="metode_pembayaran"
            value={form.metode_pembayaran}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
            <option value="qris">QRIS</option>
          </select>
        </div>

        <div className="mb-4">
          <Input
            label="Keterangan"
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            fullWidth
          />
        </div>

        <Button type="submit" color="primary" auto>
          Simpan
        </Button>
      </form>
    </div>
  );
}
