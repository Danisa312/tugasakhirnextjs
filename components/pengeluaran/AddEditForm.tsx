import React, { useState, useEffect } from "react";
import { Button, Divider, Input, Modal, Text } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import InputSelect from "../input/InputSelect";
import { useToast } from "../toast/ToastProvider";
import { Pengeluaran, usePengeluaranStore } from "../../stores/pengeluaranStore";
import { axiosInstance } from "../../utils/axiosInstance";

interface AddEditPengeluaranProps {
  initialData?: Pengeluaran | null;
  buttonLabel?: string;
}

const metodePembayaranOptions = [
  { id: "tunai", label: "Tunai" },
  { id: "transfer", label: "Transfer" },
  { id: "qris", label: "QRIS" },
];

const AddEditPengeluaranForm: React.FC<AddEditPengeluaranProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;
  const [userOptions, setUserOptions] = useState<{ id: number; label: string }[]>(
    []
  );
  const [kategoriOptions, setKategoriOptions] = useState<{ id: number; label: string }[]>([]);
  const { showToast } = useToast();

  // Definisi form dengan tipe eksplisit
  const [form, setForm] = useState<{
    id?: number;
    user_id?: number;
    tanggal: string;
    jumlah?: number;
    metode_pembayaran: string;
    penerima: string;
    keterangan: string;
    kategori_id?: number;
  }>({
    id: undefined,
    user_id: undefined,
    tanggal: "",
    jumlah: undefined,
    metode_pembayaran: "",
    penerima: "",
    keterangan: "",
    kategori_id: undefined,
  });

  const { addOne, updateOne, loading } = usePengeluaranStore();

  const handler = () => setVisible(true);
  const closeHandler = () => setVisible(false);

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          id: initialData.id || undefined,
          user_id: initialData.user_id || undefined,
          tanggal: initialData.tanggal || "",
          jumlah: initialData.jumlah || undefined,
          metode_pembayaran: initialData.metode_pembayaran || "",
          penerima: initialData.penerima || "",
          keterangan: initialData.keterangan || "",
          kategori_id: initialData.kategori_id || undefined,
        });
      } else {
        setForm({
          id: undefined,
          user_id: undefined,
          tanggal: "",
          jumlah: undefined,
          metode_pembayaran: "",
          penerima: "",
          keterangan: "",
          kategori_id: undefined,
        });
      }
    }
  }, [visible, initialData]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchUserOptions = async (query: string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/users", {
        params: {
          name: query,
          limit: 10,
          page: 1,
        },
      });
      const users = res.data.data.map((item: any) => ({
        id: item.id,
        label: item.name,
      }));
      setUserOptions(users);
      return users;
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Gagal memuat daftar pengguna.", "error");
      return [];
    }
  };

  const fetchKategoriOptions = async (query: string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/kategori_pengeluaran", {
        params: {
          nama: query,
          limit: 10,
          page: 1,
        },
      });
      const kategoris = res.data.data.map((item: any) => ({
        id: item.id,
        label: item.nama,
      }));
      setKategoriOptions(kategoris);
      return kategoris;
    } catch (err) {
      showToast("Gagal memuat daftar kategori.", "error");
      return [];
    }
  };

  const handleSubmit = async () => {
    // Validasi form
    if (!form.user_id) {
      showToast("User harus dipilih.", "error");
      return;
    }

    if (!form.tanggal) {
      showToast("Tanggal harus diisi.", "error");
      return;
    }

    if (!form.jumlah || form.jumlah <= 0) {
      showToast("Jumlah harus lebih besar dari nol.", "error");
      return;
    }

    if (!form.metode_pembayaran) {
      showToast("Metode pembayaran harus dipilih.", "error");
      return;
    }

    // Format data
    const payload = {
      ...form,
      tanggal: new Date(form.tanggal).toISOString().split("T")[0],
      user_id: Number(form.user_id),
      jumlah: Number(form.jumlah),
      kategori_id: Number(form.kategori_id),
    };

    try {
      if (isEditMode && form.id) {
        await updateOne(form.id, payload);
        showToast("Berhasil memperbarui pengeluaran.", "success");
      } else {
        await addOne(payload);
        showToast("Berhasil menambahkan pengeluaran baru.", "success");
      }
      closeHandler();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Terjadi kesalahan. Silakan coba lagi.";
      showToast(message, "error");
    }
  };

  return (
    <div>
      <Button auto onClick={handler} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
        {buttonLabel || (isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran")}
      </Button>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        width="600px"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header css={{ justifyContent: "start" }}>
          <Text id="modal-title" h4>
            {isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
          </Text>
        </Modal.Header>
        <Divider css={{ my: "$5" }} />
        <Modal.Body css={{ py: "$10" }}>
          <Flex
            direction={"column"}
            css={{
              flexWrap: "wrap",
              gap: "$8",
              "@lg": { flexWrap: "nowrap", gap: "$12" },
            }}
          >
            {/* User Select */}
            <InputSelect
              label="User"
              options={userOptions}
              onSearch={fetchUserOptions}
              selectedId={form.user_id ?? null}
              onChange={(option) =>
                option &&
                setForm((prev) => ({
                  ...prev,
                  user_id: Number(option.id),
                }))
              }
              placeholder="Pilih User"
              aria-label="User Selection"
            />

            {/* Tanggal */}
            <Input
              label="Tanggal"
              name="tanggal"
              type="date"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan tanggal"
              value={form.tanggal}
              onChange={handleChange}
              aria-label="Tanggal Input"
            />

            {/* Jumlah */}
            <Input
              label="Jumlah"
              name="jumlah"
              type="number"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan jumlah"
              value={form.jumlah?.toString() || ""}
              onChange={handleChange}
              aria-label="Jumlah Input"
            />

            {/* Metode Pembayaran */}
            <InputSelect
              label="Metode Pembayaran"
              options={metodePembayaranOptions}
              selectedId={form.metode_pembayaran ?? null}
              onChange={(option) =>
                option &&
                setForm((prev) => ({
                  ...prev,
                  metode_pembayaran: option.id as string,
                }))
              }
              placeholder="Pilih metode pembayaran"
              aria-label="Metode Pembayaran Selection"
            />

            {/* Penerima */}
            <Input
              label="Penerima"
              name="penerima"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan nama penerima"
              value={form.penerima || ""}
              onChange={handleChange}
              aria-label="Penerima Input"
            />

            {/* Keterangan */}
            <Input
              label="Keterangan"
              name="keterangan"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan keterangan"
              value={form.keterangan || ""}
              onChange={handleChange}
              aria-label="Keterangan Input"
            />

            {/* Kategori Pengeluaran Select */}
            <InputSelect
              label="Kategori Pengeluaran"
              options={kategoriOptions}
              onSearch={fetchKategoriOptions}
              selectedId={form.kategori_id ?? null}
              onChange={(option) =>
                option &&
                setForm((prev) => ({
                  ...prev,
                  kategori_id: Number(option.id),
                }))
              }
              placeholder="Pilih Kategori Pengeluaran"
              aria-label="Kategori Pengeluaran Selection"
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit} disabled={loading} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
            {loading ? "Menyimpan..." : isEditMode ? "Perbarui Pengeluaran" : "Simpan Pengeluaran"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditPengeluaranForm;