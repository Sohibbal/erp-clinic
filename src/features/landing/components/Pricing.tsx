'use client';

import { useState, useEffect, useRef } from 'react';
import { getServices } from '@/actions/service';
import { formatCurrency } from '@/lib/utils';

export function Pricing() {
  const [pricingServices, setPricingServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isLoading || pricingServices.length === 0 || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isLoading, pricingServices.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allServices = await getServices();
        // Hanya tampilkan 6 layanan aktif yang tidak memiliki promo
        setPricingServices(allServices.filter((s: any) => s.isActive && (!s.promotions || s.promotions.length === 0)).slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch pricing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  if (!isLoading && pricingServices.length === 0) return null;
  if (isLoading && pricingServices.length === 0) return null;

  return (
    <section ref={sectionRef} className="min-h-screen py-24 bg-surface flex items-center overflow-hidden" id="pricing">
      <div className={`max-w-container-max mx-auto px-margin w-full transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-display-md text-on-background mb-6">Layanan Kami</h2>
          <p className="text-xl md:text-2xl font-body-lg text-on-surface-variant max-w-3xl mx-auto">Jelajahi berbagai layanan klinis premium yang dirancang khusus untuk kebutuhan Anda.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {pricingServices.map((service: any, idx: number) => {
            // idx % 2 !== 0 makes it Black first, then White (Gold)
            const isGold = idx % 2 !== 0;

            const productsInfo = service.description || 'Layanan premium untuk kesehatan dan kecantikan Anda.';

            return (
              <div
                key={service.id}
                className={`
                  w-full max-w-[400px] xl:max-w-[420px] border rounded-3xl p-6 lg:p-7 relative overflow-hidden group transition-all duration-700 hover:-translate-y-2 flex flex-col min-h-[460px]
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                  ${isGold
                    ? 'bg-gradient-to-br from-[#F5F2EA] to-white border-[#D6C6A2]/50 shadow-[0_15px_40px_-15px_rgba(194,160,88,0.2)] hover:shadow-[0_25px_50px_-15px_rgba(194,160,88,0.3)]'
                    : 'bg-[#22211D] border-white/10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_50px_-15px_rgba(194,160,88,0.2)]'
                  }
                `}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                {/* Giant WATERMARK */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none select-none transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 ${isGold ? 'opacity-[0.04]' : 'opacity-[0.03]'}`}>
                  <span className={`font-display-lg text-[100px] lg:text-[120px] font-black uppercase tracking-tighter whitespace-nowrap leading-none ${isGold ? 'text-[#C2A058]' : 'text-white'}`}>
                    PRICING
                  </span>
                </div>

                {/* Glowing Orb */}
                <div className={`
                  absolute w-72 h-72 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700
                  ${isGold ? '-right-24 -top-24 bg-[#C2A058]/20' : '-left-24 -bottom-24 bg-[#C2A058]/15'}
                `}></div>

                <div className="relative z-10 flex flex-col h-full flex-grow">
                  <div className="mb-8">
                    <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${isGold ? 'text-[#C2A058]' : 'text-white/70'}`}>
                      Layanan
                    </div>
                    <h3 className={`font-display-lg text-3xl md:text-4xl mb-3 leading-tight ${isGold ? 'text-[#22211D]' : 'text-white'}`}>
                      {service.name}
                    </h3>
                    <p className={`font-body-md text-base max-w-sm line-clamp-3 ${isGold ? 'text-on-surface-variant' : 'text-[#DAD4C8]'}`}>
                      {productsInfo}
                    </p>
                  </div>

                  <div className={`mt-auto pt-6 border-t ${isGold ? 'border-[#C2A058]/20' : 'border-white/10'}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`font-headline-lg text-4xl font-bold tracking-tighter ${isGold ? 'text-[#C2A058]' : 'text-white'}`}>
                        {formatCurrency(service.basePrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
