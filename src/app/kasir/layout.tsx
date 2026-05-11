import { SideNavBar } from '../../components/layout/SideNavBar';
import { TopAppBar } from '../../components/layout/TopAppBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex">
      <SideNavBar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative">
        <TopAppBar />
        {children}
      </main>
    </div>
  );
}
