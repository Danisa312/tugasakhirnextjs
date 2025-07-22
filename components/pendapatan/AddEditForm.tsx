import React, { useState, useEffect } from "react";
import { Button, Divider, Input, Modal, Text } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import InputSelect from "../input/InputSelect";
import { useToast } from "../toast/ToastProvider";
import { axiosInstance } from "../../utils/axiosInstance";
import { usePendapatanStore } from "../../stores/pendapatanStore";

interface Pendapatan {
  id: number;
  user_id: number;
  tanggal: string;
  sumber: string;
  jumlah: number;
  metode_pembayaran: string;
  keterangan: string;
}

interface AddEditPendapatanProps {
  initialData?: Pendapatan | null;
  buttonLabel?: any;
}

const metodePembayaranOptions = [
  { id: "tunai", label: "Tunai" },
  { id: "transfer", label: "Transfer" },
  { id: "qris", label: "QRIS" },
];

const AddEditPendapatanForm: React.FC<AddEditPendapatanProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;

  // State untuk pilihan user
  const [userOptions, setUserOptions] = useState<any[]>([]);

  const { showToast } = useToast();
  const [form, setForm] = useState<Partial<Pendapatan>>({
    id: undefined,
    user_id: undefined,
    tanggal: "",
    sumber: "",
    jumlah: 0,
    metode_pembayaran: "",
    keterangan: "",
  });

  const { addOne, updateOne, loading } = usePendapatanStore();

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
          sumber: initialData.sumber || "",
          jumlah: initialData.jumlah || 0,
          metode_pembayaran: initialData.metode_pembayaran || "",
          keterangan: initialData.keterangan || "",
        });
      } else {
        setForm({
          id: undefined,
          user_id: undefined,
          tanggal: "",
          sumber: "",
          jumlah: 0,
          metode_pembayaran: "",
          keterangan: "",
        });
      }
    }
  }, [visible, initialData]);

  const handleChange = (e: React.ChangeEvent<any>) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

  // Fetch user options dari API
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
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && form.id) {
        await updateOne(form.id, form);
        showToast("Success update pendapatan", "success");
      } else {
        await addOne(form);
        showToast("Success create pendapatan", "success");
      }
      closeHandler();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "An unexpected error occurred";
      showToast(message, "error");
    }
  };

  return (
    <div>
      <Button auto onClick={handler} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
        {buttonLabel || (isEditMode ? "Edit Pendapatan" : "Add Pendapatan")}
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
            {isEditMode ? "Edit Pendapatan" : "Add New Pendapatan"}
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
  aria-label="User"
  options={userOptions}
  onSearch={fetchUserOptions}
  selectedId={form.user_id ?? null}
  onChange={(option) =>
    option &&
    setForm((prev) => ({ ...prev, user_id: Number(option.id) }))
  }
  placeholder="Pilih User"
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
              value={form.tanggal}
              onChange={handleChange}
            />

            {/* Sumber */}
            <Input
              label="Sumber"
              name="sumber"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Masukkan sumber"
              value={form.sumber}
              onChange={handleChange}
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
              value={form.keterangan}
              onChange={handleChange}
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit} disabled={loading} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
            {loading ? "Menyimpan..." : isEditMode ? "Update Pendapatan" : "Tambah Pendapatan"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditPendapatanForm;