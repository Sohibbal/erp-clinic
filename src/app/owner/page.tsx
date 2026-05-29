'use client';

import { useState, useEffect } from 'react';
import { getOwnerDashboardStats } from '@/actions/dashboard';
import { getEmployees } from '@/actions/employee';
import { getTransactions } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, empData, txData] = await Promise.all([
          getOwnerDashboardStats(),
          getEmployees(),
          getTransactions()
        ]);
        setStats(dashboardStats);
        setEmployees(empData.filter(e => e.role === 'DOCTOR' || e.role === 'THERAPIST'));
        
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat dashboard...</div>;
  }

  return (
    <div className="p-margin max-w-container-max mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Ringkasan Dasbor</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau performa klinik dan kesehatan bisnis Anda.</p>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/50">
            <span className="material-symbols-outlined text-outline">calendar_today</span>
            <span className="font-label-md text-label-md text-on-surface">Hari Ini</span>
          </div>
        </div>
      </header>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Pendapatan</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{formatCurrency(stats?.totalRevenue || 0)}</h3>
            <span className="text-primary font-label-md mb-1">Bulan Ini: {formatCurrency(stats?.monthlyRevenue || 0)}</span>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="w-full h-full text-primary" viewBox="0 0 100 20">
              <path d="M0,15 Q25,5 50,12 T100,5" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Pasien</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{stats?.totalPatients || 0}</h3>
            <span className="text-tertiary font-label-md mb-1">Terdaftar</span>
          </div>
          <div className="mt-4 flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">...</div>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Transaksi Selesai</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">receipt</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{stats?.paidTransactions || 0}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{stats?.pendingTransactions || 0} tertunda</p>
            </div>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Kesehatan Stok</p>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{stats?.outOfStock || 0} Habis</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${stats?.outOfStock > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{stats?.lowStock || 0} Stok Menipis</span>
              </div>
            </div>
            <span className="material-symbols-outlined ml-auto text-outline-variant text-4xl">inventory_2</span>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-stack-lg">
        <div className="glass-card ambient-shadow p-8 rounded-3xl">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Performa Karyawan</h3>
          <div className="space-y-4">
            {employees.length === 0 ? <p className="text-on-surface-variant">Belum ada karyawan.</p> : employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-4 p-3 hover:bg-primary-container/20 rounded-2xl transition-all">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                  {emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-body-md text-body-md font-semibold text-on-surface">{emp.name}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{emp.role === 'DOCTOR' ? 'Dokter' : 'Terapis'}</p>
                </div>
                <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full">
                  <span className="font-label-md text-label-md">Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="glass-card ambient-shadow rounded-3xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary-container/10 border-b border-outline-variant/30">
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nama Pasien</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Jumlah</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {recentTx.length === 0 ? (
                <tr><td colSpan={3} className="px-8 py-5 text-center text-on-surface-variant">Belum ada transaksi.</td></tr>
              ) : recentTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-primary-container/10 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className="font-body-md text-body-md text-on-surface">{tx.patient?.name || 'Pasien Umum'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-body-md text-body-md font-semibold text-primary">{formatCurrency(Number(tx.totalAmount || 0))}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="bg-green-100 text-green-700 font-label-md px-3 py-1 rounded-full">LUNAS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
