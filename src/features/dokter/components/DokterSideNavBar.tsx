'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DokterSideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen py-stack-lg bg-white/80 dark:bg-surface-container-low/80 backdrop-blur-2xl w-64 z-50">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stethoscope</span>
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Aura ERP</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Clinical Management</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <Link 
          href="/dokter" 
          className={pathname === '/dokter' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
          }
        >
          <span className="material-symbols-outlined">clinical_notes</span>
          <span className="font-label-md text-label-md">Workspace</span>
        </Link>
        <Link 
          href="/dokter/patients" 
          className={pathname === '/dokter/patients' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
          }
        >
          <span className="material-symbols-outlined">person_search</span>
          <span className="font-label-md text-label-md">Patient Records</span>
        </Link>
        <Link 
          href="/dokter/treatments" 
          className={pathname === '/dokter/treatments' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
          }
        >
          <span className="material-symbols-outlined">medical_services</span>
          <span className="font-label-md text-label-md">Treatments</span>
        </Link>
        <Link 
          href="/dokter/schedule" 
          className={pathname === '/dokter/schedule' 
            ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 duration-200"
            : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
          }
        >
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-label-md text-label-md">Schedule</span>
        </Link>
      </nav>
      <div className="px-4 mt-auto space-y-2">
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
