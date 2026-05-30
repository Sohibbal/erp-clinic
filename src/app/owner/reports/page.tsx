'use client';

import { useState, useEffect } from 'react';
import { getOwnerDashboardStats, getRevenueChartData } from '@/actions/dashboard';
import { getEmployeePerformance } from '@/actions/employee';
import { getTransactions } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function OwnerReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const year = new Date().getFullYear();
        const [dashboardStats, empData, txData, revChartData] = await Promise.all([
          getOwnerDashboardStats(),
          getEmployeePerformance(),
          getTransactions(),
          getRevenueChartData(year)
        ]);
        
        setStats(dashboardStats);
        setEmployees(empData);
        setChartData(revChartData);
        
        const recent = txData
          .filter((t: any) => t.status === 'PAID')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        setRecentTx(recent);
        
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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Memaksa kontainer grafik memiliki lebar statis saat dicetak agar Recharts tidak collapse */
          .chart-print-fix { width: 180mm !important; height: 300px !important; }
        }
      `}} />
      <div className="bg-white min-h-screen text-[#3E3626] print:bg-white print:m-0 print:p-0 print:block">
        {/* Floating Action Button (Hidden on Print) */}
        <div className="fixed bottom-10 right-10 z-50 print:hidden">
          <button 
            onClick={handlePrint}
            className="bg-[#D4AF37] text-white p-4 rounded-full shadow-2xl hover:bg-[#C2A058] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            title="Simpan sebagai PDF"
          >
            <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out px-0 group-hover:px-2 font-bold">
              Simpan PDF
            </span>
          </button>
        </div>

        {/* Document Container */}
        <div className="max-w-[1000px] mx-auto p-10 print:p-0 print:mx-0 print:w-[190mm] space-y-8 box-border">
        
        {/* Report Header */}
        <div className="border-b-4 border-[#D4AF37] pb-6 flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-[32px] font-bold text-[#C2A058] tracking-wide mb-1" style={{ fontVariant: 'small-caps' }}>SUNRISE CLINIC</h1>
            <h2 className="font-headline-md text-[#7D7058] uppercase tracking-[0.2em] text-[14px]">Laporan Global Eksekutif</h2>
          </div>
          <div className="text-right">
            <p className="text-body-sm font-bold text-[#3E3626]">Tanggal Laporan:</p>
            <p className="text-body-sm text-[#7D7058]">{currentDate}</p>
          </div>
        </div>

        {/* Ringkasan Eksekutif (Cards) */}
        <section className="print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#C2A058] text-[24px]">monitoring</span>
            <h3 className="font-headline-md text-[#C2A058] font-bold border-b border-[#D4AF37]/30 pb-1 flex-1">Ringkasan Dasbor</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4 mb-4">
            {/* Total Pendapatan */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Total Pendapatan</p>
              <h3 className="font-headline-md text-[#3E3626] font-bold">{formatCurrency(stats?.totalRevenue || 0)}</h3>
              <p className="text-[11px] text-[#2D6A4F] mt-1 font-semibold">Bulan Ini: {formatCurrency(stats?.monthlyRevenue || 0)}</p>
            </div>
            
            {/* Total Pengeluaran */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Total Pengeluaran</p>
              <h3 className="font-headline-md text-[#3E3626] font-bold">{formatCurrency(stats?.totalExpense || 0)}</h3>
              <p className="text-[11px] text-[#B76E79] mt-1 font-semibold">Bulan Ini: {formatCurrency(stats?.monthlyExpense || 0)}</p>
            </div>

            {/* Total Keuntungan */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Total Keuntungan</p>
              <h3 className="font-headline-md text-[#3E3626] font-bold">{formatCurrency(stats?.totalProfit || 0)}</h3>
              <p className="text-[11px] text-[#2D6A4F] mt-1 font-semibold">Bulan Ini: {formatCurrency(stats?.monthlyProfit || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 print:grid-cols-5 gap-4">
            {/* Total Pasien */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Total Pasien</p>
              <h3 className="font-headline-sm text-[#3E3626] font-bold">{stats?.totalPatients || 0}</h3>
              <p className="text-[10px] text-[#7D7058] mt-1 font-semibold">Pasien Terdaftar</p>
            </div>

            {/* Transaksi Selesai */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Transaksi Selesai</p>
              <h3 className="font-headline-sm text-[#3E3626] font-bold">{stats?.paidTransactions || 0}</h3>
              <p className="text-[10px] text-[#9C6644] mt-1 font-semibold truncate">{stats?.pendingTransactions || 0} Tertunda</p>
            </div>

            {/* Kesehatan Stok */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Kesehatan Stok</p>
              <h3 className="font-headline-sm text-[#3E3626] font-bold">{stats?.outOfStock || 0} Habis</h3>
              <p className="text-[10px] text-[#B76E79] mt-1 font-semibold truncate">{stats?.lowStock || 0} Menipis</p>
            </div>

            {/* Layanan Teratas */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Layanan Teratas</p>
              <h3 className="font-headline-sm text-[#3E3626] font-bold truncate" title={stats?.topService}>{stats?.topService || "-"}</h3>
              <p className="text-[10px] text-[#7D7058] mt-1 font-semibold">{stats?.topServiceCount || 0} Terjual</p>
            </div>

            {/* Metode Bayar Teratas */}
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-[#A89467] tracking-wider mb-1">Metode Bayar</p>
              <h3 className="font-headline-sm text-[#3E3626] font-bold truncate capitalize" title={stats?.topPayment}>{stats?.topPayment || "-"}</h3>
              <p className="text-[10px] text-[#7D7058] mt-1 font-semibold">{stats?.topPaymentCount || 0} Transaksi</p>
            </div>
          </div>
        </section>

        {/* Grafik Pemasukan vs Pengeluaran */}
        <section className="print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#C2A058] text-[24px]">bar_chart</span>
            <h3 className="font-headline-md text-[#C2A058] font-bold border-b border-[#D4AF37]/30 pb-1 flex-1">Grafik Pemasukan vs Pengeluaran ({new Date().getFullYear()})</h3>
          </div>
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#D4AF37]/20 h-[350px] w-full print:h-[250px]">
            {/* Screen version (Responsive) */}
            <div className="w-full h-full block print:hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#7D7058', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`}
                    tick={{ fill: '#7D7058', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" name="Pemasukan" dataKey="pemasukan" stroke="#C2A058" strokeWidth={3} dot={{ r: 4, fill: '#C2A058' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Pengeluaran" dataKey="pengeluaran" stroke="#B76E79" strokeWidth={3} dot={{ r: 4, fill: '#B76E79' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Print version (Fixed dimensions to prevent cutoff) */}
            <div className="hidden print:flex justify-center items-center w-full h-full">
              <LineChart width={700} height={240} data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#7D7058', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`}
                  tick={{ fill: '#7D7058', fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" name="Pemasukan" dataKey="pemasukan" stroke="#C2A058" strokeWidth={2} dot={{ r: 3, fill: '#C2A058' }} />
                <Line type="monotone" name="Pengeluaran" dataKey="pengeluaran" stroke="#B76E79" strokeWidth={2} dot={{ r: 3, fill: '#B76E79' }} />
              </LineChart>
            </div>
          </div>
        </section>

        {/* Performa Karyawan */}
        <section className="print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#C2A058] text-[24px]">medical_services</span>
            <h3 className="font-headline-md text-[#C2A058] font-bold border-b border-[#D4AF37]/30 pb-1 flex-1">Performa Tenaga Medis</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {employees.filter(e => e.role === 'DOCTOR' || e.role === 'THERAPIST').map((emp) => (
              <div key={emp.id} className="bg-[#FFFDF9] p-4 rounded-xl border border-[#D4AF37]/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FBE4A0] flex items-center justify-center text-[#B28B22] font-bold text-lg">
                  {emp.imageUrl ? (
                    <img src={emp.imageUrl} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    emp.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-body-md font-bold text-[#3E3626] line-clamp-1">{emp.name}</h4>
                  <p className="text-[10px] text-[#A89467]">{emp.role === 'DOCTOR' ? 'Dokter' : 'Terapis'}</p>
                  <p className="text-[11px] font-bold text-[#2D6A4F] mt-0.5">{emp.patientCount} Pasien Ditangani</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Riwayat Transaksi */}
        <section className="print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#C2A058] text-[24px]">receipt_long</span>
            <h3 className="font-headline-md text-[#C2A058] font-bold border-b border-[#D4AF37]/30 pb-1 flex-1">10 Transaksi Terbaru</h3>
          </div>
          <div className="bg-[#FFFDF9] rounded-xl border border-[#D4AF37]/20 overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#FBE4A0]/20 border-b border-[#D4AF37]/20">
                <tr>
                  <th className="px-4 py-3 font-bold text-[#A89467] uppercase">Waktu</th>
                  <th className="px-4 py-3 font-bold text-[#A89467] uppercase">Faktur</th>
                  <th className="px-4 py-3 font-bold text-[#A89467] uppercase">Pasien</th>
                  <th className="px-4 py-3 font-bold text-[#A89467] uppercase">Layanan / Produk</th>
                  <th className="px-4 py-3 font-bold text-[#A89467] uppercase text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {recentTx.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-4 text-center text-[#7D7058]">Belum ada transaksi.</td></tr>
                ) : recentTx.map((tx) => {
                  const time = new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                  const servicesList = tx.items?.filter((i: any) => i.itemType === 'SERVICE') || [];
                  const productsList = tx.items?.filter((i: any) => i.itemType === 'PRODUCT') || [];
                  
                  return (
                    <tr key={tx.id}>
                      <td className="px-4 py-3 text-[#7D7058] whitespace-nowrap">{time}</td>
                      <td className="px-4 py-3 font-mono text-[#7D7058]">{tx.invoiceId}</td>
                      <td className="px-4 py-3 font-bold text-[#3E3626]">{tx.patient?.name || 'Umum'}</td>
                      <td className="px-4 py-3 text-[#3E3626]">
                        {servicesList.length > 0 ? servicesList.map((s: any) => s.service?.name || s.itemName).join(', ') : 'Produk Saja'}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#3E3626] text-right">{formatCurrency(Number(tx.totalAmount || 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 mt-8 border-t border-[#D4AF37]/20 text-center print:pt-4 print:mt-auto">
          <p className="text-[10px] text-[#A89467] uppercase tracking-[0.1em]">Laporan ini digenerate secara otomatis oleh Sistem ERP Sunrise Clinic.</p>
        </div>
      </div>
    </div>
    </>
  );
}
