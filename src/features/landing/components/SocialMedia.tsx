'use client';

import { useState, useEffect, useRef } from 'react';

export function SocialMedia() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={sectionRef} className="min-h-screen py-24 bg-surface flex items-center overflow-hidden" id="social-media">
      <div className={`max-w-container-max mx-auto px-margin w-full transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display-md text-on-background mb-6">Hubungi Kami</h2>
          <p className="text-xl md:text-2xl font-body-lg text-on-surface-variant max-w-3xl mx-auto">Ikuti perjalanan kami dan dapatkan informasi terbaru seputar inovasi perawatan dan kecantikan eksklusif.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Instagram */}
          <a href="https://www.instagram.com/sunrisehealthyskin/" target="_blank" rel="noopener noreferrer" className={`bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group duration-700 hover:-translate-y-2 flex flex-col items-center text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '100ms' }}>
            <div className="w-16 h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Instagram</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">@sunrise.clinic</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Ikuti Kami</span>
          </a>

          {/* TikTok */}
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={`bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group duration-700 hover:-translate-y-2 flex flex-col items-center text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '200ms' }}>
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">TikTok</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">@sunrise.clinic</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Tonton Video</span>
          </a>

          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group duration-700 hover:-translate-y-2 flex flex-col items-center text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '300ms' }}>
            <div className="w-16 h-16 bg-[#1877F2] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Facebook</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Sunrise Clinic</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Ikuti Kami</span>
          </a>

          {/* WhatsApp */}
          <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className={`bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group duration-700 hover:-translate-y-2 flex flex-col items-center text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '400ms' }}>
            <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">WhatsApp</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">082364381302</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Mulai Chat</span>
          </a>
        </div>
      </div>
    </section>
  );
}
