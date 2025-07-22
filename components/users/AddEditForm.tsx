// @/components/users/AddEditForm.tsx
import React, { useState, useEffect } from "react";
import { Button, Divider, Input, Modal, Text } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import InputSelect from "../input/InputSelect";
import { useToast } from "../toast/ToastProvider";
import { User, useUserStore } from "../../stores/userStore";
import { axiosInstance } from "../../utils/axiosInstance";

interface AddEditUserProps {
  initialData?: User | null;
  buttonLabel?: any;
}

const AddEditUserForm: React.FC<AddEditUserProps> = ({
  initialData = null,
  buttonLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const isEditMode = !!initialData?.id;

  const [form, setForm] = useState<Partial<User>>({
    id: undefined,
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    created_at: "",
    updated_at: "",
  });

  const { showToast } = useToast();
  const { addOne, updateOne, loading } = useUserStore();

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
          name: initialData.name || "",
          email: initialData.email || "",
          username: initialData.username || "",
          password: "",
          role: initialData.role || "user",
          created_at: initialData.created_at || "",
          updated_at: initialData.updated_at || "",
        });
      } else {
        setForm({
          id: undefined,
          name: "",
          email: "",
          username: "",
          password: "",
          role: "user",
          created_at: "",
          updated_at: "",
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
      if (isEditMode && form.id) {
        await updateOne(form.id, form);
        showToast("Success update user", "success");
      } else {
        await addOne(form);
        showToast("Success create user", "success");
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
      <Button auto onClick={handler} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600, borderRadius: 12, fontSize: 16, px: 24, py: 10, boxShadow: '0 2px 8px rgba(185,28,28,0.10)' }}>
        {buttonLabel || (isEditMode ? "Edit User" : "Add User")}
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
            {isEditMode ? "Edit User" : "Add New User"}
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
              label="Name"
              name="name"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Username"
              name="username"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              clearable
              bordered
              fullWidth
              size="lg"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
            />
            <InputSelect
              label="Role"
              options={[
                { id: "admin", label: "Admin" },
                { id: "user", label: "User" },
                { id: "directure", label: "Director" },
              ]}
              selectedId={form.role ?? null}
              onChange={(option) =>
                option &&
                setForm((prev) => ({ ...prev, role: option.id as string }))
              }
              placeholder="Select Role"
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: "$5" }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit} disabled={loading} css={{ background: '#b91c1c', color: '#fff', fontWeight: 600, borderRadius: 12, fontSize: 16, px: 24, py: 10, boxShadow: '0 2px 8px rgba(185,28,28,0.10)' }}>
            {loading ? "Saving..." : isEditMode ? "Update User" : "Add User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditUserForm;