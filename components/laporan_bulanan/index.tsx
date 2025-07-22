// @/components/laporan_bulanan/index.tsx
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { Button, Text } from "@nextui-org/react";
import Link from "next/link";
import { Flex } from "../styles/flex";
import { TableWrapper, type Column } from "../table/table";
import { useToast } from "../toast/ToastProvider";
import { useConfirmationToast } from "../toast/ConfirmationToast";
import { Edit, Trash2, HouseIcon, ShoppingCartIcon } from "lucide-react";
import { Breadcrumbs, Crumb, CrumbLink } from "../breadcrumb/breadcrumb.styled";
import { usePendapatanStore } from "../../stores/pendapatanStore";
import { usePengeluaranStore } from "../../stores/pengeluaranStore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fungsi untuk parsing tanggal lokal Indonesia (misal: '2 Juli 2025 pukul 07.00')
function parseTanggalIndo(str: string) {
  if (!str) return new Date('');
  // Contoh: '2 Juli 2025 pukul 07.00'
  const regex = /([0-9]{1,2})\s+([A-Za-z]+)\s+([0-9]{4})(?:\s+pukul\s+([0-9]{1,2})\.([0-9]{2}))?/i;
  const match = str.match(regex);
  if (!match) return new Date(str); // fallback ke Date biasa
  const hari = parseInt(match[1], 10);
  const bulanStr: string = match[2].toLowerCase();
  const tahun = parseInt(match[3], 10);
  const jam = match[4] ? parseInt(match[4], 10) : 0;
  const menit = match[5] ? parseInt(match[5], 10) : 0;
  const bulanMap: { [key: string]: number } = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
  };
  const bulan = bulanMap[bulanStr] ?? 0;
  return new Date(tahun, bulan, hari, jam, menit);
}

function formatRupiah(num: number) {
  const n = Number(num);
  if (isNaN(n)) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

// Format khusus untuk PDF: Rp.750.000,00
function formatRupiahPdf(num: number) {
  if (isNaN(Number(num))) return '-';
  return 'Rp.' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const LaporanBulanans = () => {
  const { showToast } = useToast();
  const { showToast: showConfirmationToast } = useConfirmationToast();

  // State untuk filter bulan & tahun
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Ambil data pemasukan dan pengeluaran
  const pendapatanStore = usePendapatanStore();
  const pengeluaranStore = usePengeluaranStore();

  // Gabungkan data pendapatan dan pengeluaran
  const combinedData = useMemo(() => {
    const pendapatanData = pendapatanStore.data.map((item: any) => ({
      ...item,
      jenis: 'Pendapatan',
      nominal: item.jumlah,
      tanggal_input: item.tanggal,
      metode_pembayaran: item.metode_pembayaran,
      keterangan: item.keterangan,
      originalType: 'pendapatan'
    }));

    const pengeluaranData = pengeluaranStore.data.map((item: any) => ({
      ...item,
      jenis: 'Pengeluaran',
      nominal: item.jumlah,
      tanggal_input: item.tanggal,
      metode_pembayaran: item.metode_pembayaran,
      keterangan: item.keterangan,
      originalType: 'pengeluaran'
    }));

    // Gabungkan dan urutkan berdasarkan tanggal ASCENDING (terlama di atas)
    const merged = [...pendapatanData, ...pengeluaranData]
      .sort((a, b) => new Date(a.tanggal_input).getTime() - new Date(b.tanggal_input).getTime());
    // Filter sesuai bulan & tahun
    const filtered = merged.filter(item => {
      // Gunakan parseTanggalIndo untuk parsing tanggal lokal
      const date = parseTanggalIndo(item.tanggal_input);
      return (
        date.getMonth() === selectedMonth - 1 &&
        date.getFullYear() === selectedYear
      );
    });
    // Tambahkan nomor urut
    return filtered.map((item, idx) => ({ ...item, no: idx + 1 }));
  }, [pendapatanStore.data, pengeluaranStore.data, selectedMonth, selectedYear]);

  const handleDelete = (item: any) => {
    const itemType = item.originalType === 'pendapatan' ? 'pendapatan' : 'pengeluaran';
    showConfirmationToast(
      `Are you sure you want to delete this ${itemType} record? This action cannot be undone.`,
      "error",
      {
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        onConfirm: async () => {
          if (item.originalType === 'pendapatan') {
            await pendapatanStore.deleteOne(item.id);
          } else {
            await pengeluaranStore.deleteOne(item.id);
          }
          showToast(`Success delete ${itemType}`, "success");
        },
        onCancel: () => {
          console.log("Penghapusan dibatalkan");
        },
      }
    );
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.text('Laporan Bulanan - Detail Transaksi', 14, 16);
    autoTable(doc, {
      head: [[
        'No', 'Jenis', 'Pendapatan', 'Pengeluaran', 'Tanggal Input', 'Metode Pembayaran', 'Keterangan'
      ]],
      body: combinedData.map((item: any, index: number) => [
        index + 1,
        item.jenis,
        item.jenis === 'Pendapatan' ? formatRupiahPdf(item.nominal) : '-',
        item.jenis === 'Pengeluaran' ? formatRupiahPdf(item.nominal) : '-',
        new Date(item.tanggal_input).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        item.metode_pembayaran || '-',
        item.keterangan || '-'
      ]),
      startY: 20,
    });
    doc.save('laporan_bulanan_detail.pdf');
  };

  const columns: Column[] = useMemo(
    () => [
      {
        name: "NO",
        uid: "no",
        sortable: false,
        render: (item: any) => <>{item.no}</>,
      },
      {
        name: "JENIS",
        uid: "jenis",
        sortable: true,
        render: (item: any) => (
          <Text>{item.jenis}</Text>
        ),
      },
      {
        name: "PENDAPATAN",
        uid: "pendapatan",
        sortable: false,
        render: (item: any) => (
          <Text>{item.jenis === 'Pendapatan' ? formatRupiah(item.nominal) : '-'}</Text>
        ),
      },
      {
        name: "PENGELUARAN",
        uid: "pengeluaran",
        sortable: false,
        render: (item: any) => (
          <Text>{item.jenis === 'Pengeluaran' ? formatRupiah(item.nominal) : '-'}</Text>
        ),
      },
      {
        name: "TANGGAL",
        uid: "tanggal_input",
        sortable: true,
        render: (item: any) => (
          <Text>
            {(() => {
              const date = parseTanggalIndo(item.tanggal_input);
              return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            })()}
          </Text>
        ),
      },
      {
        name: "METODE PEMBAYARAN",
        uid: "metode_pembayaran",
        sortable: true,
        render: (item: any) => <>{item.metode_pembayaran || '-'}</>,
      },
      {
        name: "KETERANGAN",
        uid: "keterangan",
        sortable: false,
        render: (item: any) => <>{item.keterangan || '-'}</>,
      },
      {
        name: "ACTION",
        uid: "action",
        sortable: false,
        render: (item: any) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              size="md"
              color="error"
              auto
              aria-label={`Delete ${item.id}`}
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
    // Load data when component mounts
    pendapatanStore.loadAll(1, 100);
    pengeluaranStore.loadAll(1, 100);
  }, []);

  useEffect(() => {
    if (pendapatanStore.error) {
      showToast(pendapatanStore.error, "error");
    }
    if (pengeluaranStore.error) {
      showToast(pengeluaranStore.error, "error");
    }
  }, [pendapatanStore.error, pengeluaranStore.error]);

  // Hitung total pemasukan, pengeluaran, dan saldo akhir
  const totalPemasukan = pendapatanStore.data.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  const totalPengeluaran = pengeluaranStore.data.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

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

      {/* Filter Bulan & Tahun */}
      <Flex css={{ gap: "$6", mb: "$8", mt: "$6" }} align="center">
        <label htmlFor="bulan">Bulan:</label>
        <select
          id="bulan"
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
        >
          {[
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ].map((bulan, idx) => (
            <option key={idx + 1} value={idx + 1}>{bulan}</option>
          ))}
        </select>
        <label htmlFor="tahun">Tahun:</label>
        <select
          id="tahun"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
        >
          {/* Tampilkan 5 tahun ke belakang dan 2 tahun ke depan */}
          {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 5 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </Flex>

      <Flex
        css={{
          gap: "$8",
        }}
        align={"center"}
        justify={"between"}
        wrap={"wrap"}
      >
        <Text h3>Laporan Bulanan - Detail Transaksi</Text>
        <Flex direction={"row"} css={{ gap: "$6" }} wrap={"wrap"}>
          <Button auto color="primary" onClick={handlePrintPDF} style={{ minWidth: 120, background: '#b91c1c', color: '#fff', fontWeight: 600 }}>
            Cetak PDF
          </Button>
        </Flex>
      </Flex>

      {/* Summary Cards removed as requested */}

      <TableWrapper
        columns={columns}
        data={combinedData}
        loading={pendapatanStore.loading || pengeluaranStore.loading}
        totalItems={combinedData.length}
        onDataChange={() => {}} // Disabled pagination for this view
        limitOptions={[10, 25, 50, 100]}
        defaultLimit={50}
        defaultPage={1}
        defaultSortField="tanggal_input"
        defaultSortDirection="asc"
        ariaLabel="Monthly reports detail table"
        showLimitSelector={true}
        showPagination={true}
        showSorting={true}
      />
    </Flex>
  );
};