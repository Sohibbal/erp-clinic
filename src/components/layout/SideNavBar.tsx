'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SideNavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/kasir', icon: 'dashboard' },
    { name: 'Patients', href: '/kasir/patients', icon: 'person_book' },
    { name: 'Billing/Transactions', href: '/kasir/billing', icon: 'receipt_long' },
    { name: 'Inventory', href: '/kasir/inventory', icon: 'inventory_2' },
  ];

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen py-stack-lg bg-white/80 dark:bg-surface-container-low/80 backdrop-blur-2xl w-64 z-50">
      <div className="px-margin mb-stack-lg">
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Aura ERP</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Clinical Management</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/kasir' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={isActive 
                ? "bg-primary-container text-on-primary-container rounded-xl mx-2 my-1 px-4 py-3 flex items-center gap-3 active-nav-glow translate-x-1 duration-200" 
                : "text-on-surface-variant mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all duration-200"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-auto">
        <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-1">
          <div className="text-on-surface-variant px-4 py-2 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </div>
          <div className="text-on-surface-variant px-4 py-2 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">supervised_user_circle</span>
            <span className="font-label-md text-label-md">Switch Role</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
