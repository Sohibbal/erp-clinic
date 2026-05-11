export function Hero() {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-surface-container-lowest to-surface-container-low">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-container/20 rounded-full blur-[100px] opacity-70"></div>
      </div>
      <div className="max-w-container-max mx-auto px-margin relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
          <div className="flex flex-col gap-stack-lg">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-outline-variant/30 px-4 py-2 rounded-full w-fit">
              <span className="material-symbols-outlined text-primary text-sm">stars</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Enterprise Grade ERP</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background lg:text-[56px] lg:leading-[64px]">
              Elevate Your Clinic to <span className="text-primary">Enterprise Excellence</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Experience clinical luxury with our seamlessly integrated management software. Designed specifically for high-end aesthetic clinics and spas to streamline operations while maintaining a serene environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-primary-container text-on-primary-container font-headline-sm text-headline-sm px-8 py-4 rounded-xl hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center justify-center gap-2">
                Book a Demo
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="bg-transparent border border-secondary text-secondary font-headline-sm text-headline-sm px-8 py-4 rounded-xl hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2">
                View Pricing
              </button>
            </div>
          </div>
          <div className="relative mt-12 lg:mt-0">
            {/* Glassmorphism Container for Image */}
            <div className="relative bg-white/40 backdrop-blur-2xl border border-outline-variant/50 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(183,110,121,0.15)]">
              {/* Note: using standard img to avoid next/image domain configuration issues for now */}
              <img alt="Professional Clinician" className="rounded-xl w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0mp_su-pYDap0dNetQmRqsARWNG6EGlA3USBujtAgUkbR1fLjIuey6W0srKR5PjgpBE7ZBb3E3dqttWO2c9vc8J--Jkh_4iN66JuMSp_J4saldKvSb06gOqD_-8RHF2i7pgmX-dY-0wF5Shzt2VtozdD6QQYJrAUzeNxZN_7ea1tN3o9qyxUksCgfMlMtXKUO_NrFrYaoQRZEsX9TJJ6dbDgOBmQO6eXo3OOpxfWF0byAccDZ01dozNeDBQ-xVrgIATO5E_moMjqW" />
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl border border-outline-variant/30 p-6 rounded-xl shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="font-headline-md text-headline-md text-on-background">40%</p>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Efficiency Increase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
