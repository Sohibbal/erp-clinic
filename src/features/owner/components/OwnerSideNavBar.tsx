'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUserProfile } from '@/actions/auth';

export function OwnerSideNavBar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{name: string, initials: string, imageUrl?: string | null} | null>(null);

  useEffect(() => {
    getCurrentUserProfile('OWNER').then(data => {
      if (data) setProfile(data);
    });
  }, []);

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen py-stack-lg bg-[#F7F0E7] border-r border-outline-variant/30 shadow-sm w-64 z-50 print:hidden">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-1">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(50, 55)">
              {Array.from({ length: 17 }).map((_, i) => {
                const angle = -180 + i * (180 / 16);
                const rad = (angle * Math.PI) / 180;
                const x1 = Math.cos(rad) * 18;
                const y1 = Math.sin(rad) * 18;
                const x2 = Math.cos(rad) * 38;
                const y2 = Math.sin(rad) * 38;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C2A058" strokeWidth="2" />;
              })}
              <path d="M -15 0 A 15 15 0 0 1 15 0" stroke="#C2A058" strokeWidth="2.5" fill="none" />
            </g>
          </svg>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-[#22211D] tracking-wide" style={{ fontVariant: 'small-caps', letterSpacing: '0.08em' }}>SUNRISE</h1>
            <p className="font-body-sm text-[10px] text-on-surface-variant tracking-[0.12em] uppercase">Sistem Manajemen</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link 
          href="/owner" 
          className={pathname === '/owner' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md text-label-md">Dasbor Analitis</span>
        </Link>
        <Link 
          href="/owner/employees" 
          className={pathname === '/owner/employees' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">badge</span>
          <span className="font-label-md text-label-md">Manajemen Karyawan</span>
        </Link>
        <Link 
          href="/owner/payroll" 
          className={pathname === '/owner/payroll' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="font-label-md text-label-md">Penggajian Karyawan</span>
        </Link>
        <Link 
          href="/owner/services" 
          className={pathname === '/owner/services' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">account_tree</span>
          <span className="font-label-md text-label-md">Manajemen Layanan</span>
        </Link>
        <Link 
          href="/owner/revenue" 
          className={pathname === '/owner/revenue' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-label-md text-label-md">Riwayat Transaksi</span>
        </Link>
        <Link 
          href="/owner/inventory" 
          className={pathname === '/owner/inventory' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-label-md text-label-md">Stok Barang</span>
        </Link>
        <Link 
          href="/owner/settings" 
          className={pathname === '/owner/settings' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Pengaturan</span>
        </Link>
        <div className="px-4 mt-auto mb-4">
          <div className="pt-4 border-t border-outline-variant/30 space-y-1">
            <button 
              onClick={async () => {
                const { logout } = await import('@/actions/auth');
                await logout('OWNER');
                window.location.href = '/login';
              }}
              className="w-full text-left text-on-surface-variant px-4 py-2 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-label-md text-label-md">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 mb-stack-lg">
        <Link href="/owner/reports" className="w-full bg-primary text-white font-label-md py-3 rounded-xl shadow-lg hover:shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Laporan Global
        </Link>
      </div>

      <div className="border-t border-outline-variant/30 p-4 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold overflow-hidden border border-outline-variant/20 shrink-0">
            {profile?.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile?.initials || 'JD'
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-label-md text-label-md text-on-surface truncate">{profile?.name || 'Memuat...'}</p>
            <p className="font-body-sm text-[10px] text-primary uppercase tracking-wider font-semibold">Pemilik Klinik</p>
          </div>
          <button className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
