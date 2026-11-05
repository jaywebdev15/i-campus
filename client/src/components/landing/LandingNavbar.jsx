import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiMenu, BiX } from 'react-icons/bi';
import { IMAGE_BASE } from '../../config/api';

const LandingNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const navLinks = [
        { name: "Home", target: "home" },
        { name: "About", target: "about" },
        { name: "Programs", target: "courses" },
        { name: "Enroll Now", path: "/online-registration", isLink: true },
        { name: "Services", target: "services" },
        { name: "Testimony", target: "testimony" },
        { name: "Contact", target: "contact" },
    ];

    const scrollToSection = (link) => {
        if (link.isLink) {
            navigate(link.path);
            setMobileMenuOpen(false);
            return;
        }
        const element = document.getElementById(link.target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Fallback to top if 'home'
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
        }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
                    <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="i-Campus" className="h-10 w-auto" />
                    <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                        i-Campus
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button 
                            key={link.name}
                            onClick={() => scrollToSection(link)}
                            className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                                scrolled ? 'text-gray-600' : 'text-white/80 hover:text-white'
                            } ${link.name === 'Enroll Now' ? 'bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700' : ''}`}
                        >
                            {link.name}
                        </button>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                        scrolled 
                            ? 'text-gray-600 hover:text-blue-600' 
                            : 'text-white/90 hover:text-white'
                    }`}>
                        Sign In
                    </Link>
                    <Link to="/register" className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                         scrolled 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-white text-blue-900 hover:bg-blue-50'
                    }`}>
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className={`md:hidden text-2xl ${scrolled ? 'text-gray-800' : 'text-white'}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <BiX /> : <BiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl flex flex-col p-4 gap-4 animate-fade-in-down max-h-[80vh] overflow-y-auto">
                     {navLinks.map((link) => (
                        <button 
                            key={link.name}
                            onClick={() => scrollToSection(link)}
                            className="text-left text-gray-600 font-medium py-3 px-2 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors border-b border-gray-50 last:border-0"
                        >
                            {link.name}
                        </button>
                    ))}
                    <div className="flex flex-col gap-3 mt-4 pb-4">
                        <Link to="/login" className="text-center px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="text-center px-4 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
