import Link from 'next/link';
import { Building2, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 size={24} className="text-purple-500" />
              <span className="font-bold text-xl gradient-text">UrbanPlan</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 mb-4">
              Transforming urban planning with innovative solutions for smarter, more sustainable cities.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-purple-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-purple-500 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-purple-500 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Compliance Reports</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Grievance Upload</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Optimal Zoning</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Urban Analysis</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} UrbanPlan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
