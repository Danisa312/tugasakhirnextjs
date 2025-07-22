// @/components/kategori_pengeluaran/index.tsx

import React, { useEffect, useMemo, useCallback } from "react";
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditKategoriPengeluaranForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, HouseIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { useKategoriPengeluaranStore } from "../../stores/kategoriPengeluaranStore";

export const KategoriPengeluaran = () => {
  const {
    data,
    loading,
    error,
    totalData,
    page,
    limit,
    loadAll,
    deleteOne,
  } = useKategoriPengeluaranStore();
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

  const handleDelete = (kategori: any) => {
    showConfirmationToast(
      `Apakah Anda yakin ingin menghapus "${kategori.nama}"? Tindakan ini tidak dapat dibatalkan.`,
      "error",
      {
        confirmLabel: "Hapus",
        cancelLabel: "Batal",
        onConfirm: async () => {
          await deleteOne(kategori.id);
          showToast("Berhasil menghapus kategori pengeluaran", "success");
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
        render: (kategori: any) => <>{kategori.id}</>,
      },
      {
        name: "NAMA",
        uid: "nama",
        sortable: true,
        render: (kategori: any) => <>{kategori.nama}</>,
      },
      {
        name: "DESKRIPSI",
        uid: "deskripsi",
        sortable: false,
        render: (kategori: any) => <>{kategori.deskripsi}</>,
      },
      {
        name: "ACTIONS",
        uid: "action",
        sortable: false,
        render: (kategori: any) => (
          <div style={{ display: "flex", gap: 8 }}>
            <AddEditKategoriPengeluaranForm
              initialData={kategori}
              buttonLabel={<Edit size={16} />}
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Hapus ${kategori.nama}`}
              onClick={() => handleDelete(kategori)}
              css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}
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
          <CrumbLink href="#">Kategori Pengeluaran</CrumbLink>
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
        <Text h3>Kategori Pengeluaran</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <AddEditKategoriPengeluaranForm />
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
        ariaLabel="Kategori Pengeluaran management table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};