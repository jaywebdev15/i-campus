import React from 'react';
import { BiSolidSchool, BiCheckShield, BiRightArrowAlt } from 'react-icons/bi';

const LandingAbout = () => {
    return (
        <section id="about" className="py-24 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Image/Visual Content */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-[400px] w-full flex items-center justify-center">
                                 <BiSolidSchool className="text-9xl text-white/20" />
                            </div>
                            <img 
                                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
                                alt="Campus Life" 
                                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay hover:opacity-80 transition-opacity duration-500"
                                onError={(e) => e.target.style.display = 'none'} // Fallback if external image blocked
                            />
                        </div>
                        {/* Floating Card */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-xs animate-bounce-slow hidden md:block">
                                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                    <BiCheckShield className="text-2xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Trusted System</h4>
                                    <p className="text-xs text-gray-500">Secure & Reliable</p>
                                </div>
                            </div>
                        </div>


                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">About Us</span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Empowering Institutions with <span className="text-blue-600">Smart Technology</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            i-Campus is dedicated to transforming the educational landscape by providing state-of-the-art management tools. We bridge the gap between traditional administration and modern efficiency.
                        </p>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Our mission is to simplify complex academic processes, from enrollment to grading, allowing educators to focus on what matters most: teaching and student development.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-extrabold text-gray-900">5k+</h3>
                                <p className="text-sm text-gray-500 font-medium">Students Managed</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-extrabold text-gray-900">99%</h3>
                                <p className="text-sm text-gray-500 font-medium">Uptime Guarantee</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <a href="#contact" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group">
                                Learn more about our story <BiRightArrowAlt className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingAbout;
