'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getTransactions } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import type { PaymentMethod, TransactionStatus } from '@/generated/prisma/client';

type FilterEmployee = 'All' | 'Dokter' | 'Terapis' | 'Dokter & Terapis';

export default function OwnerPayrollPage() {
  const [employeeFilter, setEmployeeFilter] = useState<FilterEmployee>('All');
  const [handlerNameFilter, setHandlerNameFilter] = useState<string>('All');
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
    // Only paid transactions generate fees usually, but let's include all and show 0 if pending, or just show PAID?
    // Let's only show PAID transactions since fees are earned upon payment.
    if (tx.status !== 'PAID') return false;

    // Filter by Employee type
    const hasDoctorFee = tx.items.some((i: any) => Number(i.doctorFee || 0) > 0);
    const hasTherapistFee = tx.items.some((i: any) => Number(i.therapistFee || 0) > 0);
    
    if (employeeFilter === 'Dokter' && !hasDoctorFee) return false;
    if (employeeFilter === 'Terapis' && !hasTherapistFee) return false;
    if (employeeFilter === 'Dokter & Terapis' && (!hasDoctorFee || !hasTherapistFee)) return false;
    if (employeeFilter === 'All' && !hasDoctorFee && !hasTherapistFee) return false; // Hide transactions with no fees

    if (search && !(tx.patient?.name?.toLowerCase() || '').includes(search.toLowerCase()) && !tx.invoiceId.toLowerCase().includes(search.toLowerCase())) return false;
    
    // Calculate handler for this tx
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

    const txDate = new Date(tx.createdAt);
    if (filterYear !== 'All' && String(txDate.getFullYear()) !== filterYear) return false;
    if (filterMonth !== 'All' && String(txDate.getMonth() + 1) !== filterMonth) return false;
    if (filterDay !== 'All' && String(txDate.getDate()) !== filterDay) return false;
    
    return true;
  });

  const uniqueHandlers = useMemo(() => {
    const handlers = new Set<string>();
    transactions.forEach(tx => {
      if (tx.status !== 'PAID') return;
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
      const arr = [];
      if (doctorName) arr.push(`Dr. ${doctorName.replace('Dr. ', '')}`);
      if (therapistName) arr.push(therapistName);
      if (arr.length > 0) {
        handlers.add(arr.join(' & '));
      }
    });
    return Array.from(handlers).sort();
  }, [transactions]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalDoctorFee = filtered.reduce((sum, tx) => {
    return sum + tx.items.reduce((itemSum: number, item: any) => itemSum + Number(item.doctorFee || 0), 0);
  }, 0);
  const totalTherapistFee = filtered.reduce((sum, tx) => {
    return sum + tx.items.reduce((itemSum: number, item: any) => itemSum + Number(item.therapistFee || 0), 0);
  }, 0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat data...</div>;
  }

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">payments</span>
            Penggajian Karyawan
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Laporan komisi dan fee dokter serta terapis berdasarkan transaksi pelayanan klinik.</p>
        </div>
        <Link
          href={`/owner/payroll/report?year=${filterYear}&month=${filterMonth}&day=${filterDay}&employee=${employeeFilter}&handlerName=${encodeURIComponent(handlerNameFilter)}&search=${search}`}
          target="_blank"
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Ekspor Laporan
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-bl-full -mr-6 -mt-6"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Fee Dokter</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalDoctorFee)}</h3>
        </div>
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100/30 rounded-bl-full -mr-6 -mt-6"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Fee Terapis</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalTherapistFee)}</h3>
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
          {(['All', 'Dokter', 'Terapis', 'Dokter & Terapis'] as FilterEmployee[]).map(m => (
            <button
              key={m}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] transition-colors ${employeeFilter === m ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => { setEmployeeFilter(m); setPage(1); }}
            >{m === 'All' ? 'Semua Karyawan' : m}</button>
          ))}
        </div>
        
        {uniqueHandlers.length > 0 && (
          <div className="relative">
            <select 
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-body-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none pr-10 cursor-pointer text-on-surface"
              value={handlerNameFilter}
              onChange={(e) => { setHandlerNameFilter(e.target.value); setPage(1); }}
            >
              <option value="All">Semua Nama (Ditangani Oleh)</option>
              {uniqueHandlers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="glass-card ambient-shadow rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-primary-container/10 border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Waktu</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Faktur</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Pasien</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Layanan</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Ditangani Oleh</th>
              <th className="px-6 py-4 font-label-md text-label-md text-blue-700 uppercase tracking-wider text-right">Fee Dokter</th>
              <th className="px-6 py-4 font-label-md text-label-md text-purple-700 uppercase tracking-wider text-right">Fee Terapis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {paginated.map(tx => {
              const time = new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const servicesList = tx.items?.filter((i: any) => i.itemType === 'SERVICE') || [];
              
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

              const totalDoctorFeeTx = tx.items.reduce((sum: number, i: any) => sum + Number(i.doctorFee || 0), 0);
              const totalTherapistFeeTx = tx.items.reduce((sum: number, i: any) => sum + Number(i.therapistFee || 0), 0);

              return (
              <tr key={tx.id} className="hover:bg-primary-container/5 transition-colors">
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{time}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-[12px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{tx.invoiceId}</span>
                </td>
                <td className="px-6 py-4 font-body-md font-bold text-on-surface">{tx.patient?.name || 'Umum'}</td>
                <td className="px-6 py-4">
                  <div className="font-body-md font-semibold text-on-surface">
                    {servicesList.map((s: any) => s.service?.name || s.itemName).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-body-sm text-on-surface-variant">{handledBy}</div>
                </td>
                <td className="px-6 py-4 text-right font-headline-sm text-blue-700 font-bold">{formatCurrency(totalDoctorFeeTx)}</td>
                <td className="px-6 py-4 text-right font-headline-sm text-purple-700 font-bold">{formatCurrency(totalTherapistFeeTx)}</td>
              </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Tidak ada fee karyawan yang sesuai dengan filter saat ini.</td></tr>
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
    </div>
  );
}
