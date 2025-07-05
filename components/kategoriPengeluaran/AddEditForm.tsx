import React, { useState, useEffect } from "react";
import { Button, Divider, Input, Modal, Text } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import { useToast } from "../toast/ToastProvider";
import { KategoriPengeluaran, useKategoriPengeluaranStore } from "../../stores/kategoriPengeluaranStore";

interface AddEditKategoriPengeluaranProps {
  initialData?: KategoriPengeluaran | null;
  buttonLabel?: any;
}

const AddEditKategoriPengeluaranForm: React.FC<AddEditKategoriPengeluaranProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;
  const { showToast } = useToast();
  const { addOne, updateOne, loading } = useKategoriPengeluaranStore();

  const [form, setForm] = useState({
    id: undefined as number | undefined,
    nama: "",
    deskripsi: "",
  });

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          id: initialData.id,
          nama: initialData.nama || "",
          deskripsi: initialData.deskripsi || "",
        });
      } else {
        setForm({
          id: undefined,
          nama: "",
          deskripsi: "",
        });
      }
    }
  }, [visible, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.nama.trim()) {
        showToast("Nama harus diisi", "error");
        return;
      }

      const payload = {
        nama: form.nama,
        deskripsi: form.deskripsi,
      };

      if (isEditMode && form.id !== undefined) {
        await updateOne(form.id, payload);
        showToast("Berhasil mengubah kategori pengeluaran", "success");
      } else {
        await addOne(payload);
        showToast("Berhasil menambahkan kategori pengeluaran", "success");
      }

      closeHandler();
    } catch (err: any) {
      const message = err.response?.data?.message || "Terjadi kesalahan";
      showToast(message, "error");
    }
  };

  return (
    <div>
      <Button auto onClick={handler}>
        {buttonLabel || (isEditMode ? "Edit Kategori" : "Tambah Kategori")}
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
            {isEditMode ? "Edit Kategori Pengeluaran" : "Tambah Kategori Pengeluaran"}
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
            <Input
              label="Nama"
              name="nama"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan nama"
              value={form.nama}
              onChange={handleChange}
            />
            <Input
              label="Diskripsi"
              name="deskripsi" 
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : isEditMode ? "Update Kategori" : "Simpan"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditKategoriPengeluaranForm;