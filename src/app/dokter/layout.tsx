import { DokterSideNavBar } from '../../features/dokter/components/DokterSideNavBar';

export default function DokterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex">
      <DokterSideNavBar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        {/* TopNavBar */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-40 w-full shadow-[0_10px_30px_-15px_rgba(183,110,121,0.08)]">
          <div className="flex justify-between items-center w-full px-margin h-16 max-w-container-max mx-auto">
            <div className="flex items-center gap-stack-md">
              <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Doctor Management</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-primary-container/40 rounded-lg transition-all">
                <span className="material-symbols-outlined text-primary">settings</span>
              </button>
              <button className="p-2 hover:bg-primary-container/40 rounded-lg transition-all relative">
                <span className="material-symbols-outlined text-primary">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
                <div className="text-right">
                  <p className="font-label-md text-label-md text-on-surface font-bold">Dr. Elena Vance</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Lead Clinician</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">EV</div>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
