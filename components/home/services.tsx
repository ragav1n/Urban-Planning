'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, Upload, Map, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const services = [
    {
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      title: 'Compliance Report Generator',
      description: 'Automatically generate comprehensive compliance reports that align with local regulations and building codes, saving time and reducing errors.',
      cta: 'Generate Reports'
    },
    {
      icon: <Upload className="h-10 w-10 text-purple-500" />,
      title: 'Grievance Uploading',
      description: 'Streamlined system for citizens to submit urban planning grievances, with automatic routing to relevant departments and real-time status tracking.',
      cta: 'Submit Grievance'
    },
    {
      icon: <Map className="h-10 w-10 text-purple-500" />,
      title: 'Optimal Zoning',
      description: 'AI-powered zoning recommendations that optimize land use based on multiple factors including economic potential, environmental impact, and community needs.',
      cta: 'Explore Zoning'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section id="services" className="section-container" ref={ref}>
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">Our <span className="gradient-text">Services</span></h2>
        <p className="max-w-2xl mx-auto text-gray-400">
          Comprehensive urban planning tools designed to streamline processes, ensure compliance, and optimize urban development.
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {services.map((service, index) => (
          <motion.div key={index} variants={itemVariants} className="card p-6 lg:p-8 flex flex-col h-full">
            <div className="bg-gray-800/70 p-3 rounded-lg w-fit mb-5">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
            <p className="text-gray-400 mb-6 flex-grow">{service.description}</p>
            <Link href="#">
              <Button variant="ghost" className="group text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-0">
                <span>{service.cta}</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mt-20 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 lg:p-12 border border-purple-500/20"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">Ready to transform your urban planning process?</h3>
          <p className="text-gray-300 mb-8">
            Join municipalities and urban planners worldwide who are using UrbanPlan to create more efficient, sustainable cities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="btn-primary">Get Started Today</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-purple-500/50 text-white hover:bg-purple-500/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Services;
