// @/components/settings/AddEditForm.tsx

import React, { useState, useEffect } from "react";
import { Button, Divider, Input, Modal, Text } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import { useToast } from "../toast/ToastProvider";
import { Setting, useSettingsStore } from "../../stores/settingsStore";

interface AddEditSettingProps {
  initialData?: Setting | null;
  buttonLabel?: any;
}

const AddEditSettingForm: React.FC<AddEditSettingProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;
  const { showToast } = useToast();
  const { addOne, updateOne, loading } = useSettingsStore();

  const [form, setForm] = useState<Partial<Setting>>({
    id: undefined,
    nama_perusahaan: "",
    alamat: "",
    logo_path: "",
    kontak: "",
    email_perusahaan: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handler = () => setVisible(true);
  const closeHandler = () => setVisible(false);

  // Reset form saat modal dibuka
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          id: initialData.id || undefined,
          nama_perusahaan: initialData.nama_perusahaan || "",
          alamat: initialData.alamat || "",
          logo_path: initialData.logo_path || "",
          kontak: initialData.kontak || "",
          email_perusahaan: initialData.email_perusahaan || "",
        });
      } else {
        setForm({
          id: undefined,
          nama_perusahaan: "",
          alamat: "",
          logo_path: "",
          kontak: "",
          email_perusahaan: "",
        });
      }
    }
  }, [visible, initialData]);

 const handleChange = (e: React.ChangeEvent<FormElement>) => {
  const target = e.target as typeof e.target & {
    name: string;
    value: string;
  };
  const { name, value } = target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

 const handleSubmit = async () => {
  try {
    if (!form.nama_perusahaan || !form.email_perusahaan) {
      showToast("Nama perusahaan dan Email wajib diisi", "error");
      return;
    }

    const formData = new FormData();
    formData.append('nama_perusahaan', form.nama_perusahaan || '');
    formData.append('alamat', form.alamat || '');
    formData.append('kontak', form.kontak || '');
    formData.append('email_perusahaan', form.email_perusahaan || '');
    if (logoFile) formData.append('logo_path', logoFile);

    if (isEditMode && form.id) {
      await updateOne(form.id, formData);
      showToast("Berhasil mengubah pengaturan", "success");
    } else {
      await addOne(formData);
      showToast("Berhasil menambahkan pengaturan", "success");
    }

    closeHandler();
  } catch (error: any) {
    // Display detailed error messages to the user
    const message =
      error.message || // Use the error message from the store
      "Terjadi kesalahan saat menyimpan data";
    showToast(message, "error");
  }
};
  return (
    <div>
      <Button auto onClick={handler}>
        {buttonLabel || (isEditMode ? "Edit Pengaturan" : "Tambah Pengaturan")}
      </Button>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        width="420px"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header css={{ justifyContent: "start" }}>
          <Text id="modal-title" h4>
            {isEditMode ? "Edit Pengaturan" : "Tambah Pengaturan"}
          </Text>
        </Modal.Header>
        <Divider css={{ my: "$5" }} />
        <Modal.Body css={{ py: "$6", px: "$6" }}>
          <Flex
            direction={"column"}
            css={{
              flexWrap: "wrap",
              gap: "$6",
              "@lg": { flexWrap: "nowrap", gap: "$8" },
            }}
          >
            <Input
              label="Nama Perusahaan"
              name="nama_perusahaan"
              clearable
              bordered
              fullWidth
              size="md"
              placeholder="Masukkan nama perusahaan"
              value={form.nama_perusahaan || ""}
              onChange={handleChange}
            />
            <Input
              label="Alamat"
              name="alamat"
              clearable
              bordered
              fullWidth
              size="md"
              placeholder="Masukkan alamat"
              value={form.alamat || ""}
              onChange={handleChange}
            />
            <Input
              label="Logo Path"
              name="logo_path"
              type="file"
              bordered
              fullWidth
              size="md"
              accept="image/*"
              onChange={e => setLogoFile(e.target.files?.[0] || null)}
            />
            <Input
              label="Kontak"
              name="kontak"
              clearable
              bordered
              fullWidth
              size="md"
              placeholder="Masukkan nomor kontak"
              value={form.kontak || ""}
              onChange={handleChange}
            />
            <Input
              label="Email Perusahaan"
              name="email_perusahaan"
              clearable
              bordered
              fullWidth
              size="md"
              placeholder="Masukkan email"
              value={form.email_perusahaan || ""}
              onChange={handleChange}
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto color="primary" shadow onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditSettingForm;