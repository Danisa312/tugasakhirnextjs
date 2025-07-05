// /components/saldo/index.tsx
import React from "react";
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditSaldoForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2 } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { useSaldoStore } from "../../stores/saldoStore";

export const Saldo: React.FC = () => {
  const {
    data,
    loading,
    error,
    totalData,
    page,
    limit,
    loadAll,
    deleteOne,
  } = useSaldoStore();

  const { showToast } = useToast();
  const { showToast: showConfirmationToast } = useConfirmationToast();

  const handleLoadData = React.useCallback(
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

  const handleDelete = (saldo: any) => {
    showConfirmationToast(
      `Apakah Anda yakin ingin menghapus saldo "${saldo.tanggal}"?`,
      "error",
      {
        confirmLabel: "Hapus",
        cancelLabel: "Batal",
        onConfirm: async () => {
          try {
            await deleteOne(saldo.id);
            showToast("Saldo berhasil dihapus", "success");
          } catch (err: any) {
            showToast(
              err.response?.data?.message || "Gagal menghapus saldo",
              "error"
            );
          }
        },
        onCancel: () => {
          console.log("Penghapusan dibatalkan");
        },
      }
    );
  };

  const columns: Column[] = React.useMemo(
    () => [
      {
        name: "ID",
        uid: "id",
        sortable: true,
        render: (saldo: any) => <>{saldo.id}</>,
      },
      {
        name: "TANGGAL",
        uid: "tanggal",
        sortable: true,
        render: (saldo: any) => <>{saldo.tanggal}</>,
      },
      {
        name: "SALDO AWAL",
        uid: "saldo_awal",
        sortable: false,
        render: (saldo: any) => <>{saldo.saldo_awal}</>,
      },
      {
        name: "TOTAL PENDAPATAN",
        uid: "total_pendapatan",
        sortable: false,
        render: (saldo: any) => <>{saldo.total_pendapatan}</>,
      },
      {
        name: "TOTAL PENGELUARAN",
        uid: "total_pengeluaran",
        sortable: false,
        render: (saldo: any) => <>{saldo.total_pengeluaran}</>,
      },
      {
        name: "SALDO AKHIR",
        uid: "saldo_akhir",
        sortable: false,
        render: (saldo: any) => <>{saldo.saldo_akhir}</>,
      },
      {
        name: "ACTIONS",
        uid: "action",
        sortable: false,
        render: (saldo: any) => (
          <div style={{ display: "flex", gap: 8 }}>
            <AddEditSaldoForm
              initialData={saldo}
              buttonLabel={<Edit size={16} />}
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Delete ${saldo.id}`}
              onClick={() => handleDelete(saldo)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  React.useEffect(() => {
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
          <Link href={"/"}>
            <CrumbLink href="#">Home</CrumbLink>
          </Link>
          <Text>/</Text>
        </Crumb>
        <Crumb>
          <CrumbLink href="#">Saldo</CrumbLink>
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
        <Text h3>Semua Data Saldo</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <AddEditSaldoForm />
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
        ariaLabel="Saldo table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};

export default Saldo;