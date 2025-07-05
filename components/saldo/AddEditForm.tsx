// /components/saldo/AddEditForm.tsx
import React, { useState, useEffect } from "react";
import { Button, Divider, Input, Modal, Text } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import InputSelect from "../input/InputSelect";
import { useToast } from "../toast/ToastProvider";
import { Saldo, useSaldoStore } from "../../stores/saldoStore";
import { axiosInstance } from "../../utils/axiosInstance";

interface AddEditSaldoProps {
  initialData?: Saldo | null;
  buttonLabel?: any;
}

const AddEditSaldoForm: React.FC<AddEditSaldoProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;

  const { showToast } = useToast();
  const [form, setForm] = useState<Partial<Saldo>>({
    id: undefined,
    tanggal: "",
    saldo_awal: undefined,
    total_pendapatan: undefined,
    total_pengeluaran: undefined,
    saldo_akhir: undefined,
  });

  const { addOne, updateOne, loading } = useSaldoStore();

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  // Reset form saat modal dibuka
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          id: initialData.id || undefined,
          tanggal: initialData.tanggal || "",
          saldo_awal: initialData.saldo_awal || 0,
          total_pendapatan: initialData.total_pendapatan || 0,
          total_pengeluaran: initialData.total_pengeluaran || 0,
          saldo_akhir: initialData.saldo_akhir || 0,
        });
      } else {
        setForm({
          id: undefined,
          tanggal: "",
          saldo_awal: 0,
          total_pendapatan: 0,
          total_pengeluaran: 0,
          saldo_akhir: 0,
        });
      }
    }
  }, [visible, initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        saldo_awal: Number(form.saldo_awal) || 0,
        total_pendapatan: Number(form.total_pendapatan) || 0,
        total_pengeluaran: Number(form.total_pengeluaran) || 0,
        saldo_akhir: Number(form.saldo_akhir) || 0,
      };
      if (isEditMode && form.id) {
        await updateOne(form.id, payload);
        showToast("Berhasil memperbarui saldo", "success");
      } else {
        await addOne(payload);
        showToast("Berhasil menambahkan saldo", "success");
      }
      closeHandler();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Terjadi kesalahan tak terduga";
      showToast(message, "error");
    }
  };

  return (
    <div>
      <Button auto onClick={handler}>
        {buttonLabel || (isEditMode ? "Edit Saldo" : "Tambah Saldo")}
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
            {isEditMode ? "Edit Saldo" : "Tambah Saldo Baru"}
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
            />
            <Input
              label="Saldo Awal"
              name="saldo_awal"
              type="number"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan saldo awal"
              value={form.saldo_awal?.toString() || ""}
              onChange={handleChange}
            />
            <Input
              label="Total Pendapatan"
              name="total_pendapatan"
              type="number"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan total pendapatan"
              value={form.total_pendapatan?.toString() || ""}
              onChange={handleChange}
            />
            <Input
              label="Total Pengeluaran"
              name="total_pengeluaran"
              type="number"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan total pengeluaran"
              value={form.total_pengeluaran?.toString() || ""}
              onChange={handleChange}
            />
            <Input
              label="Saldo Akhir"
              name="saldo_akhir"
              type="number"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan saldo akhir"
              value={form.saldo_akhir?.toString() || ""}
              onChange={handleChange}
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : isEditMode ? "Perbarui Saldo" : "Tambah Saldo"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditSaldoForm;