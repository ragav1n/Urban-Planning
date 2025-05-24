'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-900/60 to-gray-900"></div>
      
      {/* Hero background image */}
      <div className="absolute inset-0 z-[-1]">
        <Image 
          src="https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg"
          alt="Modern city planning"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="opacity-40"
        />
      </div>
      
      {/* Content */}
      <div className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto lg:mx-0">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
                Urban Planning <span className="gradient-text">Reimagined</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-300 max-w-2xl">
                Revolutionizing the way cities are planned, developed, and experienced through cutting-edge technology and data-driven solutions.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/auth/sign-up">
                  <Button className="btn-primary group" size="lg">
                    Get Started
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button variant="outline" size="lg" className="border-purple-500/50 text-white hover:bg-purple-500/10">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <div className="w-1 h-16 relative overflow-hidden">
          <span className="absolute w-full bg-purple-500 h-1/3 animate-[scroll_1.5s_ease-in-out_infinite]"></span>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            top: -33%;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
