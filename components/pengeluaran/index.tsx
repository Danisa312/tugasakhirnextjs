// /components/pengeluaran/index.tsx
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import React, { useEffect, useMemo, useCallback } from "react";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditPengeluaranForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, Eye, HouseIcon, ShoppingCartIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { usePengeluaranStore } from "../../stores/pengeluaranStore";

export const Pengeluaran = () => {
  const {
    data,
    loading,
    error,
    totalData,
    page,
    limit,
    loadAll,
    deleteOne,
  } = usePengeluaranStore();
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

  const handleDelete = (pengeluaran: any) => {
    showConfirmationToast(
      `Are you sure you want to delete pengeluaran "${pengeluaran.id}"? This action cannot be undone.`,
      "error",
      {
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        onConfirm: async () => {
          await deleteOne(pengeluaran.id);
          showToast("Success delete pengeluaran", "success");
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
        name: "USER",
        uid: "user",
        sortable: true,
        render: (pengeluaran: any) => <>{pengeluaran.user_id}</>,
      },
      {
        name: "TANGGAL",
        uid: "tanggal",
        sortable: true,
        render: (pengeluaran: any) => <>{pengeluaran.tanggal}</>,
      },
      {
        name: "JUMLAH",
        uid: "jumlah",
        sortable: true,
        render: (pengeluaran: any) => <>{pengeluaran.jumlah}</>,
      },
      {
        name: "METODE PEMBAYARAN",
        uid: "metode_pembayaran",
        sortable: true,
        render: (pengeluaran: any) => <>{pengeluaran.metode_pembayaran}</>,
      },
      {
        name: "PENERIMA",
        uid: "penerima",
        sortable: true,
        render: (pengeluaran: any) => <>{pengeluaran.penerima}</>,
      },
      {
        name: "KETERANGAN",
        uid: "keterangan",
        sortable: false,
        render: (pengeluaran: any) => <>{pengeluaran.keterangan}</>,
      },
      {
        name: "ACTIONS",
        uid: "action",
        sortable: false,
        render: (pengeluaran: any) => (
          <div style={{ display: "flex", gap: 8 }}>
            <AddEditPengeluaranForm
              initialData={pengeluaran}
              buttonLabel={<Edit size={16} />}
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Delete ${pengeluaran.id}`}
              onClick={() => handleDelete(pengeluaran)}
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
          <ShoppingCartIcon />
          <CrumbLink href="#">Pengeluaran</CrumbLink>
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
        <Text h3>All Pengeluaran</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <AddEditPengeluaranForm />
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
        ariaLabel="Pengeluaran management table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};