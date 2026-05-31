'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOwnerDashboardStats, getRevenueChartData } from '@/actions/dashboard';
import { getEmployees, getEmployeePerformance } from '@/actions/employee';
import { getTransactions } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, empData, txData] = await Promise.all([
          getOwnerDashboardStats(),
          getEmployeePerformance(),
          getTransactions()
        ]);
        setStats(dashboardStats);
        setEmployees(empData);
        
        // Get high value transactions (e.g. > 100000) or just the 5 most recent paid ones
        const recent = txData
          .filter((t: any) => t.status === 'PAID')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentTx(recent);
        
      } catch (error) {
        toast.error('Gagal memuat dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadChartData() {
      const revenueData = await getRevenueChartData(chartYear);
      setChartData(revenueData);
    }
    loadChartData();
  }, [chartYear]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat dashboard...</div>;
  }

  return (
    <div className="p-margin max-w-container-max mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Dasbor Analitis</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau performa klinik dan kesehatan bisnis Anda.</p>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/50">
            <span className="material-symbols-outlined text-outline">calendar_today</span>
            <span className="font-label-md text-label-md text-on-surface">Semua Waktu</span>
          </div>
        </div>
      </header>

      {/* Financial Cards (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Pendapatan</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(stats?.totalRevenue || 0)}</h3>
            <span className="text-primary font-label-md mb-1">Bulan Ini: {formatCurrency(stats?.monthlyRevenue || 0)}</span>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Pengeluaran</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(stats?.totalExpense || 0)}</h3>
            <span className="text-red-500 font-label-md mb-1">Bulan Ini: {formatCurrency(stats?.monthlyExpense || 0)}</span>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Keuntungan</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(stats?.totalProfit || 0)}</h3>
            <span className="text-green-600 font-label-md mb-1">Bulan Ini: {formatCurrency(stats?.monthlyProfit || 0)}</span>
          </div>
        </div>
      </div>

      {/* Operational Cards (Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-stack-lg">
        <div className="glass-card ambient-shadow p-4 rounded-xl flex flex-col justify-center">
          <p className="text-[10px] font-bold text-outline uppercase mb-1">Total Pasien</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{stats?.totalPatients || 0}</h3>
            <span className="text-tertiary text-[11px] mb-1">Terdaftar</span>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-4 rounded-xl flex flex-col justify-center">
          <p className="text-[10px] font-bold text-outline uppercase mb-1">Transaksi Selesai</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[18px]">receipt</span>
            </div>
            <div className="overflow-hidden">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{stats?.paidTransactions || 0}</h3>
              <p className="text-[10px] text-on-surface-variant truncate">{stats?.pendingTransactions || 0} tertunda</p>
            </div>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-4 rounded-xl flex flex-col justify-center">
          <p className="text-[10px] font-bold text-outline uppercase mb-1">Kesehatan Stok</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{stats?.outOfStock || 0} Habis</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${stats?.outOfStock > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-[10px] text-on-surface-variant truncate">{stats?.lowStock || 0} Menipis</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[24px]">inventory_2</span>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-4 rounded-xl flex flex-col justify-center">
          <p className="text-[10px] font-bold text-outline uppercase mb-1">Layanan Teratas</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600 shrink-0">
              <span className="material-symbols-outlined text-[18px]">star</span>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-on-surface truncate" title={stats?.topService}>{stats?.topService || "-"}</h3>
              <p className="text-[10px] text-purple-600">{stats?.topServiceCount || 0} Terjual</p>
            </div>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-4 rounded-xl flex flex-col justify-center">
          <p className="text-[10px] font-bold text-outline uppercase mb-1">Metode Bayar Favorit</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-on-surface truncate capitalize" title={stats?.topPayment}>{stats?.topPayment || "-"}</h3>
              <p className="text-[10px] text-blue-600">{stats?.topPaymentCount || 0} Transaksi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-stack-lg">
        {/* Left: Income vs Expense Chart */}
        <div className="glass-card ambient-shadow p-8 rounded-3xl flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Grafik Pemasukan vs Pengeluaran</h3>
            <div className="relative" tabIndex={0} onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsYearDropdownOpen(false);
              }
            }}>
              <div 
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer select-none"
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              >
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                <span className="font-label-md text-label-md text-on-surface pr-4">{chartYear}</span>
                <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              
              {isYearDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full min-w-[120px] bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
                    <button
                      key={year}
                      className={`w-full text-left px-4 py-2.5 font-label-md transition-colors hover:bg-primary-container/20 ${chartYear === year ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'}`}
                      onClick={() => {
                        setChartYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-grow w-full h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={100}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`}
                  tick={{ fill: '#737373', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.2)' }}
                />
                <Legend />
                <Line type="monotone" name="Pemasukan" dataKey="pemasukan" stroke="#C2A058" strokeWidth={3} dot={{ r: 4, fill: '#C2A058' }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Pengeluaran" dataKey="pengeluaran" stroke="#e86161" strokeWidth={3} dot={{ r: 4, fill: '#e86161' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Employee Performance */}
        <div className="glass-card ambient-shadow p-8 rounded-3xl">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Performa Karyawan</h3>
          <div className="space-y-4">
            {employees.length === 0 ? <p className="text-on-surface-variant">Belum ada karyawan.</p> : employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-4 p-3 hover:bg-primary-container/20 rounded-2xl transition-all">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold overflow-hidden border border-outline-variant/20 shrink-0">
                  {emp.imageUrl ? (
                    <img src={emp.imageUrl} alt={emp.name} className="w-full h-full object-cover" />
                  ) : (
                    emp.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-body-md text-body-md font-semibold text-on-surface">{emp.name}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{emp.role === 'DOCTOR' ? 'Dokter' : 'Terapis'}</p>
                </div>
                <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full">
                  <span className="font-label-md text-label-md">{emp.patientCount} Pasien</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="glass-card ambient-shadow rounded-3xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {recentTx.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-5 text-center text-on-surface-variant">Belum ada transaksi.</td></tr>
              ) : recentTx.map((tx) => {
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

                const methodIcons: Record<string, string> = {
                  'QRIS': 'qr_code_2',
                  'TRANSFER': 'account_balance',
                  'CASH': 'payments',
                };

                return (
                  <tr key={tx.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant w-32 break-words leading-snug">{time}</td>
                    <td className="px-6 py-4 w-32">
                      <div className="font-mono text-[11px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded break-words">{tx.invoiceId}</div>
                    </td>
                    <td className="px-6 py-4 font-body-md font-bold text-on-surface whitespace-nowrap">{tx.patient?.name || 'Umum'}</td>
                    <td className="px-6 py-4 min-w-[200px]">
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
                    <td className="px-6 py-4 whitespace-nowrap">
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
                      <div className="font-body-sm text-on-surface-variant whitespace-nowrap">{handledBy}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-headline-sm text-primary font-bold whitespace-nowrap">{formatCurrency(Number(tx.totalAmount || 0))}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tx.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                        {tx.status === 'PAID' ? 'LUNAS' : 'TERTUNDA'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {servicesList.length > 0 && tx.patient ? (
                        <Link href={`/kasir/rekam-medis/${tx.patient.noRM}`} target="_blank" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary-container/30 transition-colors" title="Lihat Rekam Medis">
                          <span className="material-symbols-outlined text-[20px]">description</span>
                        </Link>
                      ) : (
                        <span className="text-on-surface-variant/50 font-body-sm">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
