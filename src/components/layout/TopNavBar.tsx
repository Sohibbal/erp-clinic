"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function TopNavBar() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasPromo, setHasPromo] = useState(false);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const { getServices } = await import('@/actions/service');
        const allServices = await getServices();
        const promoServices = allServices.filter((s: any) => s.promotions && s.promotions.length > 0);
        setHasPromo(promoServices.length > 0);
      } catch (error) {
        console.error('Failed to fetch promos for navbar');
      }
    };
    fetchPromos();
    const intervalId = setInterval(fetchPromos, 3000);

    const handleScroll = () => {
      const sections = ['pricing', 'promo', 'social-media'];
      let currentSection = 'home';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section;
          }
        }
      }
      
      if (window.scrollY < 100) {
        currentSection = 'home';
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(intervalId);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Beranda', href: '/' },
    { id: 'pricing', label: 'Layanan', href: '#pricing' },
    ...(hasPromo ? [{ id: 'promo', label: 'Promo', href: '#promo' }] : []),
    { id: 'social-media', label: 'Sosial Media', href: '#social-media' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: { id: string, href: string }) => {
    setIsMobileMenuOpen(false);
    if (item.href.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.href === '/') {
      if (window.location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl docked full-width top-0 z-50 border-b border-outline-variant/30 shadow-[0_10px_30px_-15px_rgba(183,110,121,0.08)] sticky w-full">
      <div className="flex justify-between items-center w-full px-margin h-16 max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:scale-95 duration-150 ease-in-out" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo(0,0); }}>
          <svg className="w-12 h-auto text-primary" viewBox="10 15 80 42" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span className="font-headline-md text-headline-md font-bold text-[#22211D] tracking-wide leading-none" style={{ fontVariant: 'small-caps', letterSpacing: '0.08em' }}>SUNRISE</span>
            <span className="font-body-sm text-[10px] text-on-surface-variant tracking-[0.12em] uppercase leading-none mt-1">Healthy Skin & Anti Aging</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.href} 
                onClick={(e) => handleNavClick(e, item)}
                className={`font-body-md text-body-md transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'text-primary font-semibold border-b-2 border-primary pb-1' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Hamburger Button */}
          <button 
            aria-label="Menu" 
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/40 rounded-lg transition-all md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-lg flex flex-col py-4 px-margin z-40 animate-fade-in-up">
          {navItems.map((item) => (
            <Link 
              key={item.id} 
              href={item.href} 
              onClick={(e) => handleNavClick(e, item)}
              className={`font-body-lg text-body-lg py-3 px-4 rounded-xl transition-all duration-300 ${
                activeSection === item.id 
                  ? 'text-primary bg-primary-container/30 font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
