import { ApotekerSideNavBar } from '../../features/apoteker/components/ApotekerSideNavBar';

export default function ApotekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex overflow-x-hidden">
      <ApotekerSideNavBar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative">

        {children}
      </main>
    </div>
  );
}
