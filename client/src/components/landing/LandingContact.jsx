import React from 'react';

const LandingContact = () => {
    return (
        <section id="contact" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                 <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Contact Us</span>
                    <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6">Get in Touch</h2>
                    <p className="text-lg text-gray-500">Have questions? We're here to help you transform your campus management.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-8">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                <i className='bx bxs-map text-2xl'></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">Our Location</h4>
                                <p className="text-gray-500">123 Education Ave, Tech City, Philippines</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                <i className='bx bxs-envelope text-2xl'></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">Email Us</h4>
                                <p className="text-gray-500">support@i-campus.edu</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                <i className='bx bxs-phone text-2xl'></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">Call Us</h4>
                                <p className="text-gray-500">+63 912 345 6789</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="w-full lg:w-2/3 bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                    <input type="text" placeholder="John Doe" className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                    <input type="email" placeholder="john@example.com" className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Subject</label>
                                <input type="text" placeholder="Inquiry about..." className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Message</label>
                                <textarea rows="4" placeholder="How can we help you?" className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"></textarea>
                            </div>
                            <button type="submit" className="self-start px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingContact;
