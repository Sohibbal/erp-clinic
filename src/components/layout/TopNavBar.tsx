import Link from 'next/link';

export function TopNavBar() {
  return (
    <header className="bg-white/70 backdrop-blur-xl docked full-width top-0 z-50 border-b border-outline-variant/30 shadow-[0_10px_30px_-15px_rgba(183,110,121,0.08)] sticky w-full">
      <div className="flex justify-between items-center w-full px-margin h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-2 cursor-pointer hover:scale-95 duration-150 ease-in-out">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Aura Beauty</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-primary font-semibold border-b-2 border-primary pb-1 font-body-md text-body-md">Home</Link>
          <Link href="#features" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Features</Link>
          <Link href="#dashboard" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Dashboard</Link>
          <Link href="#roles" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Solutions</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary-container/80 transition-all">
            Book a Demo
          </button>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/40 rounded-lg transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button aria-label="Menu" className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/40 rounded-lg transition-all md:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
