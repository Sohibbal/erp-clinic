import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 py-12 mt-auto">
      <div className="max-w-container-max mx-auto px-margin flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-background">Aura Beauty</span>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Contact</Link>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant/70">
          © {new Date().getFullYear()} Aura Beauty Management. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
