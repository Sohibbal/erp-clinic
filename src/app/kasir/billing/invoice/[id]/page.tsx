'use client';

import { TRANSACTIONS, formatCurrency } from '../../../../../lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const transaction = TRANSACTIONS.find(t => t.id === resolvedParams.id);
  
  if (!transaction) {
    return notFound();
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white min-h-screen text-on-surface print:bg-white print:m-0 print:p-0">
      {/* Floating Action Buttons (Hidden on Print) */}
      <div className="fixed bottom-10 right-10 z-50 print:hidden flex flex-col gap-4">
        <Link 
          href="/kasir/billing"
          className="bg-surface-container-high text-on-surface-variant p-4 rounded-full shadow-lg hover:bg-surface-container-highest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          title="Kembali"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <button 
          onClick={handlePrint}
          className="bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          title="Cetak Struk / Simpan PDF"
        >
          <span className="material-symbols-outlined text-[28px]">print</span>
        </button>
      </div>

      {/* A4/Receipt Document Container */}
      <div className="max-w-[600px] mx-auto p-10 print:p-0 print:max-w-none print:w-full space-y-8 font-mono">
        
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-outline-variant/50 pb-6">
          <h1 className="text-[28px] font-bold tracking-widest mb-1">SUNRISE CLINIC</h1>
          <p className="text-[12px] text-on-surface-variant">Jl. Boulevard Sunrise No. 88, Jakarta</p>
          <p className="text-[12px] text-on-surface-variant">Telp: (021) 1234-5678</p>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between text-[13px] pb-4 border-b-2 border-dashed border-outline-variant/50">
          <div>
            <p className="text-on-surface-variant">No. Faktur</p>
            <p className="font-bold">{transaction.invoiceId}</p>
            <p className="text-on-surface-variant mt-2">Waktu Transaksi</p>
            <p className="font-bold">{transaction.date === 'today' ? currentDate : transaction.date} • {transaction.time}</p>
          </div>
          <div className="text-right">
            <p className="text-on-surface-variant">Nama Pasien</p>
            <p className="font-bold">{transaction.patientName}</p>
            <p className="text-on-surface-variant mt-2">Metode Pembayaran</p>
            <p className="font-bold uppercase">{transaction.method || '-'}</p>
          </div>
        </div>

        {/* Rincian Transaksi */}
        <div>
          <h3 className="font-bold text-[14px] uppercase tracking-wider mb-4">Rincian Layanan & Produk</h3>
          <div className="space-y-4 text-[13px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{transaction.service}</p>
                <p className="text-[11px] text-on-surface-variant">Layanan Utama</p>
              </div>
            </div>

            {transaction.products && transaction.products.map((p, i) => (
              <div key={i} className="flex justify-between items-start pl-4 border-l-2 border-outline-variant/30">
                <div>
                  <p>{p.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{p.qty} x {formatCurrency(p.price)}</p>
                </div>
                <p>{formatCurrency(p.price * p.qty)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t-2 border-dashed border-outline-variant/50 flex justify-between items-center">
          <span className="font-bold text-[16px] uppercase tracking-widest">Total Lunas</span>
          <span className="font-bold text-[20px]">{formatCurrency(transaction.amount)}</span>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-[11px] text-on-surface-variant">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang/Produk yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        </div>
      </div>
    </div>
  );
}
