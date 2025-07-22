import React, { useEffect, useMemo, useCallback, useState } from "react";
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [search, setSearch] = useState("");

  // Filter data sesuai pencarian
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      (item.sumber && item.sumber.toLowerCase().includes(search.toLowerCase())) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(search.toLowerCase())) ||
      (item.tanggal && item.tanggal.toLowerCase().includes(search.toLowerCase())) ||
      (item.jumlah && item.jumlah.toString().includes(search))
    );
  }, [data, search]);

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

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.text('Data Pendapatan', 14, 16);
    autoTable(doc, {
      head: [[
        'User', 'Tanggal', 'Sumber', 'Jumlah', 'Metode Pembayaran', 'Keterangan'
      ]],
      body: data.map((item: any) => [
        item.user?.name || '-',
        item.tanggal || '-',
        item.sumber || '-',
        item.jumlah || '-',
        item.metode_pembayaran || '-',
        item.keterangan || '-'
      ]),
      startY: 20,
    });
    doc.save('pendapatan.pdf');
  };

  function formatRupiah(num: number | string) {
    const n = Number(num);
    if (isNaN(n)) return '-';
    return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  }

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
        render: (pendapatan) => <>{formatRupiah(pendapatan.jumlah)}</>
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
      {/* Breadcrumb tetap di atas */}
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
      {/* Baris kedua: judul+show entries di kiri, search+tombol di kanan (seperti pengeluaran) */}
      <Flex css={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 0, mt: 0 }}>
        <Flex direction="row" align="center" css={{ gap: 16 }}>
          <Text h3 css={{ mb: 0, marginBottom: 0 }}>All Pendapatan</Text>
          {/* Komponen show entries dari TableWrapper akan otomatis berada di bawah ini jika TableWrapper mendukung slot/children, jika tidak, styling CSS pada .nextui-table-pagination-info agar naik ke atas */}
        </Flex>
        <Flex direction="column" align="end" css={{ gap: 6 }}>
          <Flex align="center" css={{ margin: 0 }}>
            <label htmlFor="search-pendapatan" style={{ marginRight: 8 }}>Search:</label>
            <input
              id="search-pendapatan"
              type="text"
              placeholder="Cari pendapatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: 5, width: 250 }}
            />
          </Flex>
          <Flex direction="row" css={{ gap: 16, marginTop: 6 }}>
            <AddEditPendapatanForm />
            <Button auto color="primary" onClick={handlePrintPDF} style={{ minWidth: 120, background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
              Cetak PDF
            </Button>
          </Flex>
        </Flex>
      </Flex>
      {/* ...judul, table, dst... */}
      <TableWrapper
        columns={columns}
        data={filteredData}
        loading={loading}
        totalItems={filteredData.length}
        onDataChange={handleLoadData}
        limitOptions={[5, 10, 15, 25]}
        defaultLimit={limit}
        defaultPage={page}
        defaultSortField="id"
        defaultSortDirection="asc"
        ariaLabel="Pendapatan table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};