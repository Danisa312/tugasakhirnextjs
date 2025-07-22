// /components/pengeluaran/index.tsx
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import AddEditPengeluaranForm from "./AddEditForm";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, Eye, HouseIcon, ShoppingCartIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { usePengeluaranStore } from "../../stores/pengeluaranStore";
import { useKategoriPengeluaranStore } from '../../stores/kategoriPengeluaranStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SearchIcon } from "../icons/searchicon";

function formatRupiah(num: number) {
  const n = Number(num);
  if (isNaN(n)) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

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

  const kategoriStore = useKategoriPengeluaranStore();
  const kategoriMap = useMemo(() => {
    const map = new Map();
    kategoriStore.data.forEach((k) => {
      map.set(k.id, k.nama);
    });
    return map;
  }, [kategoriStore.data]);

  useEffect(() => {
    if (kategoriStore.data.length === 0) {
      kategoriStore.loadAll(1, 100);
    }
  }, []);

  const [search, setSearch] = useState("");
  // Hapus state showSearch dan tombol search icon

  // Filter data sesuai pencarian
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      (item.penerima && item.penerima.toLowerCase().includes(search.toLowerCase())) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(search.toLowerCase())) ||
      (item.tanggal && item.tanggal.toLowerCase().includes(search.toLowerCase())) ||
      (item.metode_pembayaran && item.metode_pembayaran.toLowerCase().includes(search.toLowerCase())) ||
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

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.text('Data Pengeluaran', 14, 16);
    autoTable(doc, {
      head: [[
        'User', 'Tanggal', 'Jumlah', 'Metode Pembayaran', 'Penerima', 'Keterangan'
      ]],
      body: data.map((item: any) => [
        item.user_id || '-',
        item.tanggal || '-',
        item.jumlah || '-',
        item.metode_pembayaran || '-',
        item.penerima || '-',
        item.keterangan || '-'
      ]),
      startY: 20,
    });
    doc.save('pengeluaran.pdf');
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
        render: (pengeluaran: any) => <>{formatRupiah(pengeluaran.jumlah)}</>,
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
        name: "KATEGORI PENGELUARAN",
        uid: "kategori_pengeluaran",
        sortable: false,
        render: (pengeluaran: any) => <>{kategoriMap.get(pengeluaran.kategori_id) || '-'}</>,
      },
      {
        name: "ACTIONS",
        uid: "action",
        sortable: false,
        render: (pengeluaran: any) => (
          <div style={{ display: "flex", gap: 8 }}>
            <AddEditPengeluaranForm
              initialData={pengeluaran}
              buttonLabel="Edit"
            />
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Delete ${pengeluaran.id}`}
              onClick={() => handleDelete(pengeluaran)}
              css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete, kategoriMap]
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
          <CrumbLink href="#">Pengeluaran</CrumbLink>
          <Text>/</Text>
        </Crumb>
        <Crumb>
          <CrumbLink href="#">List</CrumbLink>
        </Crumb>
      </Breadcrumbs>
      {/* Baris kedua: judul+show entries di kiri, search+tombol di kanan (seperti pendapatan) */}
      <Flex css={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 0, mt: 0 }}>
        <Flex direction="row" align="center" css={{ gap: 16 }}>
          <Text h3 css={{ mb: 0, marginBottom: 0 }}>All Pengeluaran</Text>
          {/* Komponen show entries dari TableWrapper akan otomatis berada di bawah ini jika TableWrapper mendukung slot/children, jika tidak, styling CSS pada .nextui-table-pagination-info agar naik ke atas */}
        </Flex>
        <Flex direction="column" align="end" css={{ gap: 6 }}>
          <Flex align="center" css={{ margin: 0 }}>
            <label htmlFor="search-pengeluaran" style={{ marginRight: 8 }}>Search:</label>
            <input
              id="search-pengeluaran"
              type="text"
              placeholder="Cari pengeluaran..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: 5, width: 250 }}
            />
          </Flex>
          <Flex direction="row" css={{ gap: 16, marginTop: 6 }}>
            <AddEditPengeluaranForm />
            <Button auto color="primary" onClick={handlePrintPDF} style={{ minWidth: 120, background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
              Cetak PDF
            </Button>
          </Flex>
        </Flex>
      </Flex>
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
        ariaLabel="Pengeluaran table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={false}
      />
    </Flex>
  );
};