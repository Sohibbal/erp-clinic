import { SideNavBar } from '../../components/layout/SideNavBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex print:bg-white">
      <SideNavBar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative print:ml-0 print:p-0 print:w-full">

        {children}
      </main>
    </div>
  );
}
