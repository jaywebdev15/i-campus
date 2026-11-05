import React from 'react';
import { BiSolidUserDetail, BiSolidGraduation, BiSolidVideos, BiSolidTimeFive } from 'react-icons/bi';

const FeatureCard = ({ icon, title, description, color }) => (
    <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
);

const LandingFeatures = () => {
    const features = [
        {
            icon: <BiSolidUserDetail />,
            title: "Student Profiling",
            description: "Comprehensive student records management with easy access to personal data, enrollment history, and academic performance.",
            color: "bg-blue-500"
        },
        {
            icon: <BiSolidGraduation />,
            title: "Grade Management",
            description: "Streamlined grading system for teachers with automated calculations and instant student visibility of results.",
            color: "bg-purple-500"
        },
        {
            icon: <BiSolidVideos />,
            title: "E-Learning Integration",
            description: "Built-in Learning Management System (LMS) for distributing lessons, quizzes, and tracking student progress remotely.",
            color: "bg-indigo-500"
        },
        {
            icon: <BiSolidTimeFive />,
            title: "Smart Attendance",
            description: "Hassle-free attendance tracking using QR code scanning technology for students and employees.",
            color: "bg-pink-500"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
             {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Key Features</span>
                    <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6">Everything You Need to Run Your Campus</h2>
                    <p className="text-lg text-gray-500">i-Campus provides powerful tools to streamline administrative tasks and enhance the learning experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingFeatures;
