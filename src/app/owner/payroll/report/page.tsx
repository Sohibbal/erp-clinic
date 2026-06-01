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
  const employeeFilter = searchParams.get('employee') || 'All';
  const handlerNameFilter = searchParams.get('handlerName') || 'All';
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
    if (tx.status !== 'PAID') return false;

    const hasDoctorFee = tx.items.some((i: any) => Number(i.doctorFee || 0) > 0);
    const hasTherapistFee = tx.items.some((i: any) => Number(i.therapistFee || 0) > 0);
    
    if (employeeFilter === 'Dokter' && !hasDoctorFee) return false;
    if (employeeFilter === 'Terapis' && !hasTherapistFee) return false;
    if (employeeFilter === 'Dokter & Terapis' && (!hasDoctorFee || !hasTherapistFee)) return false;
    if (employeeFilter === 'All' && !hasDoctorFee && !hasTherapistFee) return false;

    const txTime = new Date(tx.createdAt).getTime();
    const matchedQueue = tx.patient?.queues?.reduce((closest: any, q: any) => {
      const qTime = new Date(q.createdAt).getTime();
      if (!closest || Math.abs(qTime - txTime) < Math.abs(new Date(closest.createdAt).getTime() - txTime)) {
        return q;
      }
      return closest;
    }, null);

    const doctorName = tx.medicalRecords?.[0]?.doctor?.name || matchedQueue?.doctor?.name;
    const therapistName = tx.medicalRecords?.[0]?.therapist?.name || matchedQueue?.therapist?.name;
    const handlers = [];
    if (doctorName) handlers.push(`Dr. ${doctorName.replace('Dr. ', '')}`);
    if (therapistName) handlers.push(therapistName);
    const handledBy = handlers.length > 0 ? handlers.join(' & ') : '-';

    if (handlerNameFilter !== 'All' && handledBy !== handlerNameFilter) return false;

    if (search && !(tx.patient?.name?.toLowerCase() || '').includes(search.toLowerCase()) && !tx.invoiceId.toLowerCase().includes(search.toLowerCase())) return false;
    
    const txDate = new Date(tx.createdAt);
    if (filterYear !== 'All' && String(txDate.getFullYear()) !== filterYear) return false;
    if (filterMonth !== 'All' && String(txDate.getMonth() + 1) !== filterMonth) return false;
    if (filterDay !== 'All' && String(txDate.getDate()) !== filterDay) return false;
    
    return true;
  });

  const totalDoctorFee = filtered.reduce((sum, tx) => {
    return sum + tx.items.reduce((itemSum: number, item: any) => itemSum + Number(item.doctorFee || 0), 0);
  }, 0);
  const totalTherapistFee = filtered.reduce((sum, tx) => {
    return sum + tx.items.reduce((itemSum: number, item: any) => itemSum + Number(item.therapistFee || 0), 0);
  }, 0);

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
          title="Cetak Laporan Penggajian"
        >
          <span className="material-symbols-outlined text-[28px]">print</span>
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-[1000px] mx-auto p-10 print:p-8 print:max-w-none print:w-full">
        
        {/* Header */}
        <div className="text-center font-bold pb-2 border-b-[2px] border-black mb-1 leading-tight">
          <h1 className="text-[20px] mb-1 text-black font-bold">Laporan Penggajian & Komisi Karyawan</h1>
          <p className="text-[14px] font-normal text-black">Praktik Dokter dr. Popi Novia</p>
          <p className="text-[12px] font-normal text-black mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="border-b-[1px] border-black mb-6"></div>

        {/* Filter Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <p><strong>Periode:</strong> {periodText}</p>
            <p><strong>Filter Karyawan:</strong> {employeeFilter === 'All' ? 'Semua' : employeeFilter}</p>
            {handlerNameFilter !== 'All' && <p><strong>Nama:</strong> {handlerNameFilter}</p>}
            {search && <p><strong>Pencarian:</strong> {search}</p>}
          </div>
          <div className="text-right">
            <p><strong>Total Transaksi:</strong> {filtered.length}</p>
            <p className="text-[14px] mt-2">Total Fee Dokter: {formatCurrency(totalDoctorFee)}</p>
            <p className="text-[14px]">Total Fee Terapis: {formatCurrency(totalTherapistFee)}</p>
            <p className="text-[16px] font-bold mt-1">Total Keseluruhan: {formatCurrency(totalDoctorFee + totalTherapistFee)}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse border border-black text-[12px]">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-100">
              <th className="border border-black p-2 w-[15%]">Waktu</th>
              <th className="border border-black p-2 w-[15%]">Faktur</th>
              <th className="border border-black p-2 w-[15%]">Pasien</th>
              <th className="border border-black p-2 w-[25%]">Layanan</th>
              <th className="border border-black p-2 w-[15%]">Ditangani Oleh</th>
              <th className="border border-black p-2 w-[10%] text-right text-blue-800">Fee Dokter</th>
              <th className="border border-black p-2 w-[10%] text-right text-purple-800">Fee Terapis</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, idx) => {
              const time = new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const servicesList = tx.items?.filter((i: any) => i.itemType === 'SERVICE') || [];

              const doctorName = tx.medicalRecords?.[0]?.doctor?.name || tx.patient?.queues?.[0]?.doctor?.name;
              const therapistName = tx.medicalRecords?.[0]?.therapist?.name || tx.patient?.queues?.[0]?.therapist?.name;
              const handlers = [];
              if (doctorName) handlers.push(`Dr. ${doctorName.replace('Dr. ', '')}`);
              if (therapistName) handlers.push(therapistName);
              const handledBy = handlers.length > 0 ? handlers.join(' & ') : '-';

              const totalDoctorFeeTx = tx.items.reduce((sum: number, i: any) => sum + Number(i.doctorFee || 0), 0);
              const totalTherapistFeeTx = tx.items.reduce((sum: number, i: any) => sum + Number(i.therapistFee || 0), 0);

              return (
                <tr key={tx.id}>
                  <td className="border border-black p-2 align-top">{time}</td>
                  <td className="border border-black p-2 align-top font-mono">{tx.invoiceId}</td>
                  <td className="border border-black p-2 align-top font-bold">{tx.patient?.name || 'Umum'}</td>
                  <td className="border border-black p-2 align-top">
                    <div>{servicesList.map((s: any) => s.service?.name || s.itemName).join(', ')}</div>
                  </td>
                  <td className="border border-black p-2 align-top">{handledBy}</td>
                  <td className="border border-black p-2 align-top text-right font-bold text-blue-800">{formatCurrency(totalDoctorFeeTx)}</td>
                  <td className="border border-black p-2 align-top text-right font-bold text-purple-800">{formatCurrency(totalTherapistFeeTx)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-black p-4 text-center italic">Tidak ada fee karyawan yang ditemukan pada periode ini.</td>
              </tr>
            )}
            {filtered.length > 0 && (
              <tr className="bg-gray-50 print:bg-gray-50">
                <td colSpan={5} className="border border-black p-2 text-right font-bold">TOTAL PENDAPATAN KOMISI:</td>
                <td className="border border-black p-2 text-right font-bold text-blue-800">{formatCurrency(totalDoctorFee)}</td>
                <td className="border border-black p-2 text-right font-bold text-purple-800">{formatCurrency(totalTherapistFee)}</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default function LaporanPenggajianPrintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat laporan...</div>}>
      <ReportContent />
    </Suspense>
  );
}
