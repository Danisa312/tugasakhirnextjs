// components/Content.tsx
import React, { useEffect, useState } from 'react';
import { Container, Text, Card, Button } from '@nextui-org/react';
import Link from 'next/link';
import { Flex } from '../styles/flex';
import { fetchAllSaldo } from '../../services/saldoService';
import pendapatanServis from '../../services/pendapatanServis';
import pengeluaranService from '../../services/pengeluaranService';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
const DonutChart = dynamic(() => import('react-apexcharts'), { ssr: false });

function formatRupiah(num: number) {
  const n = Number(num);
  if (isNaN(n)) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function Content() {
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [showSaldo, setShowSaldo] = useState(false);
  const [chartSeries, setChartSeries] = useState<Array<{ name: string; data: number[] }>>([
    { name: 'Pendapatan', data: [] },
    { name: 'Pengeluaran', data: [] },
  ]);
  const [chartCategories, setChartCategories] = useState<string[]>([]);
  const [donutSeries, setDonutSeries] = useState<number[]>([0, 0]);
  const [donutLabels, setDonutLabels] = useState<string[]>(['Pendapatan', 'Pengeluaran']);
  const [saldoError, setSaldoError] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const chartOptions = {
    chart: {
      type: 'area' as const,
      height: 320,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      foreColor: '#222',
    },
    colors: ['#b91c1c', '#f87171'],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as "smooth", width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    xaxis: {
      categories: chartCategories,
      labels: { style: { fontSize: '12px' } },
    },
    yaxis: {
      labels: { style: { fontSize: '12px' } },
    },
    legend: {
      show: true,
      position: "top" as "top", 
      fontSize: '13px',
      markers: { width: 12, height: 12, radius: 12 },
    },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
    tooltip: { enabled: true },
  };

  const donutOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: donutLabels,
    colors: ['#b91c1c', '#f87171'],
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '13px',
      markers: { width: 16, height: 16, radius: 8 },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { enabled: true },
  };

  useEffect(() => {
    // Ambil role user dari localStorage
    let userRole = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userRole = userObj.role;
      }
    } catch {}

    if (userRole === 'direktur') {
      
      fetch('/api/dashboard-summary')
        .then(res => res.json())
        .then(data => {
          
          setTotalSaldo(data.totalSaldo || 0);
          setTotalPendapatan(data.totalPendapatan || 0);
          setTotalPengeluaran(data.totalPengeluaran || 0);
         
          setChartSeries([
            { name: 'Pendapatan', data: [] },
            { name: 'Pengeluaran', data: [] },
          ]);
          setChartCategories([]);
          setDonutSeries([0, 0]);
          setRecentTransactions([]);
        })
        .catch(() => {
          setTotalSaldo(0);
          setTotalPendapatan(0);
          setTotalPengeluaran(0);
          setChartSeries([
            { name: 'Pendapatan', data: [] },
            { name: 'Pengeluaran', data: [] },
          ]);
          setChartCategories([]);
          setDonutSeries([0, 0]);
          setRecentTransactions([]);
        });
      return;
    }
    // Saldo
    fetchAllSaldo({ page: 1, limit: 1000 })
      .then(res => {
        console.log('API Saldo Dashboard:', res);
        const arr = Array.isArray(res?.data) ? res.data : [];
        arr.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        const last = arr.length > 0 ? arr[0] : null;
        console.log('last saldo_akhir:', last?.saldo_akhir, 'as number:', Number(last?.saldo_akhir));
        setTotalSaldo(parseFloat(String(last?.saldo_akhir).replace(/,/g, '')) || 0);
        setSaldoError('');
      })
      .catch(err => {
        setTotalSaldo(0);
        setSaldoError(err.message || 'Gagal mengambil data saldo');
      });
    // Pendapatan & Pengeluaran untuk chart (PER HARI)
    Promise.all([
      pendapatanServis.loadAll(1, 1000),
      pengeluaranService.loadAll(1, 1000)
    ]).then(([pendapatanData, pengeluaranRes]) => {
      const pengeluaranData = pengeluaranRes.items;
      // Gabungkan semua bulan-tahun dari kedua sumber
      const allDates = [
        ...pendapatanData.map((x: any) => x.tanggal),
        ...pengeluaranData.map((x: any) => x.tanggal),
      ];
      // Format: 'Jan 2024'
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const getMonthYear = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      };
      // Dapatkan semua bulan unik, urutkan
      const uniqueMonths = Array.from(new Set(allDates.map(getMonthYear)));
      uniqueMonths.sort((a, b) => {
        const [ma, ya] = a.split(' '); const [mb, yb] = b.split(' ');
        return new Date(`${ya}-${monthNames.indexOf(ma)+1}-01`).getTime() - new Date(`${yb}-${monthNames.indexOf(mb)+1}-01`).getTime();
      });
      setChartCategories(uniqueMonths);
      // Hitung total pendapatan dan pengeluaran per bulan
      const pendapatanPerBulan: number[] = uniqueMonths.map(m =>
        pendapatanData.filter((x: any) => getMonthYear(x.tanggal) === m)
          .reduce((a: number, b: any) => a + Number(b.jumlah || 0), 0)
      );
      const pengeluaranPerBulan: number[] = uniqueMonths.map(m =>
        pengeluaranData.filter((x: any) => getMonthYear(x.tanggal) === m)
          .reduce((a: number, b: any) => a + Number(b.jumlah || 0), 0)
      );
      setChartSeries([
        { name: 'Pendapatan', data: pendapatanPerBulan },
        { name: 'Pengeluaran', data: pengeluaranPerBulan },
      ]);
      // Untuk donut chart: total pendapatan dan pengeluaran per HARI INI
      const todayStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
      const totalPendapatanHari = pendapatanData.filter((x: any) => x.tanggal && x.tanggal.slice(0, 10) === todayStr)
        .reduce((a: number, b: any) => a + Number(b.jumlah || 0), 0);
      const totalPengeluaranHari = pengeluaranData.filter((x: any) => x.tanggal && x.tanggal.slice(0, 10) === todayStr)
        .reduce((a: number, b: any) => a + Number(b.jumlah || 0), 0);
      setDonutSeries([totalPendapatanHari, totalPengeluaranHari]);
      // Ambil transaksi terbaru dari pendapatan & pengeluaran
      const pendapatanList = pendapatanData.map((x: any) => ({
        ...x,
        type: 'Pendapatan',
      }));
      const pengeluaranList = pengeluaranRes.items.map((x: any) => ({
        ...x,
        type: 'Pengeluaran',
      }));
      const allTrans = [...pendapatanList, ...pengeluaranList];
      allTrans.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      setRecentTransactions(allTrans.slice(0, 7)); // tampilkan 7 transaksi terbaru
    });
    // Pendapatan
    pendapatanServis.loadAll(1, 1000).then(data => {
      const bulanIni = data.filter((x: any) => isThisMonth(x.tanggal));
      setTotalPendapatan(bulanIni.reduce((a: number, b: any) => a + Number(b.jumlah || 0), 0));
    });
    // Pengeluaran
    pengeluaranService.loadAll(1, 1000).then(res => {
      const bulanIni = res.items.filter((x: any) => isThisMonth(x.tanggal));
      setTotalPengeluaran(bulanIni.reduce((a: number, b: any) => a + Number(b.jumlah || 0), 0));
    });
  }, []);

  return (
    <Container css={{ textAlign: 'center', padding: '2rem', background: '#f6fbff', minWidth: '100vw', maxWidth: '100vw' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 24,
        marginTop: 8
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 2px 12px rgba(185,28,28,0.08)',
          borderRadius: 14,
          padding: '18px 32px',
          color: '#b91c1c',
          fontWeight: 700,
          fontSize: 22,
          textAlign: 'center',
          letterSpacing: 1,
          border: '1.5px solid #fca5a5',
          minWidth: 320
        }}>
          Selamat Datang di Dashboard Keuangan CV. Lantana Jaya Digital
        </div>
      </div>
      <Flex css={{ gap: '2rem', mt: '2rem', justifyContent: 'center' }}>
        {/* Kartu Saldo */}
        <Link href="/saldo" style={{ textDecoration: 'none', flex: 1.5, minWidth: 0 }}>
          <Card
            isHoverable
            css={{
              minWidth: '420px',
              maxWidth: '520px',
              minHeight: '80px',
              background: 'linear-gradient(135deg, #b91c1c 0%, #660000 100%)',
              borderRadius: '18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              color: 'white',
              p: '0.5rem 1rem 0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Total Saldo Aktif</div>
              <button
                type="button"
                onClick={e => { e.preventDefault(); setShowSaldo(v => !v); }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, padding: '2px 10px', cursor: 'pointer' }}
                tabIndex={-1}
                aria-label={showSaldo ? 'Sembunyikan Saldo' : 'Lihat Saldo'}
              >
                {showSaldo ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '4px 0 4px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 22, margin: '4px 0 4px 0' }}>
                {showSaldo ? formatRupiah(totalSaldo) : '••••••'}
              </div>
            </div>
            <div style={{ width: '100%', borderBottom: '1.5px solid #e3f0fa', margin: '8px 0 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 10 }}>

            </div>
            <div style={{ width: '100%', marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/saldo" passHref legacyBehavior>
                <Button auto flat as="a" css={{ background: '#b91c1c', color: '#fff', fontWeight: 600, borderRadius: 8, fontSize: 12, px: 12, py: 4, height: 28, minHeight: 0, boxShadow: '0 2px 8px rgba(185,28,28,0.10)' }}>
                  Detail
                </Button>
              </Link>
            </div>
          </Card>
        </Link>
        {/* Kartu Piutang */}
        <Link href="/pendapatan" style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <Card
            isHoverable
            css={{
              minWidth: '270px',
              maxWidth: '320px',
              minHeight: '80px',
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              color: '#222',
              p: '0.5rem 1rem 0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Total Pendapatan Bulan Ini
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, margin: '4px 0 4px 0' }}>{formatRupiah(totalPendapatan)}</div>
            <div style={{ width: '100%', borderBottom: '1.5px solid #e3f0fa', margin: '8px 0 0 0' }} />
            <div style={{ width: '100%', marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/pendapatan" passHref legacyBehavior>
                <Button auto flat as="a" css={{ background: '#b91c1c', color: '#fff', fontWeight: 600, borderRadius: 8, fontSize: 12, px: 12, py: 4, height: 28, minHeight: 0, boxShadow: '0 2px 8px rgba(185,28,28,0.10)' }}>
                  Detail
                </Button>
              </Link>
            </div>
          </Card>
        </Link>
        {/* Kartu Utang */}
        <Link href="/pengeluaran" style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <Card
            isHoverable
            css={{
              minWidth: '270px',
              maxWidth: '320px',
              minHeight: '80px',
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              color: '#222',
              p: '0.5rem 1rem 0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Total Pengeluaran Bulan Ini</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, margin: '4px 0 4px 0' }}>{formatRupiah(totalPengeluaran)}</div>
            <div style={{ width: '100%', borderBottom: '1.5px solid #e3f0fa', margin: '8px 0 0 0' }} />
            <div style={{ width: '100%', marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/pengeluaran" passHref legacyBehavior>
                <Button auto flat as="a" css={{ background: '#b91c1c', color: '#fff', fontWeight: 600, borderRadius: 8, fontSize: 12, px: 12, py: 4, height: 28, minHeight: 0, boxShadow: '0 2px 8px rgba(185,28,28,0.10)' }}>
                  Detail
                </Button>
              </Link>
            </div>
          </Card>
        </Link>
      </Flex>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center', margin: '32px auto', maxWidth: 1200 }}>
        <div style={{ flex: 2, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>Diagram Pendapatan & Pengeluaran per Bulan</div>
          <Chart options={chartOptions} series={chartSeries} type="area" height={320
          } />
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: 24, minWidth: 320 }}>
          <div style={{ fontWeight: 600, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>Komposisi Pendapatan & Pengeluaran per Hari</div>
          <DonutChart options={donutOptions} series={donutSeries} type="donut" height={320} />
        </div>
      </div>
      <div style={{ margin: '32px auto', maxWidth: 1200, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>Transaksi Terbaru</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f6fbff' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Jenis</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Deskripsi</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Pendapatan</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Pengeluaran</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>Belum ada transaksi</td></tr>
            )}
            {recentTransactions.map((trx, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, color: trx.type === 'Pendapatan' ? '#2563eb' : '#ef4444', fontWeight: 600 }}>{trx.type}</td>
                <td style={{ padding: 8 }}>{trx.keterangan || '-'}</td>
                <td style={{ padding: 8 }}>{trx.type === 'Pendapatan' ? formatRupiah(Number(trx.jumlah) || 0) : '-'}</td>
                <td style={{ padding: 8 }}>{trx.type === 'Pengeluaran' ? formatRupiah(Number(trx.jumlah) || 0) : '-'}</td>
                <td style={{ padding: 8 }}>{trx.tanggal ? new Date(trx.tanggal).toLocaleString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}