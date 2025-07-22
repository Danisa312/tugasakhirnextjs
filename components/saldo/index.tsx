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
import { usePendapatanStore } from "../../stores/pendapatanStore";
import { usePengeluaranStore } from "../../stores/pengeluaranStore";

function formatRupiah(num: number) {
  const n = Number(num);
  if (isNaN(n)) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

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
    addOne,
  } = useSaldoStore();

  const pendapatanStore = usePendapatanStore();
  const pengeluaranStore = usePengeluaranStore();

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

  const handleGenerateSaldoOtomatis = async () => {
    try {
      // Ambil semua data pendapatan dan pengeluaran
      await pendapatanStore.loadAll(1, 1000); // Load semua data pendapatan
      await pengeluaranStore.loadAll(1, 1000); // Load semua data pengeluaran

      // Gabungkan semua tanggal yang ada di pendapatan dan pengeluaran
      const allDates = new Set<string>();
      
      // Tambahkan tanggal dari pendapatan
      pendapatanStore.data.forEach(item => {
        if (item.tanggal) {
          allDates.add(item.tanggal);
        }
      });
      
      // Tambahkan tanggal dari pengeluaran
      pengeluaranStore.data.forEach(item => {
        if (item.tanggal) {
          allDates.add(item.tanggal);
        }
      });

      // Urutkan tanggal
      const sortedDates = Array.from(allDates).sort();

      let saldoAwal = 0; // Saldo awal untuk hari pertama
      let createdCount = 0;

      for (const tanggal of sortedDates) {
        // Format tanggal ke YYYY-MM-DD
        let tgl = tanggal;
        if (tgl.includes('T')) {
          tgl = tgl.split('T')[0];
        }

        // Hitung total pendapatan untuk tanggal ini
        const totalPendapatan = pendapatanStore.data
          .filter(item => (item.tanggal && item.tanggal.split('T')[0]) === tgl)
          .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

        // Hitung total pengeluaran untuk tanggal ini
        const totalPengeluaran = pengeluaranStore.data
          .filter(item => (item.tanggal && item.tanggal.split('T')[0]) === tgl)
          .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

        // Hitung saldo akhir
        const saldoAwalSafe = Number(saldoAwal) || 0;
        const totalPendapatanSafe = Number(totalPendapatan) || 0;
        const totalPengeluaranSafe = Number(totalPengeluaran) || 0;
        const saldoAkhir = saldoAwalSafe + totalPendapatanSafe - totalPengeluaranSafe;

        // Cek apakah sudah ada saldo untuk tanggal ini
        const existingSaldo = data.find(item => {
          if (!item.tanggal) return false;
          const existingDate = item.tanggal.includes('T') ? item.tanggal.split('T')[0] : item.tanggal;
          return existingDate === tgl;
        });
        
        if (!existingSaldo) {
          // Validasi sebelum POST
          if (!tgl || isNaN(saldoAwalSafe) || isNaN(totalPendapatanSafe) || isNaN(totalPengeluaranSafe) || isNaN(saldoAkhir)) {
            continue;
          }
          // Buat saldo baru
          await addOne({
            tanggal: tgl,
            saldo_awal: saldoAwalSafe,
            total_pendapatan: totalPendapatanSafe,
            total_pengeluaran: totalPengeluaranSafe,
            saldo_akhir: saldoAkhir,
          });
          createdCount++;
        }

        // Update saldo awal untuk hari berikutnya
        saldoAwal = Math.max(saldoAkhir, 0);
      }

      // Reload data saldo
      await loadAll(page, limit);
      
      if (createdCount > 0) {
        showToast(`Berhasil membuat ${createdCount} entri saldo otomatis`, "success");
      } else {
        showToast("Tidak ada entri saldo baru yang dibuat", "success");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal membuat saldo otomatis";
      showToast(message, "error");
    }
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
        render: (saldo: any) => <>{formatRupiah(saldo.saldo_awal)}</>,
      },
      {
        name: "TOTAL PENDAPATAN",
        uid: "total_pendapatan",
        sortable: false,
        render: (saldo: any) => <>{formatRupiah(saldo.total_pendapatan)}</>,
      },
      {
        name: "TOTAL PENGELUARAN",
        uid: "total_pengeluaran",
        sortable: false,
        render: (saldo: any) => <>{formatRupiah(saldo.total_pengeluaran)}</>,
      },
      {
        name: "SALDO AKHIR",
        uid: "saldo_akhir",
        sortable: false,
        render: (saldo: any) => <>{formatRupiah(saldo.saldo_akhir)}</>,
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
          <Button 
            auto 
            color="secondary" 
            onClick={handleGenerateSaldoOtomatis}
            disabled={loading}
            css={{ background: '#b91c1c', color: '#fff', fontWeight: 600 }}
          >
            Generate Saldo Otomatis
          </Button>
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