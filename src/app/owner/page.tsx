'use client';

import { useState } from 'react';
import { OWNER_STATS, DOCTORS } from '../../lib/mock-data';

const DATE_RANGES = [
  { label: '01 Okt 2023 - 31 Okt 2023', revenue: 124500, patients: 1284, change: '+12.5%' },
  { label: '01 Sep 2023 - 30 Sep 2023', revenue: 110700, patients: 1156, change: '+8.2%' },
  { label: '01 Ags 2023 - 31 Ags 2023', revenue: 102300, patients: 1089, change: '+5.1%' },
];

export default function OwnerDashboardPage() {
  const [rangeIdx, setRangeIdx] = useState(0);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const range = DATE_RANGES[rangeIdx];

  return (
    <div className="p-margin max-w-container-max mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Ringkasan Dasbor</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau performa klinik dan kesehatan bisnis Anda.</p>
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/50 hover:border-primary/50 transition-all"
            onClick={() => setShowRangeDropdown(!showRangeDropdown)}
          >
            <span className="material-symbols-outlined text-outline">calendar_today</span>
            <span className="font-label-md text-label-md text-on-surface">{range.label}</span>
            <span className="material-symbols-outlined text-outline">expand_more</span>
          </button>
          {showRangeDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/30 z-50 w-full min-w-[280px] overflow-hidden">
              {DATE_RANGES.map((r, idx) => (
                <button key={idx} className={`w-full text-left px-4 py-3 font-label-md text-label-md transition-colors ${rangeIdx === idx ? 'bg-primary-container text-on-primary-container' : 'hover:bg-surface-container-low text-on-surface-variant'}`} onClick={() => { setRangeIdx(idx); setShowRangeDropdown(false); }}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="glass-card ambient-shadow p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Total Pendapatan</p>
          <div className="flex items-end gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">Rp{(range.revenue * 15).toLocaleString()}</h3>
            <span className="text-primary font-label-md mb-1">{range.change}</span>
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
            <h3 className="font-headline-md text-headline-md text-on-surface">{range.patients.toLocaleString()}</h3>
            <span className="text-tertiary font-label-md mb-1">Aktif</span>
          </div>
          <div className="mt-4 flex -space-x-2">
            <img alt="Patient" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXIe9GtCRsVG640dSWRaQe45T_GGsF8OSDUbXaGnSG1Z65Y8mvNx7cnx7NFPO9ef03KUOoutCjp2s7UBNG8yxlNgaFIZdvbWnAJsTqYNv_NQxxTPJ2XDQ5WErruAXrnkfxz--c2WHUypyZ_vTj8zWQD9IezcERvLF_2iHP65mRxop1iuiMsBxDPco8CZSVu0cUR1C79ZArgB1ldCFacpM-Jq6ORu8GV6gtDM157UWzDw3n8pQbAVDO4RrEybnNn6u_SEh9H5ZVzb46"/>
            <img alt="Patient" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHyCKpNOGYW3G2WwgBW5SYJOJvPkbc45XTWggP6yp77iSjTqoMnHp6VgECQ7GfY49K9WwGwRKtns1bOiI2E4aGsJD1XY-woaovB-0K7RiqTN-G3t-bN81VYoaUBFGJOUFTV6bhp32h2WrRfh6p4IeYyLPmtotmZmV2TnG0J-NChZdB1W26OXPCZvWyNxJCOWlegBYeJr6tWVuFS6KUCbxrKafWW4sxC0fnHzxa-kQdbp3JJ4jsY44TWwTGzVTE-LkugPa_1fE2dxuK"/>
            <img alt="Patient" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfIgjTSQ7En8o5oss0uR22l9D9WqN0HBwWfw2dUDhyq_j3I1LFbku_ymTWGvQYKGJw9HuDvSQDydQGaTzYs6O6Q2nHxzJ2CzkpZjofYBGjJUH4vKZjrnzRhAaztrcqEwGzrWpQ83Hzahi-iIcqiyACZm4cjxBuOBPsB5S0pZgAOKTags5SQFk2MHr69PANRU0IKC5HE8CzCgnaKwxwMwFpjZEr3VpXjiB2f3af75JvQsp7Ud1T_0ZUraW8GFDlWxNLqcuHZG5XfkMn"/>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">+24</div>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Layanan Teratas</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">spa</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{OWNER_STATS.topService.name}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{OWNER_STATS.topService.sessions} sesi</p>
            </div>
          </div>
        </div>

        <div className="glass-card ambient-shadow p-6 rounded-2xl">
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Kesehatan Stok</p>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{OWNER_STATS.inventoryHealth}</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Semua item tersedia</span>
              </div>
            </div>
            <span className="material-symbols-outlined ml-auto text-outline-variant text-4xl">inventory_2</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <section className="glass-card ambient-shadow p-8 rounded-3xl mb-stack-lg">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-headline-md text-headline-md text-on-surface">Analitik Pendapatan</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span><span className="font-label-md text-label-md">Periode Saat Ini</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-outline-variant"></span><span className="font-label-md text-label-md">Periode Sebelumnya</span></div>
          </div>
        </div>
        <div className="relative h-64 w-full">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C2A058" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#C2A058" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <line stroke="#DFE6E9" strokeWidth="1" x1="0" x2="1000" y1="180" y2="180"></line>
            <line stroke="#DFE6E9" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="130" y2="130"></line>
            <line stroke="#DFE6E9" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="80" y2="80"></line>
            <line stroke="#DFE6E9" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="30" y2="30"></line>
            <path d="M0,180 C100,160 200,40 300,60 C400,80 500,140 600,120 C700,100 800,20 900,40 L1000,60 L1000,180 L0,180 Z" fill="url(#chartGradient)"></path>
            <path d="M0,180 C100,160 200,40 300,60 C400,80 500,140 600,120 C700,100 800,20 900,40 L1000,60" fill="none" stroke="#C2A058" strokeLinecap="round" strokeWidth="3"></path>
            <circle cx="300" cy="60" fill="#C2A058" r="4"></circle>
            <circle cx="900" cy="40" fill="#C2A058" r="4"></circle>
          </svg>
          <div className="flex justify-between mt-4 px-2 font-label-md text-label-md text-outline">
            <span>Minggu 1</span><span>Minggu 2</span><span>Minggu 3</span><span>Minggu 4</span>
          </div>
        </div>
      </section>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-stack-lg">
        <div className="glass-card ambient-shadow p-8 rounded-3xl">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Layanan Teratas per Pendapatan</h3>
          <div className="space-y-6">
            {OWNER_STATS.topServicesByRevenue.map((svc, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="font-body-md text-body-md text-on-surface">{svc.name}</span>
                  <span className="font-label-md text-label-md text-primary">${svc.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-secondary-container' : 'bg-tertiary-container'}`} style={{ width: `${svc.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card ambient-shadow p-8 rounded-3xl">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Performa Dokter</h3>
          <div className="space-y-4">
            {DOCTORS.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-3 hover:bg-primary-container/20 rounded-2xl transition-all">
                <img alt="Doctor" className="w-12 h-12 rounded-full object-cover" src={doc.imageUrl}/>
                <div className="flex-1">
                  <h4 className="font-body-md text-body-md font-semibold text-on-surface">{doc.name}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{doc.patientsSeen} Pasien ditangani</p>
                </div>
                <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md text-label-md">{doc.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="glass-card ambient-shadow rounded-3xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Transaksi Bernilai Tinggi Terbaru</h3>
          <button className="text-primary font-label-md flex items-center gap-2 hover:opacity-80">Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary-container/10 border-b border-outline-variant/30">
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nama Pasien</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Layanan</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Jumlah</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {OWNER_STATS.recentTransactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-primary-container/10 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-${tx.color}-container text-${tx.color} flex items-center justify-center font-bold text-xs`}>{tx.initials}</div>
                      <span className="font-body-md text-body-md text-on-surface">{tx.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-body-md text-body-md text-on-surface-variant">{tx.service}</td>
                  <td className="px-8 py-5 font-body-md text-body-md font-semibold text-primary">${tx.amount.toLocaleString()}.00</td>
                  <td className="px-8 py-5 text-right">
                    <span className="bg-green-100 text-green-700 font-label-md px-3 py-1 rounded-full">{tx.status}</span>
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
