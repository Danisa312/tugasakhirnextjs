// @/components/settings/index.tsx

import React, { useEffect, useMemo, useCallback } from "react";
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditSettingForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, HouseIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { useSettingsStore } from "../../stores/settingsStore";

export const Settings = () => {
  const {
    data,
    loading,
    error,
    totalData,
    page,
    limit,
    loadAll,
    deleteOne,
  } = useSettingsStore();
  const { showToast } = useToast();
  const { showToast: showConfirmationToast } = useConfirmationToast();

  const handleLoadData = useCallback(
    (params: {
      page: number;
      limit: number;
      sortField?: string | null;
      sortDirection?: string;
    }) => {
      loadAll(params.page, params.limit);
    },
    [loadAll]
  );

  const handleDelete = (setting: any) => {
    showConfirmationToast(
      `Apakah Anda yakin ingin menghapus "${setting.nama_perusahaan}"? Tindakan ini tidak dapat dibatalkan.`,
      "error",
      {
        confirmLabel: "Hapus",
        cancelLabel: "Batal",
        onConfirm: async () => {
          await deleteOne(setting.id);
          showToast("Berhasil menghapus pengaturan", "success");
        },
        onCancel: () => {
          console.log("Penghapusan dibatalkan");
        },
      }
    );
  };

  const columns: Column[] = useMemo(
    () => [
      {
        name: "ID",
        uid: "id",
        sortable: true,
        render: (setting: any) => <>{setting.id}</>
      },
      {
        name: "NAMA PERUSAHAAN",
        uid: "nama_perusahaan",
        sortable: true,
        render: (setting: any) => <>{setting.nama_perusahaan}</>
      },
      {
        name: "ALAMAT",
        uid: "alamat",
        sortable: false,
        render: (setting: any) => <>{setting.alamat}</>
      },
      {
        name: "KONTAK",
        uid: "kontak",
        sortable: false,
        render: (setting: any) => <>{setting.kontak}</>
      },
      {
        name: "EMAIL",
        uid: "email_perusahaan",
        sortable: false,
        render: (setting: any) => <>{setting.email_perusahaan}</>
      },
      {
        name: "ACTIONS",
        uid: "action",
        sortable: false,
        render: (setting: any) => (
          <div style={{ display: "flex", gap: 8 }}>
            <AddEditSettingForm
              initialData={setting}
              buttonLabel={<Edit size={16} />}
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Hapus ${setting.nama_perusahaan}`}
              onClick={() => handleDelete(setting)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  return (
    <Flex
      css={{
        mt: "$5",
        px: "$6",
        "@sm": {
          mt: "$10",
          px: "$16",
        },
      }}
      justify={"center"}
      direction={"column"}
    >
      <Breadcrumbs>
        <Crumb>
          <HouseIcon />
          <Link href={"/"}>
            <CrumbLink href="#">Home</CrumbLink>
          </Link>
          <Text>/</Text>
        </Crumb>
        <Crumb>
          <CrumbLink href="#">Settings</CrumbLink>
          <Text>/</Text>
        </Crumb>
        <Crumb>
          <CrumbLink href="#">List</CrumbLink>
        </Crumb>
      </Breadcrumbs>
      <Flex
        css={{
          gap: "$8",
        }}
        align={"center"}
        justify={"between"}
        wrap={"wrap"}
      >
        <Text h3>Pengaturan Perusahaan</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <AddEditSettingForm />
        </Flex>
      </Flex>
      <TableWrapper
        columns={columns}
        data={data}
        loading={loading}
        totalItems={totalData}
        onDataChange={handleLoadData}
        limitOptions={[5, 10, 15, 25]}
        defaultLimit={limit}
        defaultPage={page}
        defaultSortField="id"
        defaultSortDirection="asc"
        ariaLabel="Settings management table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};