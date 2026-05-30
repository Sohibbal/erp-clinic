'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getTransactionById } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const data = await getTransactionById(resolvedParams.id);
        if (!data) {
          toast.error('Invoice tidak ditemukan');
        }
        setTransaction(data);
      } catch (error) {
        toast.error('Gagal memuat invoice');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [resolvedParams.id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat invoice...</div>;
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Invoice tidak ditemukan.</p>
        <Link href="/kasir/billing" className="text-primary underline">Kembali</Link>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const txDate = new Date(transaction.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const txTime = new Date(transaction.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const txTimestamp = new Date(transaction.createdAt).getTime();
  const matchedQueue = transaction.patient?.queues?.reduce((closest: any, q: any) => {
    const qTime = new Date(q.createdAt).getTime();
    if (!closest || Math.abs(qTime - txTimestamp) < Math.abs(new Date(closest.createdAt).getTime() - txTimestamp)) {
      return q;
    }
    return closest;
  }, null);

  const doctorName = transaction.medicalRecords?.[0]?.doctor?.name || matchedQueue?.doctor?.name;
  const therapistName = matchedQueue?.therapist?.name;
  const handlers = [];
  if (doctorName) handlers.push(`Dr. ${doctorName.replace('Dr. ', '')}`);
  if (therapistName) handlers.push(therapistName);
  const handledBy = handlers.length > 0 ? handlers.join(' & ') : '-';

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
          <p className="text-[12px] text-on-surface-variant">Jl. Sei Rumbai, Kota Lama, Kunto Darussalam, Rokan Hulu, Riau</p>
          <p className="text-[12px] text-on-surface-variant">Telp: 082364381302</p>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between text-[13px] pb-4 border-b-2 border-dashed border-outline-variant/50">
          <div>
            <p className="text-on-surface-variant">No. Faktur</p>
            <p className="font-bold">{transaction.invoiceId}</p>
            <p className="text-on-surface-variant mt-2">Waktu Transaksi</p>
            <p className="font-bold">{txDate} • {txTime}</p>
          </div>
          <div className="text-right">
            <p className="text-on-surface-variant">Nama Pasien</p>
            <p className="font-bold">{transaction.patient?.name || 'Retail / Non-Pasien'}</p>
            <p className="text-on-surface-variant mt-2">Metode Pembayaran</p>
            <p className="font-bold uppercase">{transaction.paymentMethod || '-'}</p>
            {handledBy !== '-' && (
              <>
                <p className="text-on-surface-variant mt-2">Ditangani Oleh</p>
                <p className="font-bold">{handledBy}</p>
              </>
            )}
          </div>
        </div>

        {/* Rincian Transaksi */}
        <div>
          <h3 className="font-bold text-[14px] uppercase tracking-wider mb-4">Rincian Layanan & Produk</h3>
          <div className="space-y-4 text-[13px]">
            {transaction.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start pl-4 border-l-2 border-outline-variant/30">
                <div>
                  <p className="font-bold">{item.itemName}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {item.itemType === 'SERVICE' ? 'Layanan Utama' : 'Produk'} • {item.quantity} x {formatCurrency(Number(item.unitPrice))}
                  </p>
                </div>
                <p>{formatCurrency(Number(item.subtotal))}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t-2 border-dashed border-outline-variant/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] text-on-surface-variant">Subtotal</span>
            <span>{formatCurrency(Number(transaction.subtotal))}</span>
          </div>
          {Number(transaction.discountAmount) > 0 && (
            <div className="flex justify-between items-center mb-2 text-green-600">
              <span className="text-[14px]">Diskon</span>
              <span>-{formatCurrency(Number(transaction.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/30">
            <span className="font-bold text-[16px] uppercase tracking-widest">Total Lunas</span>
            <span className="font-bold text-[20px]">{formatCurrency(Number(transaction.totalAmount))}</span>
          </div>
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
