'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ApotekerSideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen py-stack-lg border-r bg-white/80 dark:bg-surface-container-low/80 backdrop-blur-2xl w-64 z-50">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Aura ERP</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Clinical Management</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <Link 
          href="/apoteker" 
          className={pathname === '/apoteker' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
          }
        >
          <span className="material-symbols-outlined">pending_actions</span>
          <span className="font-label-md text-label-md">Product Requests</span>
        </Link>
        <Link 
          href="/apoteker/inventory" 
          className={pathname === '/apoteker/inventory' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
          }
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-label-md text-label-md">Inventory</span>
        </Link>
      </nav>
      <div className="px-4 mt-auto space-y-2">
        <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-xl flex items-center justify-center gap-2 ambient-shadow active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Appointment
        </button>
        <div className="pt-4 border-t border-outline-variant/30">
          <Link href="#" className="text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
