import React, { useState, useEffect } from "react";
import {
  Button,
  Divider,
  Input,
  Modal,
  Text,
} from "@nextui-org/react";
import { Flex } from "../styles/flex";
import InputSelect from "../input/InputSelect";
import { useToast } from "../toast/ToastProvider";
import {
  LaporanBulanan,
  useLaporanBulananStore,
} from "../../stores/laporanBulananStore";

// Remove or comment out:
//import { axiosInstance } from "../utils/axiosInstance";

interface AddEditLaporanBulananProps {
  initialData?: LaporanBulanan | null;
  buttonLabel?: any;
}

const AddEditLaporanBulananForm: React.FC<AddEditLaporanBulananProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;

  const { showToast } = useToast();
  const { addOne, updateOne, loading } = useLaporanBulananStore();

  const [form, setForm] = useState<Partial<LaporanBulanan>>({
    id: undefined,
    bulan: "",
    tahun: 0,
    total_pendapatan: 0,
    total_pengeluaran: 0,
    saldo_akhir: 0,
    catatan: "",
  });

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          id: initialData.id || undefined,
          bulan: initialData.bulan || "",
          tahun: initialData.tahun || 0,
          total_pendapatan: initialData.total_pendapatan || 0,
          total_pengeluaran: initialData.total_pengeluaran || 0,
          saldo_akhir: initialData.saldo_akhir || 0,
          catatan: initialData.catatan || "",
        });
      } else {
        setForm({
          id: undefined,
          bulan: "",
          tahun: 0,
          total_pendapatan: 0,
          total_pengeluaran: 0,
          saldo_akhir: 0,
          catatan: "",
        });
      }
    }
  }, [visible, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Jika field number, ubah ke Number()
    const parsedValue =
      ["tahun", "total_pendapatan", "total_pengeluaran", "saldo_akhir"].includes(
        name
      )
        ? Number(value)
        : value;

    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && form.id) {
        await updateOne(form.id, form);
        showToast("Success update monthly report", "success");
      } else {
        await addOne(form);
        showToast("Success create monthly report", "success");
      }
      closeHandler();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "An unexpected error occurred";
      showToast(message, "error");
    }
  };

  return (
    <div>
      <Button auto onClick={handler} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
        {buttonLabel || (isEditMode ? "Edit Report" : "Add Report")}
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
            {isEditMode ? "Edit Report" : "Add New Report"}
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
            <div>
              <label htmlFor="bulan-select">Bulan</label>
              <select
                id="bulan-select"
                name="bulan"
                value={form.bulan}
                onChange={e => setForm(prev => ({ ...prev, bulan: `${Number(e.target.value)}`}))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', marginTop: '4px', marginBottom: '8px' }}
              >
                <option value="">Pilih Bulan</option>
                <option value={1}>Januari</option>
                <option value={2}>Februari</option>
                <option value={3}>Maret</option>
                <option value={4}>April</option>
                <option value={5}>Mei</option>
                <option value={6}>Juni</option>
                <option value={7}>Juli</option>
                <option value={8}>Agustus</option>
                <option value={9}>September</option>
                <option value={10}>Oktober</option>
                <option value={11}>November</option>
                <option value={12}>Desember</option>
              </select>
            </div>
            <div>
              <label htmlFor="tahun-select">Tahun</label>
              <select
                id="tahun-select"
                name="tahun"
                value={form.tahun}
                onChange={e => setForm(prev => ({ ...prev, tahun: Number(e.target.value) }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', marginTop: '4px', marginBottom: '8px' }}
              >
                <option value="">Pilih Tahun</option>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <Input
              label="Total Pendapatan"
              name="total_pendapatan"
              type="number"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Enter total income"
              value={String(form.total_pendapatan)}
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
              placeholder="Enter total expense"
              value={String(form.total_pengeluaran)}
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
              placeholder="Enter ending balance"
              value={String(form.saldo_akhir)}
              onChange={handleChange}
            />
            <Input
              label="Catatan"
              name="catatan"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Enter notes"
              value={form.catatan}
              onChange={handleChange}
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit} disabled={loading} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
            {loading ? "Saving..." : isEditMode ? "Update Report" : "Add Report"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditLaporanBulananForm;