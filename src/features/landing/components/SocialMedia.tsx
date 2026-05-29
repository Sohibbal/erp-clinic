export function SocialMedia() {
  return (
    <section className="py-24 bg-surface" id="social-media">
      <div className="max-w-container-max mx-auto px-margin">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Connect With Us</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Follow our journey and stay updated with the latest in clinical luxury and aesthetic innovations.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group animate-fade-in-up delay-100 hover:-translate-y-2 duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">photo_camera</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Instagram</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">@sunrise.clinic</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Follow Us</span>
          </a>

          {/* TikTok */}
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group animate-fade-in-up delay-200 hover:-translate-y-2 duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">music_note</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">TikTok</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">@sunrise.clinic</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Watch Videos</span>
          </a>

          {/* WhatsApp */}
          <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl hover:shadow-[0_10px_30px_-15px_rgba(183,110,121,0.1)] transition-all group animate-fade-in-up delay-300 hover:-translate-y-2 duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">chat</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">WhatsApp</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">+62 811 2345 6789</p>
            <span className="text-primary font-label-md mt-auto group-hover:underline">Chat Now</span>
          </a>
        </div>
      </div>
    </section>
  );
}
