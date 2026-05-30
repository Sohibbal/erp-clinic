import { OwnerSideNavBar } from '../../features/owner/components/OwnerSideNavBar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex overflow-x-hidden print:overflow-visible print:block">
      <OwnerSideNavBar />
      <main className="ml-64 print:ml-0 flex-1 flex flex-col min-h-screen relative bg-white print:bg-white print:p-0 print:block">
        {children}
      </main>
    </div>
  );
}
