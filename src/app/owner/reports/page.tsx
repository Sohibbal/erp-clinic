'use client';

import { useState, useEffect } from 'react';
import { getGlobalReport } from '@/actions/dashboard';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function OwnerReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGlobalReport();
        setReportData(data);
      } catch (error) {
        toast.error('Gagal memuat laporan');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat laporan...</div>;
  }

  return (
    <div className="bg-white min-h-screen text-on-surface print:bg-white print:m-0 print:p-0">
      {/* Floating Action Button (Hidden on Print) */}
      <div className="fixed bottom-10 right-10 z-50 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          title="Simpan sebagai PDF"
        >
          <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out px-0 group-hover:px-2 font-bold">
            Simpan PDF
          </span>
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-[800px] mx-auto p-10 print:p-0 print:max-w-none print:w-full space-y-8">
        
        {/* Report Header */}
        <div className="border-b-4 border-primary pb-6 flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-[32px] font-bold text-primary tracking-wide mb-1" style={{ fontVariant: 'small-caps' }}>SUNRISE CLINIC</h1>
            <h2 className="font-headline-md text-on-surface-variant uppercase tracking-[0.2em] text-[14px]">Laporan Global Eksekutif</h2>
          </div>
          <div className="text-right">
            <p className="text-body-sm font-bold text-on-surface">Tanggal Laporan:</p>
            <p className="text-body-sm text-on-surface-variant">{currentDate}</p>
          </div>
        </div>

        {/* Section: Financials */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
            <h3 className="font-headline-md text-primary font-bold border-b border-primary/30 pb-1 flex-1">Ringkasan Finansial</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl">
              <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Total Pendapatan Terbayar</p>
              <p className="text-[28px] font-bold text-green-600 mt-1">{formatCurrency(reportData?.totalRevenue || 0)}</p>
              <p className="text-[12px] text-on-surface-variant mt-2">Dari {reportData?.paidCount || 0} transaksi berhasil</p>
            </div>
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl">
              <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Potensi Pendapatan (Tertunda)</p>
              <p className="text-[28px] font-bold text-orange-500 mt-1">{formatCurrency(reportData?.pendingRevenue || 0)}</p>
              <p className="text-[12px] text-on-surface-variant mt-2">Menunggu penyelesaian pembayaran</p>
            </div>
          </div>
        </section>

        {/* Section: Inventory */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">inventory_2</span>
            <h3 className="font-headline-md text-primary font-bold border-b border-primary/30 pb-1 flex-1">Ringkasan Inventaris (Apotek)</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center">
              <p className="text-[24px] font-bold text-on-surface">{formatCurrency(reportData?.totalAssetValue || 0)}</p>
              <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Total Nilai Aset</p>
            </div>
            <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center">
              <p className="text-[24px] font-bold text-on-surface">{reportData?.totalStockItems || 0} <span className="text-[14px] font-normal">Unit</span></p>
              <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Total Kuantitas Barang</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-[24px] font-bold text-red-600">{reportData?.outOfStock || 0} / {reportData?.lowStock || 0}</p>
              <p className="text-[10px] font-bold uppercase text-red-500 tracking-wider mt-1">Stok Habis / Menipis</p>
            </div>
          </div>
        </section>

        {/* Section: Operational */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">groups</span>
            <h3 className="font-headline-md text-primary font-bold border-b border-primary/30 pb-1 flex-1">Ringkasan Operasional</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">badge</span>
              </div>
              <div>
                <p className="text-[24px] font-bold text-on-surface leading-none">{reportData?.activeStaff || 0}</p>
                <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Staf Aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600">recent_patient</span>
              </div>
              <div>
                <p className="text-[24px] font-bold text-on-surface leading-none">{reportData?.totalPatients || 0}</p>
                <p className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider mt-1">Pasien Terdaftar</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-10 mt-10 border-t border-outline-variant/30 text-center print:pt-4 print:mt-auto">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.1em]">Laporan ini digenerate secara otomatis oleh Sistem ERP Sunrise Clinic.</p>
        </div>
      </div>
    </div>
  );
}
