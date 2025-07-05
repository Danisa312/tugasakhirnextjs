import React, { useEffect, useMemo, useCallback } from "react";
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditPendapatanForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, Eye, HouseIcon, ShoppingCartIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { usePendapatanStore } from "../../stores/pendapatanStore";

export const Pendapatan = () => {
  const {
    data,
    loading,
    error,
    totalData,
    page,
    limit,
    loadAll,
    deleteOne,
  } = usePendapatanStore();

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

  const handleDelete = (item: any) => {
    showConfirmationToast(
      `Are you sure you want to delete "${item.sumber}"? This action cannot be undone.`,
      "error",
      {
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        onConfirm: async () => {
          await deleteOne(item.id);
          showToast("Success delete pendapatan", "success");
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
        uid: "user.name",
        sortable: true,
        render: (pendapatan) => <>{pendapatan.user.name}</>
      },
      {
        name: "TANGGAL",
        uid: "tanggal",
        sortable: true,
        render: (pendapatan) => <>{pendapatan.tanggal}</>
      },
      {
        name: "SUMBER",
        uid: "sumber",
        sortable: true,
        render: (pendapatan) => <>{pendapatan.sumber}</>
      },
      {
        name: "JUMLAH",
        uid: "jumlah",
        sortable: true,
        render: (pendapatan) => <>{pendapatan.jumlah}</>
      },
      {
        name: "METODE PEMBAYARAN",
        uid: "metode_pembayaran",
        sortable: false,
        render: (pendapatan) => <>{pendapatan.metode_pembayaran}</>
      },
      {
        name: "KETERANGAN",
        uid: "keterangan",
        sortable: false,
        render: (pendapatan) => <>{pendapatan.keterangan}</>
      },
      {
        name: "ACTIONS",
        uid: "action",
        sortable: false,
        render: (item: any) => (
          <div style={{ display: "flex", gap: 8 }}>
            <AddEditPendapatanForm
              initialData={item}
              buttonLabel={<Edit size={16} />}
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Delete ${item.sumber}`}
              onClick={() => handleDelete(item)}
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
          <CrumbLink href="#">Pendapatan</CrumbLink>
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
        <Text h3>All Pendapatan</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <AddEditPendapatanForm />
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
        ariaLabel="Pendapatan management table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};