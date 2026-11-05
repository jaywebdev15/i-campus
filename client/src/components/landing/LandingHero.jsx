import React from 'react';
import { Link } from 'react-router-dom';
import { BiQrScan, BiSolidDashboard } from 'react-icons/bi';

const LandingHero = ({ onOpenScanner }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center text-white pt-20">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm animate-fade-in-up">
                    <span className="text-blue-300 font-semibold tracking-wider text-xs uppercase">Welcome to the future of education</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-in-up animation-delay-100">
                    Manage Your Campus <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
                        With Confidence
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-blue-100/80 mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
                    Experience an all-in-one solution for student profiling, grading, e-learning, and attendance tracking. Designed for modern institutions.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
                        Login Now
                    </Link>
                    <button 
                        onClick={onOpenScanner}
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white font-bold text-lg transition-all hover:-translate-y-1 group flex items-center justify-center"
                    >
                        <BiQrScan className="mr-2 group-hover:rotate-12 transition-transform text-xl" />
                        Scan Attendance
                    </button>
                </div>

                {/* Dashboard Preview / Floating UI Mockup */}
                <div className="mt-20 relative mx-auto max-w-5xl rounded-t-3xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden animate-fade-in-up animation-delay-500 opacity-90">
                     <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                     </div>
                     {/* Placeholder for dashboard screenshot or abstract representation */}
                     <div className="pt-10 pb-20 px-8 flex flex-col items-center justify-center min-h-[300px] text-white/30">
                        <BiSolidDashboard className="text-9xl mb-4 opacity-50" />
                        <span className="uppercase tracking-widest font-semibold">Interactive Dashboard</span>
                     </div>
                     
                     {/* Gradient Overlay for Fade Effect at bottom */}
                     <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default LandingHero;
