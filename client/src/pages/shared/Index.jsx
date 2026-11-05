import React, { useState } from 'react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingCourses from '../../components/landing/LandingCourses';
import LandingAbout from '../../components/landing/LandingAbout';
import LandingTestimonials from '../../components/landing/LandingTestimonials';
import LandingContact from '../../components/landing/LandingContact';
import ScannerModal from '../../components/landing/ScannerModal';
import { IMAGE_BASE } from '../../config/api';

const Index = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50 flex flex-col">
       <LandingNavbar />
       
       <main className="flex-grow">
          <div id="home"><LandingHero onOpenScanner={() => setIsScannerOpen(true)} /></div>
          <div id="about"><LandingAbout /></div>
          <div id="courses"><LandingCourses /></div>
          <div id="services"><LandingFeatures /></div>
          <div id="testimony"><LandingTestimonials /></div>
          <div id="contact"><LandingContact /></div>
       </main>

       {/* Simple Footer */}
       <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="i-Campus" className="h-10 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
                  <span className="font-semibold text-slate-300">i-Campus</span>
              </div>
              <div className="text-sm">
                  &copy; {new Date().getFullYear()} i-Campus Student Management System. All rights reserved.
              </div>
          </div>
       </footer>

       <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};

export default Index;
