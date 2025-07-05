// @/components/laporan_bulanan/index.tsx
import React, { useEffect, useMemo, useCallback } from "react";
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditLaporanBulananForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, HouseIcon, ShoppingCartIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { useLaporanBulananStore } from "../../stores/laporanBulananStore";

export const LaporanBulanans = () => {
  const {
    data,
    loading,
    error,
    totalData,
    page,
    limit,
    loadAll,
    deleteOne,
  } = useLaporanBulananStore();
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

  const handleDelete = (laporan: any) => {
    showConfirmationToast(
      `Are you sure you want to delete report "${laporan.id}"? This action cannot be undone.`,
      "error",
      {
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        onConfirm: async () => {
          await deleteOne(laporan.id);
          showToast("Success delete report", "success");
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
        render: (laporan: any) => <>{laporan.id}</>,
      },
      {
        name: "BULAN",
        uid: "bulan",
        sortable: true,
        render: (laporan: any) => {
          const bulanNames = [
            '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ];
          return <>{bulanNames[laporan.bulan]}</>;
        },
      },
      {
        name: "TAHUN",
        uid: "tahun",
        sortable: true,
        render: (laporan: any) => <>{laporan.tahun}</>,
      },
      {
        name: "TOTAL PENDAPATAN",
        uid: "total_pendapatan",
        sortable: true,
        render: (laporan: any) => <>{laporan.total_pendapatan}</>,
      },
      {
        name: "TOTAL PENGELUARAN",
        uid: "total_pengeluaran",
        sortable: true,
        render: (laporan: any) => <>{laporan.total_pengeluaran}</>,
      },
      {
        name: "SALDO AKHIR",
        uid: "saldo_akhir",
        sortable: true,
        render: (laporan: any) => <>{laporan.saldo_akhir}</>,
      },
      {
        name: "CATATAN",
        uid: "catatan",
        sortable: false,
        render: (laporan: any) => <>{laporan.catatan}</>,
      },
      {
        name: "ACTION",
        uid: "action",
        sortable: false,
        render: (laporan: any) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <AddEditLaporanBulananForm
              initialData={laporan}
              buttonLabel={<Edit size={16} />}
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Delete ${laporan.id}`}
              onClick={() => handleDelete(laporan)}
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
          <CrumbLink href="#">Reports</CrumbLink>
          <Text>/</Text>
        </Crumb>
        <Crumb>
          <CrumbLink href="#">Laporan Bulanan</CrumbLink>
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
        <Text h3>Laporan Bulanan</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <AddEditLaporanBulananForm />
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
        ariaLabel="Monthly reports management table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};