'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { TRANSACTIONS, SERVICES, PRODUCTS, PATIENTS, type Transaction, type PaymentMethod, formatCurrency } from '../../../lib/mock-data';

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all'>('today');
  const [search, setSearch] = useState('');
  
  // Checkout Modal State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; qty: number }[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');

  const filtered = transactions
    .filter(t => dateFilter === 'all' || t.date === dateFilter)
    .filter(t =>
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.invoiceId.toLowerCase().includes(search.toLowerCase())
    );

  const todayTx = transactions.filter(t => t.date === 'today');
  const totalRevenue = todayTx.filter(t => t.status === 'Paid').reduce((s, t) => s + t.amount, 0);
  const totalTransactions = todayTx.length;
  const pendingCount = todayTx.filter(t => t.status === 'Pending').length;

  const handleOpenProcessModal = (id: string) => {
    setProcessingId(id);
    setCheckoutStep(1);
    setSelectedServiceId(SERVICES[0].id);
    setSelectedProducts([]);
    setSelectedMethod('Cash');
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.some(p => p.id === productId) 
        ? prev.filter(p => p.id !== productId)
        : [...prev, { id: productId, qty: 1 }]
    );
  };

  const calculateSubtotal = () => {
    const service = SERVICES.find(s => s.id === selectedServiceId);
    let total = service?.price || 0;
    
    selectedProducts.forEach(sp => {
      const p = PRODUCTS.find(prod => prod.id === sp.id);
      if (p) total += p.price * sp.qty;
    });
    return total;
  };

  const confirmPayment = () => {
    if (!processingId) return;
    
    const service = SERVICES.find(s => s.id === selectedServiceId);
    if (!service) return;

    let icon = 'payments';
    switch (selectedMethod) {
      case 'QRIS': icon = 'qr_code_2'; break;
      case 'Transfer': icon = 'account_balance'; break;
      case 'Cash': icon = 'payments'; break;
    }

    const finalProducts = selectedProducts.map(sp => {
      const p = PRODUCTS.find(prod => prod.id === sp.id)!;
      return { name: p.name, qty: sp.qty, price: p.price };
    });

    const finalAmount = calculateSubtotal();

    setTransactions(prev => prev.map(t => t.id === processingId ? { 
      ...t, 
      status: 'Paid' as const, 
      method: selectedMethod, 
      methodIcon: icon,
      service: service.name,
      products: finalProducts,
      amount: finalAmount
    } : t));
    
    toast.success('Pembayaran berhasil diproses!');
    setProcessingId(null);
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">receipt_long</span>
            Riwayat Transaksi
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Lihat dan lacak seluruh tagihan dan pembayaran harian.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden">
            {(['today', 'yesterday', 'all'] as const).map(f => (
              <button key={f} className={`px-4 py-2 font-label-md text-label-md transition-colors ${dateFilter === f ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} onClick={() => setDateFilter(f)}>
                {f === 'all' ? 'Semua' : f === 'today' ? 'Hari Ini' : 'Kemarin'}
              </button>
            ))}
          </div>
          <button className="bg-white border border-outline-variant px-4 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-high transition-colors shadow-sm" onClick={() => toast.success('Laporan berhasil diekspor!')}>
            <span className="material-symbols-outlined text-[18px]">download</span> Ekspor Laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl border-l-4 border-primary">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Pendapatan (Hari Ini)</p>
          <h3 className="font-headline-lg text-[32px] font-bold text-primary">{formatCurrency(totalRevenue)}</h3>
          <p className="font-body-sm text-[12px] text-secondary mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>+15% dari kemarin
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl border-l-4 border-secondary">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Jumlah Transaksi</p>
          <h3 className="font-headline-lg text-[32px] font-bold text-on-surface">{totalTransactions}</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>{pendingCount === 0 ? 'Semua pembayaran selesai' : `${pendingCount} tertunda`}
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl border-l-4 border-outline-variant">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Faktur Tertunda</p>
          <h3 className="font-headline-lg text-[32px] font-bold text-on-surface">{pendingCount}</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>Menunggu checkout pasien
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card ambient-shadow rounded-xl overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input type="text" placeholder="Cari ID faktur atau nama pasien..." className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-sm w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-primary-container/10 border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Waktu</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">ID Faktur</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nama Pasien</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Layanan & Produk</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Metode Bayar</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Jumlah</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Rekam Medis</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtered.map(t => (
              <tr key={t.id} className={`hover:bg-primary-container/5 transition-colors ${t.status === 'Pending' ? 'bg-surface-container-highest/20' : ''}`}>
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{t.time}</td>
                <td className="px-6 py-4 font-body-md font-bold text-primary">{t.invoiceId}</td>
                <td className="px-6 py-4 font-body-sm font-semibold text-on-surface">{t.patientName}</td>
                <td className="px-6 py-4">
                  <div className="font-body-md font-semibold text-on-surface">{t.service}</div>
                  {t.products && t.products.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {t.products.map((p, i) => (
                        <div key={i} className="text-[11px] text-on-surface-variant flex items-center gap-1 before:content-['•'] before:text-outline-variant">
                          {p.name} <span className="text-outline">x{p.qty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {t.method ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{t.methodIcon}</span>
                      <span className="font-body-sm text-on-surface-variant">{t.method}</span>
                    </div>
                  ) : <span className="font-body-sm text-on-surface-variant">-</span>}
                </td>
                <td className="px-6 py-4 font-body-md font-bold text-on-surface">{formatCurrency(t.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${t.status === 'Paid' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>{t.status === 'Paid' ? 'Lunas' : 'Tertunda'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/kasir/rekam-medis/${PATIENTS.find(p => p.name === t.patientName)?.noRM || 'RM-0001'}`} target="_blank" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary-container/30 transition-colors" title="Cetak Rekam Medis">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </Link>
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status === 'Paid' ? (
                    <Link href={`/kasir/billing/invoice/${t.id}`} className="p-2 inline-block hover:bg-primary-container/30 rounded-lg text-primary transition-all" title="Cetak Struk">
                      <span className="material-symbols-outlined text-[20px]">print</span>
                    </Link>
                  ) : (
                    <button className="px-3 py-1.5 bg-primary text-white font-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all" onClick={() => handleOpenProcessModal(t.id)}>Proses</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-8 text-center text-on-surface-variant">Tidak ada transaksi ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2-Step Payment Modal */}
      {processingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setProcessingId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-md text-headline-md text-primary">
                {checkoutStep === 1 ? 'Langkah 1: Detail Pembelian' : 'Langkah 2: Metode Pembayaran'}
              </h3>
              <button className="text-on-surface-variant hover:text-error transition-colors" onClick={() => setProcessingId(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {checkoutStep === 1 ? (
                <>
                  {/* Step 1: Services & Products */}
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Pilih Layanan Utama</label>
                    <select 
                      className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" 
                      value={selectedServiceId} 
                      onChange={e => setSelectedServiceId(e.target.value)}
                    >
                      {SERVICES.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Tambah Produk Skincare (Opsional)</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {PRODUCTS.map(p => {
                        const isSelected = selectedProducts.some(sp => sp.id === p.id);
                        return (
                          <label key={p.id} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary-container/10' : 'border-outline-variant/40 hover:bg-surface-container-low'}`}>
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleProduct(p.id)}
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                              />
                              <div>
                                <p className="font-body-md font-semibold text-on-surface">{p.name}</p>
                                <p className="text-[11px] text-on-surface-variant">{p.category}</p>
                              </div>
                            </div>
                            <span className="font-label-md text-primary">{formatCurrency(p.price)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                    <span className="font-label-lg text-on-surface-variant">Estimasi Total:</span>
                    <span className="font-headline-sm font-bold text-primary">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Payment Method */}
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-body-sm text-on-surface-variant">Total Tagihan</span>
                    </div>
                    <p className="font-headline-lg font-bold text-primary">{formatCurrency(calculateSubtotal())}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Pilih Metode Bayar</label>
                    {(['QRIS', 'Transfer', 'Cash'] as PaymentMethod[]).map(method => (
                      <label key={method} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedMethod === method ? 'border-primary bg-primary-container/10 shadow-sm' : 'border-outline-variant/40 hover:bg-surface-container-low'}`}>
                        <input type="radio" name="paymentMethod" value={method} checked={selectedMethod === method} onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)} className="text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                        <span className="font-label-md text-on-surface flex-1">{method}</span>
                        <span className="material-symbols-outlined text-on-surface-variant">{method === 'QRIS' ? 'qr_code_2' : method === 'Transfer' ? 'account_balance' : 'payments'}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest flex gap-3">
              {checkoutStep === 2 && (
                <button 
                  className="px-6 py-3.5 rounded-xl border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
                  onClick={() => setCheckoutStep(1)}
                >
                  Kembali
                </button>
              )}
              {checkoutStep === 1 ? (
                <button 
                  className="flex-1 bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95"
                  onClick={() => setCheckoutStep(2)}
                >
                  Lanjut ke Pembayaran
                </button>
              ) : (
                <button 
                  className="flex-1 bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  onClick={confirmPayment}
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Konfirmasi Pembayaran
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
