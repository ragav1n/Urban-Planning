import Hero from '@/components/home/hero';
import About from '@/components/home/about';
import Services from '@/components/home/services';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="flex flex-col items-center">
          <Hero />
          <About />
          <Services />
        </div>
      </main>
      <Footer />
    </div>
  );
}
