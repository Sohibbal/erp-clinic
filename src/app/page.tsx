import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../features/landing/components/Hero';
import { Features } from '../features/landing/components/Features';
import { DashboardShowcase } from '../features/landing/components/DashboardShowcase';

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <DashboardShowcase />
      </main>
      <Footer />
    </>
  );
}
