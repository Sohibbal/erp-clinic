import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../features/landing/components/Hero';
import { Promo } from '../features/landing/components/Promo';
import { SocialMedia } from '../features/landing/components/SocialMedia';

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="flex-grow">
        <Hero />
        <Promo />
        <SocialMedia />
      </main>
      <Footer />
    </>
  );
}
