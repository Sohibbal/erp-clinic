'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SideNavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/kasir', icon: 'dashboard' },
    { name: 'Transaksi', href: '/kasir/billing', icon: 'receipt_long' },
    { name: 'Stok Barang', href: '/kasir/inventory', icon: 'inventory_2' },
    { name: 'Beli Produk Satuan', href: '/kasir/retail', icon: 'point_of_sale' },
  ];

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen py-stack-lg bg-[#F7F0E7] border-r border-outline-variant/30 shadow-sm w-64 z-50 print:hidden">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-1">
          {/* Sunrise Sunburst Icon */}
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
            <p className="font-body-sm text-[10px] text-on-surface-variant tracking-[0.12em] uppercase">Healthy Skin & Anti Aging</p>
          </div>
        </div>
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
          <Link href="/login" className="text-on-surface-variant px-4 py-2 flex items-center gap-3 hover:bg-surface-container-high/50 rounded-xl transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">supervised_user_circle</span>
            <span className="font-label-md text-label-md">Ganti Peran</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
