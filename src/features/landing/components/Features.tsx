export function Features() {
  return (
    <section className="py-24 bg-surface" id="features">
      <div className="max-w-container-max mx-auto px-margin">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Designed for Clinical Luxury</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Everything you need to manage your high-end practice in one beautifully crafted ecosystem.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group">
            <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary text-[32px]">sync</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-3">Seamless Workflow</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Connect your reception, treatment rooms, and back office with zero friction. Patient journeys flow effortlessly from check-in to checkout.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group md:-translate-y-4">
            <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary text-[32px]">insights</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-3">Real-time Analytics</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Make informed decisions with elegant, easy-to-read dashboards. Track revenue, treatment popularity, and staff performance instantly.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group">
            <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary text-[32px]">medication</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-3">Integrated Pharmacy</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage inventory, handle prescriptions, and track high-value aesthetic products with precise stock control and automated reordering.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
