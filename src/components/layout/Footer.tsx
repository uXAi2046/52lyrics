import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-transparent py-12 mt-12 border-t border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary-500" fill="currentColor" />
            <span className="text-lg font-bold text-white">52lyrics</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <Link to="#" className="hover:text-white transition-colors">About Us</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Copyright</Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-600">
            © 2026 52lyrics. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
