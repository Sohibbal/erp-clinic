export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-24 overflow-hidden bg-gradient-to-b from-surface-container-lowest to-surface-container-low">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary-container/20 rounded-full blur-[100px] opacity-70"></div>
      </div>
      <div className="w-full max-w-container-max mx-auto px-8 md:px-16 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
          <div className="flex flex-col gap-stack-lg">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-outline-variant/30 px-4 py-2 rounded-full w-fit animate-fade-in-up">
              <span className="material-symbols-outlined text-primary text-sm">stars</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Klinik Estetika & Kecantikan Premium</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background lg:text-[56px] lg:leading-[64px] animate-fade-in-up delay-100">
              Temukan Versi Terbaik Diri Anda di <span className="text-primary">Sunrise Clinic</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl animate-fade-in-up delay-200">
              Rasakan pengalaman perawatan estetika mewah dan profesional. Kami hadir dengan teknologi terkini dan tenaga ahli terbaik untuk memancarkan kecantikan alami serta memberikan kenyamanan paripurna bagi Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up delay-300">
              {/* UBAH LINK 'href' DI BAWAH INI DENGAN URL GOOGLE MAPS ASLI ANDA */}
              <a
                href="https://maps.app.goo.gl/D8E2PEgceUi2zgtC6"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#22211D] text-[#F5F2EA] font-headline-sm text-headline-sm px-8 py-4 rounded-xl hover:bg-[#33312a] transition-colors shadow-sm flex items-center justify-center gap-2 hover:-translate-y-1 duration-300"
              >
                Lokasi
                <span className="material-symbols-outlined">location_on</span>
              </a>
            </div>
          </div>
          <div className="relative mt-12 lg:mt-0 animate-fade-in-up delay-200">
            {/* Glassmorphism Container for Image */}
            <div className="relative bg-white/40 backdrop-blur-2xl border border-outline-variant/50 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(183,110,121,0.15)] animate-float">
              {/* Note: using standard img to avoid next/image domain configuration issues for now */}
              {/* UBAH LINK 'src' DI BAWAH INI UNTUK MENGGANTI FOTO. UKURAN REKOMENDASI: 500x500px atau rasio portrait (misal 600x800px) */}
              <img alt="Professional Clinician" className="rounded-xl w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0mp_su-pYDap0dNetQmRqsARWNG6EGlA3USBujtAgUkbR1fLjIuey6W0srKR5PjgpBE7ZBb3E3dqttWO2c9vc8J--Jkh_4iN66JuMSp_J4saldKvSb06gOqD_-8RHF2i7pgmX-dY-0wF5Shzt2VtozdD6QQYJrAUzeNxZN_7ea1tN3o9qyxUksCgfMlMtXKUO_NrFrYaoQRZEsX9TJJ6dbDgOBmQO6eXo3OOpxfWF0byAccDZ01dozNeDBQ-xVrgIATO5E_moMjqW" />
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl border border-outline-variant/30 p-6 rounded-xl shadow-lg flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <p className="font-headline-md text-headline-md text-on-background">dr. Popi Novia</p>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Spesialis Dokter Kecantikan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
