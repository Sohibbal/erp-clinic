export function TopAppBar() {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-40 print:hidden">
      <div className="flex justify-between items-center w-full px-margin h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-stack-md">
          <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Dashboard Resepsionis & Kasir</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-sm w-64 focus:ring-2 focus:ring-primary/20" placeholder="Cari faktur atau pasien..." type="text" />
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-primary-container/40 rounded-lg transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 hover:bg-primary-container/40 rounded-lg transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">history_toggle_off</span>
            </button>
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-primary-container">
            <img alt="Profil staf" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8VUauyyNLi6S31PCt07xE6O1EGMb8ftJtZlaCsqlGc2FGOtmbCg-_WOvYue2yPHhLr555rp9y31Pv1oigeAPCE4Y0mt9Pyc86AgFyEEifZlbxoE7ieCEjF83fetThMNq-rBXnpZFdDwyUYAQa-orPqJEvCUBNiLStCp8sqtLjjxziwUFNOspLq1xCJ88JrDhlDN9EcbhdcayoGGLYRamLPyp23pML57bE1h-MKKtO1yiyflMfbZDaGOzY2AaTCu9YJskaUtTSMaEv" />
          </div>
        </div>
      </div>
    </header>
  );
}
