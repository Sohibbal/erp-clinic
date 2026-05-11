export function DashboardShowcase() {
  return (
    <section className="py-24 bg-surface-container-lowest overflow-hidden" id="dashboard">
      <div className="max-w-container-max mx-auto px-margin text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">A Workspace That Breathes</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Reduce cognitive load with our glassmorphic, minimalist interface designed for focus and clarity.</p>
      </div>
      <div className="max-w-5xl mx-auto px-margin relative">
        {/* Abstract background elements for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-secondary-container/20 rounded-[100px] blur-[80px] -z-10"></div>
        {/* Dashboard Mockup Frame */}
        <div className="bg-white/80 backdrop-blur-2xl border border-outline-variant/40 rounded-2xl shadow-[0_30px_60px_-20px_rgba(183,110,121,0.15)] overflow-hidden flex flex-col h-[600px]">
          {/* Mockup Header */}
          <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 bg-surface-container-low/50">
            <div className="w-3 h-3 rounded-full bg-error-container"></div>
            <div className="w-3 h-3 rounded-full bg-surface-dim"></div>
            <div className="w-3 h-3 rounded-full bg-primary-container"></div>
          </div>
          {/* Mockup Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Mock Sidebar */}
            <div className="w-48 border-r border-outline-variant/30 p-4 flex flex-col gap-2 bg-surface-container-lowest/50 hidden sm:flex">
              <div className="h-8 bg-surface-variant/50 rounded animate-pulse mb-4"></div>
              <div className="h-6 bg-primary-container/40 rounded w-full"></div>
              <div className="h-6 bg-surface-variant/30 rounded w-5/6"></div>
              <div className="h-6 bg-surface-variant/30 rounded w-4/5"></div>
              <div className="h-6 bg-surface-variant/30 rounded w-full"></div>
            </div>
            {/* Mock Main Content */}
            <div className="flex-1 p-6 bg-background/50 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-surface-variant/40 rounded"></div>
                <div className="h-8 w-24 bg-primary-container/50 rounded-full"></div>
              </div>
              {/* Bento Grid inside Mockup */}
              <div className="grid grid-cols-3 gap-4 h-32">
                <div className="bg-white/60 border border-outline-variant/20 rounded-xl p-4 flex flex-col justify-center">
                  <div className="h-4 w-1/2 bg-surface-variant/40 rounded mb-2"></div>
                  <div className="h-6 w-3/4 bg-primary/20 rounded"></div>
                </div>
                <div className="bg-white/60 border border-outline-variant/20 rounded-xl p-4 flex flex-col justify-center">
                  <div className="h-4 w-1/2 bg-surface-variant/40 rounded mb-2"></div>
                  <div className="h-6 w-2/3 bg-secondary/20 rounded"></div>
                </div>
                <div className="bg-white/60 border border-outline-variant/20 rounded-xl p-4 flex flex-col justify-center">
                  <div className="h-4 w-1/2 bg-surface-variant/40 rounded mb-2"></div>
                  <div className="h-6 w-4/5 bg-tertiary/20 rounded"></div>
                </div>
              </div>
              {/* Mock Table Area */}
              <div className="flex-1 bg-white/60 border border-outline-variant/20 rounded-xl p-4 flex flex-col gap-3">
                <div className="h-6 w-full bg-surface-variant/30 rounded"></div>
                <div className="h-6 w-full bg-surface-variant/20 rounded"></div>
                <div className="h-6 w-full bg-surface-variant/20 rounded"></div>
                <div className="h-6 w-full bg-surface-variant/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
