'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getTransactions, updateTransaction, deleteTransaction } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import type { PaymentMethod, TransactionStatus } from '@/generated/prisma/client';

type FilterMethod = 'All' | 'QRIS' | 'TRANSFER' | 'CASH';
type FilterStatus = 'All' | 'PAID' | 'PENDING';

export default function OwnerRevenuePage() {
  const [methodFilter, setMethodFilter] = useState<FilterMethod>('All');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [search, setSearch] = useState('');
  
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterDay, setFilterDay] = useState('All');
  
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Delete state
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getTransactions();
        if (isMounted) setTransactions(data);
      } catch (error) {
        console.error('Gagal memuat data transaksi:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    loadData();
    
    // Auto-refresh data every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalRevenue = filtered.reduce((sum, tx) => tx.status === 'PAID' ? sum + Number(tx.totalAmount) : sum, 0);
  const totalPending = filtered.reduce((sum, tx) => tx.status === 'PENDING' ? sum + Number(tx.totalAmount) : sum, 0);
  const paidCount = filtered.filter(tx => tx.status === 'PAID').length;
  const pendingCount = filtered.filter(tx => tx.status === 'PENDING').length;

  const methodIcons: Record<string, string> = {
    'QRIS': 'qr_code_2',
    'TRANSFER': 'account_balance',
    'CASH': 'payments',
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setIsUpdating(true);
    try {
      const updated = await updateTransaction(editingTransaction.id, {
        status: editingTransaction.status,
        paymentMethod: editingTransaction.paymentMethod,
        totalAmount: Number(editingTransaction.totalAmount),
        discountAmount: Number(editingTransaction.discountAmount || 0),
        notes: editingTransaction.notes
      });
      setTransactions(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
      setEditingTransaction(null);
      toast.success('Transaksi berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui transaksi');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransactionId) return;
    setIsUpdating(true);
    try {
      await deleteTransaction(deletingTransactionId);
      setTransactions(prev => prev.filter(t => t.id !== deletingTransactionId));
      setDeletingTransactionId(null);
      toast.success('Transaksi berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus transaksi');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat data...</div>;
  }

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">account_balance_wallet</span>
            Pendapatan & Catatan Keuangan
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Catatan transaksi terperinci, analisis arus kas, dan pelacakan pembayaran.</p>
        </div>
        <Link
          href={`/owner/revenue/report?year=${filterYear}&month=${filterMonth}&day=${filterDay}&method=${methodFilter}&status=${statusFilter}&search=${search}`}
          target="_blank"
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Ekspor Laporan
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100/30 rounded-bl-full -mr-6 -mt-6"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Terkumpul</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalRevenue)}</h3>
          <p className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            {paidCount} transaksi
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100/30 rounded-bl-full -mr-6 -mt-6"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Tertunda</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalPending)}</h3>
          <p className="text-[11px] text-orange-600 font-bold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {pendingCount} menunggu pembayaran
          </p>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Rata-rata Transaksi</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {formatCurrency(paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0)}
          </h3>
          <p className="text-[11px] text-on-surface-variant font-bold mt-1">Per faktur lunas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Cari berdasarkan nama pasien atau faktur..."
            className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        {/* Date Filters */}
        <div className="flex items-center gap-3">
          {/* Year */}
          <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsYearOpen(false); }}>
            <div 
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer select-none"
              onClick={() => setIsYearOpen(!isYearOpen)}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">calendar_today</span>
              <span className="font-body-sm text-on-surface pr-2">{filterYear === 'All' ? 'Tahun' : filterYear}</span>
            </div>
            {isYearOpen && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[100px] bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2 z-20 overflow-y-auto max-h-64 animate-in fade-in slide-in-from-top-2 duration-200">
                {['All', '2024', '2025', '2026'].map(y => (
                  <button
                    key={y}
                    className={`w-full text-left px-4 py-2 font-body-sm transition-colors hover:bg-primary-container/20 ${filterYear === y ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'}`}
                    onClick={() => { setFilterYear(y); setPage(1); setIsYearOpen(false); }}
                  >
                    {y === 'All' ? 'Semua' : y}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Month */}
          <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsMonthOpen(false); }}>
            <div 
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer select-none"
              onClick={() => setIsMonthOpen(!isMonthOpen)}
            >
              <span className="font-body-sm text-on-surface pr-2">
                {filterMonth === 'All' ? 'Bulan' : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][Number(filterMonth)-1]}
              </span>
            </div>
            {isMonthOpen && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[120px] bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2 z-20 overflow-y-auto max-h-64 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  className={`w-full text-left px-4 py-2 font-body-sm transition-colors hover:bg-primary-container/20 ${filterMonth === 'All' ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'}`}
                  onClick={() => { setFilterMonth('All'); setPage(1); setIsMonthOpen(false); }}
                >
                  Semua
                </button>
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                  <button
                    key={m}
                    className={`w-full text-left px-4 py-2 font-body-sm transition-colors hover:bg-primary-container/20 ${filterMonth === String(i+1) ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'}`}
                    onClick={() => { setFilterMonth(String(i+1)); setPage(1); setIsMonthOpen(false); }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day */}
          <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDayOpen(false); }}>
            <div 
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer select-none"
              onClick={() => setIsDayOpen(!isDayOpen)}
            >
              <span className="font-body-sm text-on-surface pr-2">{filterDay === 'All' ? 'Tanggal' : filterDay}</span>
            </div>
            {isDayOpen && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[100px] bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2 z-20 overflow-y-auto max-h-64 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  className={`w-full text-left px-4 py-2 font-body-sm transition-colors hover:bg-primary-container/20 ${filterDay === 'All' ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'}`}
                  onClick={() => { setFilterDay('All'); setPage(1); setIsDayOpen(false); }}
                >
                  Semua
                </button>
                {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                  <button
                    key={d}
                    className={`w-full text-left px-4 py-2 font-body-sm transition-colors hover:bg-primary-container/20 ${filterDay === String(d) ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'}`}
                    onClick={() => { setFilterDay(String(d)); setPage(1); setIsDayOpen(false); }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          {(['All', 'QRIS', 'TRANSFER', 'CASH'] as FilterMethod[]).map(m => (
            <button
              key={m}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${methodFilter === m ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setMethodFilter(m)}
            >{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          {(['All', 'PAID', 'PENDING'] as FilterStatus[]).map(s => (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${statusFilter === s ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setStatusFilter(s)}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-primary-container/10 border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Waktu</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Faktur</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Pasien</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Layanan & Produk</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Metode</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Ditangani Oleh</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Jumlah</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Rekam Medis</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {paginated.map(tx => {
              const time = new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const servicesList = tx.items?.filter((i: any) => i.itemType === 'SERVICE') || [];
              const productsList = tx.items?.filter((i: any) => i.itemType === 'PRODUCT') || [];
              
              const txTime = new Date(tx.createdAt).getTime();
              const matchedQueue = tx.patient?.queues?.reduce((closest: any, q: any) => {
                const qTime = new Date(q.createdAt).getTime();
                if (!closest || Math.abs(qTime - txTime) < Math.abs(new Date(closest.createdAt).getTime() - txTime)) {
                  return q;
                }
                return closest;
              }, null);

              const doctorName = tx.medicalRecords?.[0]?.doctor?.name || matchedQueue?.doctor?.name;
              const therapistName = matchedQueue?.therapist?.name;
              
              const handlers = [];
              if (doctorName) handlers.push(`Dr. ${doctorName.replace('Dr. ', '')}`);
              if (therapistName) handlers.push(therapistName);
              const handledBy = servicesList.length === 0 ? 'Resepsionis' : (handlers.length > 0 ? handlers.join(' & ') : '-');

              return (
              <tr key={tx.id} className="hover:bg-primary-container/5 transition-colors">
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{time}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-[12px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{tx.invoiceId}</span>
                </td>
                <td className="px-6 py-4 font-body-md font-bold text-on-surface">{tx.patient?.name || 'Umum'}</td>
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
                  {tx.paymentMethod ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{methodIcons[tx.paymentMethod] || 'help'}</span>
                      <span className="font-body-sm text-on-surface">{tx.paymentMethod}</span>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant text-body-sm italic">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-body-sm text-on-surface-variant">{handledBy}</div>
                </td>
                <td className="px-6 py-4 text-right font-headline-sm text-primary font-bold">{formatCurrency(Number(tx.totalAmount || 0))}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tx.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                    {tx.status === 'PAID' ? 'LUNAS' : 'TERTUNDA'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {servicesList.length > 0 && tx.patient ? (
                    <Link href={`/kasir/rekam-medis/${tx.patient.noRM}`} target="_blank" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary-container/30 transition-colors" title="Cetak Rekam Medis">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </Link>
                  ) : (
                    <span className="text-on-surface-variant/50 font-body-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setEditingTransaction(tx)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary-container/30 transition-colors"
                      title="Edit Transaksi"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => setDeletingTransactionId(tx.id)}
                      className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-on-surface-variant">Tidak ada transaksi yang sesuai dengan filter saat ini.</td></tr>
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

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setEditingTransaction(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-md text-headline-md text-primary">Edit Transaksi {editingTransaction.invoiceId}</h3>
              <button className="text-on-surface-variant hover:text-error transition-colors" onClick={() => setEditingTransaction(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Status Pembayaran</label>
                <select 
                  className="w-full py-2 px-3 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingTransaction.status}
                  onChange={e => setEditingTransaction({...editingTransaction, status: e.target.value})}
                >
                  <option value="PAID">LUNAS</option>
                  <option value="PENDING">TERTUNDA</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Metode Pembayaran</label>
                <select 
                  className="w-full py-2 px-3 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingTransaction.paymentMethod || 'CASH'}
                  onChange={e => setEditingTransaction({...editingTransaction, paymentMethod: e.target.value})}
                >
                  <option value="CASH">CASH</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TRANSFER">TRANSFER</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Total Pembayaran (IDR)</label>
                <input 
                  type="number"
                  className="w-full py-2 px-3 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingTransaction.totalAmount}
                  onChange={e => setEditingTransaction({...editingTransaction, totalAmount: e.target.value})}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Diskon (Opsional)</label>
                <input 
                  type="number"
                  className="w-full py-2 px-3 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingTransaction.discountAmount || 0}
                  onChange={e => setEditingTransaction({...editingTransaction, discountAmount: e.target.value})}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Catatan</label>
                <textarea 
                  className="w-full py-2 px-3 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  rows={3}
                  value={editingTransaction.notes || ''}
                  onChange={e => setEditingTransaction({...editingTransaction, notes: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button type="button" onClick={() => setEditingTransaction(null)} className="px-5 py-2.5 font-label-md text-label-md rounded-xl text-on-surface hover:bg-surface-container transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isUpdating} className="px-5 py-2.5 font-label-md text-label-md rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70">
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransactionId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDeletingTransactionId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Hapus Transaksi?</h3>
            <p className="text-body-md text-on-surface-variant mb-6">Tindakan ini tidak dapat dibatalkan. Data riwayat transaksi, stok terkait, dan rekam medis juga akan terdampak.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeletingTransactionId(null)} className="flex-1 px-4 py-2 font-label-md rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                Batal
              </button>
              <button onClick={handleDelete} disabled={isUpdating} className="flex-1 px-4 py-2 font-label-md rounded-xl bg-error text-white hover:bg-error/90 transition-colors shadow-sm disabled:opacity-70">
                {isUpdating ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
