import React from 'react';

const TestimonialCard = ({ name, role, quote, image }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-50 mb-6 shadow-sm">
             <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://ui-avatars.com/api/?name=" + name + "&background=random";
                }}
            />
        </div>
        <div className="mb-4">
            <i className='bx bxs-quote-left text-3xl text-blue-200'></i>
        </div>
        <p className="text-gray-600 italic mb-6 leading-relaxed">"{quote}"</p>
        <div>
            <h4 className="font-bold text-gray-900 text-lg">{name}</h4>
            <span className="text-sm text-blue-500 font-medium">{role}</span>
        </div>
    </div>
);

const LandingTestimonials = () => {
    const testimonials = [
        {
            name: "Dr. Sarah Johnson",
            role: "University Dean",
            quote: "i-Campus has completely revolutionized how we handle student records. The efficiency gains are immeasurable.",
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            name: "Mark Thompson",
            role: "IT Administrator",
            quote: "Security and reliability were our top concerns. i-Campus exceeded our expectations on both fronts.",
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            name: "Emily Chen",
            role: "Student President",
            quote: "The student portal is so easy to use. Checking grades and schedules has never been this convenient.",
            image: "https://randomuser.me/api/portraits/women/68.jpg"
        }
    ];

    return (
        <section id="testimony" className="py-24 bg-slate-900 text-white relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">Testimonials</span>
                    <h2 className="text-4xl font-extrabold mt-3 mb-6">What Our Community Says</h2>
                    <p className="text-lg text-slate-400">Trusted by leading educational institutions to deliver excellence.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <TestimonialCard key={index} {...t} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingTestimonials;
