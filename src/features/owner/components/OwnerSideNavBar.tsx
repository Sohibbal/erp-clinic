'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function OwnerSideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen py-stack-lg bg-white/80 dark:bg-surface-container-low/80 backdrop-blur-2xl w-64 z-50">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white">auto_awesome</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Aura Beauty</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Management Suite</p>
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
          <span className="font-label-md text-label-md">Analytics Dashboard</span>
        </Link>
        <Link 
          href="/owner/revenue" 
          className={pathname === '/owner/revenue' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="font-label-md text-label-md">Revenue</span>
        </Link>
        <Link 
          href="/owner/employees" 
          className={pathname === '/owner/employees' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">badge</span>
          <span className="font-label-md text-label-md">Employee Management</span>
        </Link>
        <Link 
          href="/owner/services" 
          className={pathname === '/owner/services' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">account_tree</span>
          <span className="font-label-md text-label-md">Service-Product Mapping</span>
        </Link>
        <Link 
          href="/owner/settings" 
          className={pathname === '/owner/settings' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
      </nav>

      <div className="px-4 mb-stack-lg">
        <button className="w-full bg-primary text-white font-label-md py-3 rounded-xl shadow-lg hover:shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Global Reports
        </button>
      </div>

      <div className="border-t border-outline-variant/30 p-4 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold">JD</div>
          <div className="flex-1 overflow-hidden">
            <p className="font-label-md text-label-md text-on-surface truncate">Jane Doe</p>
            <p className="font-body-sm text-[10px] text-primary uppercase tracking-wider font-semibold">Clinic Owner</p>
          </div>
          <button className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
