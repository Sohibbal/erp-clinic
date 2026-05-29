const PROMOS = [
  {
    id: 1,
    title: 'Radiant Skin Package',
    description: 'Complete facial rejuvenation including premium laser treatment, gold hydrating mask, and exclusive serum kit.',
    price: 'Rp 2.500k',
    theme: 'gold', // For styling differences
  },
  {
    id: 2,
    title: 'First Consultation Free',
    description: 'Get a comprehensive skin analysis and personalized treatment plan from our expert dermatologists at no cost.',
    price: 'Free',
    theme: 'dark',
  }
];

export function Promo() {
  return (
    <section className="py-24 bg-surface" id="promo">
      <div className="max-w-container-max mx-auto px-margin">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Exclusive Promotions</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Discover our curated packages and limited-time offers designed to enhance your clinical journey.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROMOS.map((promo, idx) => (
            <div 
              key={promo.id}
              className={`
                border rounded-3xl p-8 lg:p-12 relative overflow-hidden group animate-fade-in-up transition-all duration-500 hover:-translate-y-2 flex flex-col min-h-[400px]
                ${idx === 0 ? 'delay-100' : 'delay-200'}
                ${promo.theme === 'gold' 
                  ? 'bg-gradient-to-br from-[#F5F2EA] to-white border-[#D6C6A2]/50 shadow-[0_15px_40px_-15px_rgba(194,160,88,0.2)] hover:shadow-[0_25px_50px_-15px_rgba(194,160,88,0.3)]' 
                  : 'bg-[#22211D] border-white/10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_50px_-15px_rgba(194,160,88,0.2)]'
                }
              `}
            >
              {/* Giant WATERMARK */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none select-none transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 ${promo.theme === 'gold' ? 'opacity-[0.04]' : 'opacity-[0.03]'}`}>
                <span className={`font-display-lg text-[140px] lg:text-[180px] font-black uppercase tracking-tighter whitespace-nowrap leading-none ${promo.theme === 'gold' ? 'text-[#C2A058]' : 'text-white'}`}>
                  PROMO
                </span>
              </div>

              {/* Glowing Orb */}
              <div className={`
                absolute w-96 h-96 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700
                ${promo.theme === 'gold' ? '-right-32 -top-32 bg-[#C2A058]/20' : '-left-32 -bottom-32 bg-[#C2A058]/15'}
              `}></div>
              
              <div className="relative z-10 flex flex-col h-full flex-grow">
                <div className="mb-12">
                  <h3 className={`font-display-lg text-3xl md:text-4xl mb-4 leading-tight ${promo.theme === 'gold' ? 'text-[#22211D]' : 'text-white'}`}>
                    {promo.title}
                  </h3>
                  <p className={`font-body-lg text-lg max-w-sm ${promo.theme === 'gold' ? 'text-on-surface-variant' : 'text-[#DAD4C8]'}`}>
                    {promo.description}
                  </p>
                </div>
                
                <div className={`mt-auto pt-8 border-t ${promo.theme === 'gold' ? 'border-[#C2A058]/20' : 'border-white/10'}`}>
                  <div className="flex items-end justify-between">
                    <span className={`font-headline-lg text-5xl md:text-6xl font-bold tracking-tighter ${promo.theme === 'gold' ? 'text-[#C2A058]' : 'text-white'}`}>
                      {promo.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
