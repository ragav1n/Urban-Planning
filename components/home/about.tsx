'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Package, Award, Users } from 'lucide-react';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  const stats = [
    { icon: <Package className="text-purple-500 h-6 w-6" />, value: '10+', label: 'Years Experience' },
    { icon: <Award className="text-purple-500 h-6 w-6" />, value: '200+', label: 'Projects Completed' },
    { icon: <Users className="text-purple-500 h-6 w-6" />, value: '50+', label: 'City Partnerships' }
  ];

  return (
    <section id="about" className="section-container" ref={ref}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Image Column */}
        <motion.div 
          className="relative rounded-xl overflow-hidden shadow-2xl"
          initial="hidden"
          animate={controls}
          variants={fadeIn}
          custom={0}
        >
          <div className="aspect-w-4 aspect-h-3 relative">
            <Image 
              src="https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg"
              alt="Urban planning team collaboration"
              width={600}
              height={450}
              className="object-cover rounded-xl"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60"></div>
        </motion.div>
        
        {/* Content Column */}
        <div className="space-y-8">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold"
            initial="hidden"
            animate={controls}
            variants={fadeIn}
            custom={1}
          >
            About <span className="gradient-text">UrbanPlan</span>
          </motion.h2>
          
          <motion.p 
            className="text-gray-300 leading-relaxed"
            initial="hidden"
            animate={controls}
            variants={fadeIn}
            custom={2}
          >
            Founded on the belief that urban planning should be accessible, efficient, and data-driven, UrbanPlan is 
            revolutionizing how cities develop and evolve. Our mission is to empower urban planners, local governments, 
            and communities with cutting-edge tools that simplify complex planning processes.
          </motion.p>
          
          <motion.p 
            className="text-gray-300 leading-relaxed"
            initial="hidden"
            animate={controls}
            variants={fadeIn}
            custom={3}
          >
            We combine deep expertise in urban planning with advanced technology to create solutions that promote sustainable, 
            equitable, and resilient urban development. Our team of urban planners, data scientists, and software engineers 
            work together to build tools that address real-world challenges in urban planning.
          </motion.p>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4"
            initial="hidden"
            animate={controls}
            variants={fadeIn}
            custom={4}
          >
            {stats.map((stat, index) => (
              <div key={index} className="card p-4 flex flex-col items-center text-center">
                <div className="mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
