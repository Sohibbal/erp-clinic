import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#22211D] text-white py-16 mt-auto w-full">
      <div className="w-full px-8 md:px-16 lg:px-24 flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand & Description */}
        <div className="flex flex-col gap-6 max-w-sm">
          <div className="flex items-center gap-3">
            <svg className="w-12 h-auto text-[#C2A058]" viewBox="10 15 80 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(50, 55)">
                {Array.from({ length: 17 }).map((_, i) => {
                  const angle = -180 + i * (180 / 16);
                  const rad = (angle * Math.PI) / 180;
                  const x1 = Math.cos(rad) * 18;
                  const y1 = Math.sin(rad) * 18;
                  const x2 = Math.cos(rad) * 38;
                  const y2 = Math.sin(rad) * 38;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" />;
                })}
                <path d="M -15 0 A 15 15 0 0 1 15 0" stroke="currentColor" strokeWidth="2.5" fill="none" />
              </g>
            </svg>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold text-white tracking-wide leading-none" style={{ fontVariant: 'small-caps', letterSpacing: '0.08em' }}>SUNRISE</span>
              <span className="font-body-sm text-[10px] text-[#D6C6A2] tracking-[0.12em] uppercase leading-none mt-1">Healthy Skin & Anti Aging</span>
            </div>
          </div>
          <p className="font-body-sm text-[#DAD4C8] leading-relaxed">
            Elevate your clinic's management with our seamless, premium software designed exclusively for high-end aesthetic clinics and spas.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
          <div className="flex flex-col gap-4">
            <h4 className="font-headline-sm text-sm font-semibold text-[#C2A058] uppercase tracking-wider">Product</h4>
            <Link href="#features" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Features</Link>
            <Link href="#dashboard" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Dashboard</Link>
            <Link href="#solutions" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Solutions</Link>
            <Link href="#pricing" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Pricing</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-headline-sm text-sm font-semibold text-[#C2A058] uppercase tracking-wider">Legal</h4>
            <Link href="#" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="#" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Terms of Service</Link>
            <Link href="#" className="font-body-sm text-[#DAD4C8] hover:text-white transition-colors duration-200">Cookie Policy</Link>
          </div>

          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <h4 className="font-headline-sm text-sm font-semibold text-[#C2A058] uppercase tracking-wider">Contact</h4>
            <p className="font-body-sm text-[#DAD4C8]">hello@sunriseclinic.com</p>
            <p className="font-body-sm text-[#DAD4C8]">+62 811 2345 6789</p>
            <p className="font-body-sm text-[#DAD4C8] mt-2">Jakarta, Indonesia</p>
          </div>
        </div>
      </div>

      <div className="w-full px-8 md:px-16 lg:px-24 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body-sm text-[#DAD4C8]/70">
          © {new Date().getFullYear()} Sunrise Clinic Management. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#DAD4C8] hover:bg-[#C2A058] hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-[20px]">language</span>
          </Link>
          <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#DAD4C8] hover:bg-[#C2A058] hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </Link>
          <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#DAD4C8] hover:bg-[#C2A058] hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
