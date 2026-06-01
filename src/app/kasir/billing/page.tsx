'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getTransactions, processPayment } from '@/actions/transaction';
import { getServices } from '@/actions/service';
import { getProducts } from '@/actions/product';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaymentMethod } from '@/generated/prisma/client';

export default function BillingPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all'>('today');
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  
  // Checkout Modal State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; qty: number }[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
  const [couponQty, setCouponQty] = useState(0);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [txData, servicesData, productsData] = await Promise.all([
          getTransactions(),
          getServices(),
          getProducts()
        ]);
        
        setTransactions(txData);
        setServices(servicesData);
        setProducts(productsData);
      } catch (error) {
        toast.error('Gagal memuat data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const filtered = transactions.filter(t => {
      const tDate = new Date(t.createdAt).toDateString();
      if (dateFilter === 'today') return tDate === todayStr;
      if (dateFilter === 'yesterday') return tDate === yesterdayStr;
      return true;
    }).filter(t => 
    t.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
    (t.patient?.name && t.patient.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const todayTx = transactions.filter(t => new Date(t.createdAt).toDateString() === todayStr);
  const totalRevenue = todayTx.filter(t => t.status === 'PAID').reduce((s, t) => s + Number(t.totalAmount), 0);
  const totalTransactions = todayTx.length;
  const pendingCount = todayTx.filter(t => t.status === 'PENDING').length;

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service && service.linkedProducts) {
      setSelectedProducts(service.linkedProducts.map((lp: any) => ({
        id: lp.productId,
        qty: lp.defaultQty || 1
      })));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleOpenProcessModal = (id: string) => {
    setProcessingId(id);
    setCheckoutStep(1);
    setCouponQty(0);
    const initialServiceId = services[0]?.id || '';
    handleServiceChange(initialServiceId);
    setSelectedMethod('CASH');
  };

  const toggleProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    setSelectedProducts(prev => 
      prev.some(p => p.id === productId) 
        ? prev.filter(p => p.id !== productId)
        : [...prev, { id: productId, qty: 1 }]
    );
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    const product = products.find(p => p.id === productId);
    if (!product || qty > product.stock) return;
    
    setSelectedProducts(prev => prev.map(p => p.id === productId ? { ...p, qty } : p));
  };

  const getServicePrice = (service: any) => {
    if (!service) return 0;
    const base = Number(service.basePrice || 0);
    if (service.promotions && service.promotions.length > 0) {
      const promo = service.promotions[0];
      if (promo.discountType === 'PERCENTAGE') {
        return base - (base * Number(promo.discountValue) / 100);
      } else {
        return Math.max(0, base - Number(promo.discountValue));
      }
    }
    return base;
  };

  const calculateSubtotal = () => {
    const service = services.find(s => s.id === selectedServiceId);
    const linkedProductIds = service?.linkedProducts?.map((lp: any) => lp.productId) || [];
    let total = getServicePrice(service);
    
    selectedProducts.forEach(sp => {
      if (!linkedProductIds.includes(sp.id)) {
        const p = products.find(prod => prod.id === sp.id);
        if (p) total += Number(p.price) * sp.qty;
      }
    });
    return Math.max(0, total - (couponQty * 25000));
  };

  const confirmPayment = async () => {
    if (!processingId) return;
    
    const service = services.find(s => s.id === selectedServiceId);
    const linkedProductIds = service?.linkedProducts?.map((lp: any) => lp.productId) || [];
    
    const items: any[] = [];
    if (service) {
      items.push({
        itemType: 'SERVICE' as const,
        serviceId: service.id,
        itemName: service.name,
        quantity: 1,
        unitPrice: getServicePrice(service)
      });
    }

    selectedProducts.forEach(sp => {
      const p = products.find(prod => prod.id === sp.id);
      if (p) {
        const isLinked = linkedProductIds.includes(p.id);
        items.push({
          itemType: 'PRODUCT' as const,
          productId: p.id,
          itemName: p.name,
          quantity: sp.qty,
          unitPrice: isLinked ? 0 : Number(p.price)
        });
      }
    });

    try {
      await processPayment(processingId, {
        paymentMethod: selectedMethod,
        items,
        discountAmount: couponQty * 25000
      });
      
      
      setTransactions(prev => prev.map(t => {
        if (t.id === processingId) {
          return { 
            ...t, 
            status: 'PAID', 
            paymentMethod: selectedMethod, 
            totalAmount: calculateSubtotal(),
            items: items.map(i => ({
              itemType: i.itemType,
              service: i.itemType === 'SERVICE' ? { name: i.itemName } : undefined,
              product: i.itemType === 'PRODUCT' ? { name: i.itemName } : undefined,
              quantity: i.quantity
            }))
          };
        }
        return t;
      }));
      
      toast.success('Pembayaran berhasil diproses!');
      setProcessingId(null);
    } catch (error) {
      toast.error('Gagal memproses pembayaran');
    }
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
          <Link 
            href={`/kasir/billing/report?dateFilter=${dateFilter}&search=${search}`}
            target="_blank"
            className="bg-white border border-outline-variant px-4 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Ekspor Laporan
          </Link>
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
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Ditangani Oleh</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Jumlah</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Rekam Medis</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {paginated.map(t => {
              const time = new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const servicesList = t.items?.filter((i: any) => i.itemType === 'SERVICE') || [];
              const productsList = t.items?.filter((i: any) => i.itemType === 'PRODUCT') || [];
              
              let methodIcon = 'payments';
              if (t.paymentMethod === 'QRIS') methodIcon = 'qr_code_2';
              else if (t.paymentMethod === 'TRANSFER') methodIcon = 'account_balance';

              const txTime = new Date(t.createdAt).getTime();
              const matchedQueue = t.patient?.queues?.reduce((closest: any, q: any) => {
                const qTime = new Date(q.createdAt).getTime();
                if (!closest || Math.abs(qTime - txTime) < Math.abs(new Date(closest.createdAt).getTime() - txTime)) {
                  return q;
                }
                return closest;
              }, null);

              const doctorName = t.medicalRecords?.[0]?.doctor?.name || matchedQueue?.doctor?.name;
              const therapistName = matchedQueue?.therapist?.name;
              
              const handlers = [];
              if (doctorName) handlers.push(doctorName);
              if (therapistName) handlers.push(therapistName);
              const handledBy = servicesList.length === 0 ? 'Resepsionis' : (handlers.length > 0 ? handlers.join(' & ') : '-');
              
              return (
              <tr key={t.id} className={`hover:bg-primary-container/5 transition-colors ${t.status === 'PENDING' ? 'bg-surface-container-highest/20' : ''}`}>
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{time}</td>
                <td className="px-6 py-4 font-body-md font-bold text-primary">{t.invoiceId}</td>
                <td className="px-6 py-4 font-body-sm font-semibold text-on-surface">{t.patient?.name || 'Umum'}</td>
                <td className="px-6 py-4">
                  <div className="font-body-md font-semibold text-on-surface">
                    {servicesList.length > 0 ? servicesList.map((s: any) => s.service?.name || s.itemName).join(', ') : 'Produk Saja'}
                  </div>
                  {productsList.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {productsList.map((p: any, i: number) => (
                        <div key={i} className="text-[11px] text-on-surface-variant flex items-center gap-1 before:content-['•'] before:text-outline-variant">
                          {p.product?.name || p.itemName} <span className="text-outline">x{p.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {t.paymentMethod ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{methodIcon}</span>
                      <span className="font-body-sm text-on-surface-variant">{t.paymentMethod}</span>
                    </div>
                  ) : <span className="font-body-sm text-on-surface-variant">-</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="font-body-sm text-on-surface-variant">{handledBy}</div>
                </td>
                <td className="px-6 py-4 font-body-md font-bold text-on-surface">{formatCurrency(Number(t.totalAmount || 0))}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${t.status === 'PAID' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>{t.status === 'PAID' ? 'Lunas' : 'Tertunda'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {servicesList.length > 0 && t.patient ? (
                    <Link href={`/kasir/rekam-medis/${t.patient.noRM}`} target="_blank" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary-container/30 transition-colors" title="Cetak Rekam Medis">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </Link>
                  ) : (
                    <span className="text-on-surface-variant/50 font-body-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status === 'PAID' ? (
                    <Link href={`/kasir/billing/invoice/${t.id}`} className="p-2 inline-block hover:bg-primary-container/30 rounded-lg text-primary transition-all" title="Cetak Struk">
                      <span className="material-symbols-outlined text-[20px]">print</span>
                    </Link>
                  ) : (
                    <button className="px-3 py-1.5 bg-primary text-white font-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all" onClick={() => handleOpenProcessModal(t.id)}>Proses</button>
                  )}
                </td>
              </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-6 py-8 text-center text-on-surface-variant">Tidak ada transaksi ditemukan.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-on-surface-variant">Tampilkan</span>
              <select 
                className="bg-surface-container border border-outline-variant/60 rounded-lg px-2 py-1 text-body-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-body-sm text-on-surface-variant">data</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-body-sm text-on-surface-variant">
                Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} dari {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30" 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button 
                  className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30" 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
                      onChange={e => handleServiceChange(e.target.value)}
                    >
                      {services.map(s => {
                        const finalPrice = getServicePrice(s);
                        const originalPrice = Number(s.basePrice || 0);
                        const label = finalPrice < originalPrice 
                          ? `${s.name} - ${formatCurrency(finalPrice)} (Promo)` 
                          : `${s.name} - ${formatCurrency(originalPrice)}`;
                        return (
                          <option key={s.id} value={s.id}>{label}</option>
                        );
                      })}
                    </select>
                  </div>

                  {(() => {
                    const selectedService = services.find(s => s.id === selectedServiceId);
                    const linkedProductIds = selectedService?.linkedProducts?.map((lp: any) => lp.productId) || [];
                    const linkedProductsList = products.filter(p => linkedProductIds.includes(p.id));
                    const optionalProductsList = products.filter(p => !linkedProductIds.includes(p.id));

                    const renderProductRow = (p: any, isLinked: boolean) => {
                      const isSelected = selectedProducts.some(sp => sp.id === p.id);
                      const qty = selectedProducts.find(sp => sp.id === p.id)?.qty || 1;
                      const isOutOfStock = p.stock === 0;
                      return (
                        <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary-container/10' : 'border-outline-variant/40 hover:bg-surface-container-low'} ${isOutOfStock ? 'opacity-50' : ''}`}>
                          <div className={`flex items-center gap-3 flex-1 ${!isOutOfStock && 'cursor-pointer'}`} onClick={() => !isOutOfStock && toggleProduct(p.id)}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              disabled={isOutOfStock}
                              readOnly
                              className={`w-4 h-4 text-primary focus:ring-primary rounded ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                            <div>
                              <p className="font-body-md font-semibold text-on-surface">{p.name} {isOutOfStock && <span className="text-error text-[10px] ml-1">(Habis)</span>}</p>
                              <p className="text-[11px] text-on-surface-variant">{p.category} • Sisa Stok: {p.stock}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {isLinked ? (
                              <span className="font-label-md text-green-600 text-[10px] uppercase font-bold tracking-wider">Termasuk Layanan</span>
                            ) : (
                              <span className="font-label-md text-primary">{formatCurrency(Number(p.price || 0))}</span>
                            )}
                            {isSelected && !isOutOfStock && (
                              <div className="flex items-center gap-2 bg-surface-container-high rounded-lg p-1 border border-outline-variant/30" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="w-6 h-6 flex items-center justify-center rounded bg-white text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                                  onClick={() => updateQty(p.id, qty - 1)}
                                  disabled={qty <= 1}
                                >
                                  -
                                </button>
                                <span className="font-label-md text-[12px] w-4 text-center">{qty}</span>
                                <button 
                                  className="w-6 h-6 flex items-center justify-center rounded bg-white text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                                  onClick={() => updateQty(p.id, qty + 1)}
                                  disabled={qty >= p.stock}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-6">
                        {linkedProductsList.length > 0 && (
                          <div>
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Produk Terkait Layanan</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {linkedProductsList.map((p) => renderProductRow(p, true))}
                            </div>
                          </div>
                        )}
                        
                        {optionalProductsList.length > 0 && (
                          <div>
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Tambah Produk Skincare (Opsional)</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {optionalProductsList.map((p) => renderProductRow(p, false))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Kupon Potongan Harga (Opsional)</label>
                          <div className="flex justify-between items-center p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary">redeem</span>
                              <div>
                                <p className="font-body-md font-semibold text-on-surface">Voucher Rp25.000</p>
                                <p className="text-[11px] text-on-surface-variant">Berlaku kelipatan</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-surface-container-high rounded-lg p-1 border border-outline-variant/30">
                                <button 
                                  className="w-8 h-8 flex items-center justify-center rounded bg-white text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                                  onClick={() => setCouponQty(prev => Math.max(0, prev - 1))}
                                  disabled={couponQty <= 0}
                                >
                                  -
                                </button>
                                <span className="font-label-md text-[14px] w-6 text-center">{couponQty}</span>
                                <button 
                                  className="w-8 h-8 flex items-center justify-center rounded bg-white text-on-surface hover:bg-surface-container-highest transition-colors"
                                  onClick={() => setCouponQty(prev => prev + 1)}
                                >
                                  +
                                </button>
                              </div>
                              {couponQty > 0 && (
                                <span className="font-label-md text-error font-bold w-24 text-right">- {formatCurrency(couponQty * 25000)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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
                    {(['QRIS', 'TRANSFER', 'CASH'] as PaymentMethod[]).map(method => (
                      <label key={method} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedMethod === method ? 'border-primary bg-primary-container/10 shadow-sm' : 'border-outline-variant/40 hover:bg-surface-container-low'}`}>
                        <input type="radio" name="paymentMethod" value={method} checked={selectedMethod === method} onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)} className="text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                        <span className="font-label-md text-on-surface flex-1">{method}</span>
                        <span className="material-symbols-outlined text-on-surface-variant">{method === 'QRIS' ? 'qr_code_2' : method === 'TRANSFER' ? 'account_balance' : 'payments'}</span>
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
