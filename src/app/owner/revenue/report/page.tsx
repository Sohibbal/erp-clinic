'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTransactions } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';

function ReportContent() {
  const searchParams = useSearchParams();
  const filterYear = searchParams.get('year') || 'All';
  const filterMonth = searchParams.get('month') || 'All';
  const filterDay = searchParams.get('day') || 'All';
  const methodFilter = searchParams.get('method') || 'All';
  const statusFilter = searchParams.get('status') || 'All';
  const search = searchParams.get('search') || '';

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Gagal memuat data transaksi', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = transactions.filter(tx => {
    if (methodFilter !== 'All' && tx.paymentMethod !== methodFilter) return false;
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;
    if (search && !(tx.patient?.name?.toLowerCase() || '').includes(search.toLowerCase()) && !tx.invoiceId.toLowerCase().includes(search.toLowerCase())) return false;
    
    const txDate = new Date(tx.createdAt);
    if (filterYear !== 'All' && String(txDate.getFullYear()) !== filterYear) return false;
    if (filterMonth !== 'All' && String(txDate.getMonth() + 1) !== filterMonth) return false;
    if (filterDay !== 'All' && String(txDate.getDate()) !== filterDay) return false;
    
    return true;
  });

  const totalRevenue = filtered.reduce((sum, tx) => tx.status === 'PAID' ? sum + Number(tx.totalAmount) : sum, 0);
  const paidCount = filtered.filter(tx => tx.status === 'PAID').length;
  const pendingCount = filtered.filter(tx => tx.status === 'PENDING').length;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-black">Memuat data laporan...</div>;
  }

  // Formatting filter description
  let periodText = 'Seluruh Waktu';
  if (filterYear !== 'All' || filterMonth !== 'All' || filterDay !== 'All') {
    const parts = [];
    if (filterDay !== 'All') parts.push(`Tgl ${filterDay}`);
    if (filterMonth !== 'All') parts.push(`Bulan ${filterMonth}`);
    if (filterYear !== 'All') parts.push(`Tahun ${filterYear}`);
    periodText = parts.join(' ');
  }

  return (
    <div className="min-h-screen bg-white text-black print:bg-white print:m-0 print:p-0 font-sans" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' } as React.CSSProperties}>
      
      {/* Print Button (Hidden on Print) */}
      <div className="fixed bottom-10 right-10 z-50 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-black text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          title="Cetak Laporan Keuangan"
        >
          <span className="material-symbols-outlined text-[28px]">print</span>
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-[1000px] mx-auto p-10 print:p-8 print:max-w-none print:w-full">
        
        {/* Header */}
        <div className="text-center font-bold pb-2 border-b-[2px] border-black mb-1 leading-tight">
          <h1 className="text-[20px] mb-1 text-black font-bold">Laporan Keuangan & Transaksi</h1>
          <p className="text-[14px] font-normal text-black">Praktik Dokter dr. Popi Novia</p>
          <p className="text-[12px] font-normal text-black mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="border-b-[1px] border-black mb-6"></div>

        {/* Filter Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <p><strong>Periode:</strong> {periodText}</p>
            <p><strong>Metode Pembayaran:</strong> {methodFilter === 'All' ? 'Semua' : methodFilter}</p>
            <p><strong>Status Transaksi:</strong> {statusFilter === 'All' ? 'Semua' : statusFilter}</p>
            {search && <p><strong>Pencarian:</strong> {search}</p>}
          </div>
          <div className="text-right">
            <p><strong>Total Transaksi Selesai:</strong> {paidCount}</p>
            <p><strong>Total Transaksi Tertunda:</strong> {pendingCount}</p>
            <p className="text-[16px] font-bold mt-2">Total Pendapatan: {formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse border border-black text-[12px]">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-100">
              <th className="border border-black p-2 w-[15%]">Waktu</th>
              <th className="border border-black p-2 w-[10%]">Faktur</th>
              <th className="border border-black p-2 w-[15%]">Pasien</th>
              <th className="border border-black p-2 w-[20%]">Layanan & Produk</th>
              <th className="border border-black p-2 w-[15%]">Ditangani Oleh</th>
              <th className="border border-black p-2 w-[10%]">Metode</th>
              <th className="border border-black p-2 w-[5%] text-right">Status</th>
              <th className="border border-black p-2 w-[10%] text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, idx) => {
              const time = new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const servicesList = tx.items?.filter((i: any) => i.itemType === 'SERVICE') || [];
              const productsList = tx.items?.filter((i: any) => i.itemType === 'PRODUCT') || [];

              const doctorName = tx.patient?.queues?.[0]?.doctor?.name;
              const therapistName = tx.patient?.queues?.[0]?.therapist?.name;
              const handledBy = doctorName || therapistName || (tx.cashier?.email ? tx.cashier.email.split('@')[0] : 'Umum');

              return (
                <tr key={tx.id}>
                  <td className="border border-black p-2 align-top">{time}</td>
                  <td className="border border-black p-2 align-top font-mono">{tx.invoiceId}</td>
                  <td className="border border-black p-2 align-top font-bold">{tx.patient?.name || 'Umum'}</td>
                  <td className="border border-black p-2 align-top">
                    <div>{servicesList.length > 0 ? servicesList.map((s: any) => s.service?.name || s.itemName).join(', ') : 'Produk Saja'}</div>
                    {productsList.length > 0 && (
                      <div className="text-[10px] mt-1 text-gray-700">
                        {productsList.map((p: any, i: number) => (
                          <div key={i}>• {p.product?.name || p.itemName} x{p.quantity}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="border border-black p-2 align-top">{handledBy}</td>
                  <td className="border border-black p-2 align-top">{tx.paymentMethod || '-'}</td>
                  <td className="border border-black p-2 align-top text-right font-bold">{tx.status === 'PAID' ? 'LUNAS' : 'TERTUNDA'}</td>
                  <td className="border border-black p-2 align-top text-right font-bold">{formatCurrency(Number(tx.totalAmount || 0))}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="border border-black p-4 text-center italic">Tidak ada transaksi ditemukan pada periode ini.</td>
              </tr>
            )}
            {filtered.length > 0 && (
              <tr>
                <td colSpan={7} className="border border-black p-2 text-right font-bold">TOTAL PENDAPATAN LUNAS:</td>
                <td className="border border-black p-2 text-right font-bold">{formatCurrency(totalRevenue)}</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default function LaporanKeuanganPrintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat laporan...</div>}>
      <ReportContent />
    </Suspense>
  );
}
