import React, { useState, useEffect, useCallback } from 'react';
import { BiSearch, BiRightArrowAlt, BiInfoCircle, BiSolidBookContent, BiFileBlank, BiX } from 'react-icons/bi';
import { API_BASE } from '../../config/api';

const LandingCourses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    
    // Modal State
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [loadingCurriculum, setLoadingCurriculum] = useState(false);

    // Fetch all courses
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/database/courses.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: "searchCourse",
                    // We want all active courses, so we can filter by status 'Active' if needed, 
                    // or just fetch all and filter client side. 
                    // Let's explicitly ask for Active status if the API supports it via params, 
                    // otherwise just fetch generic.
                    // Based on courses.php, searchCourse supports category/subCategory logic.
                    // Let's just fetch all by sending nothing or empty filters, then filter client side or trust the API.
                })
            });
            const data = await response.json();
            // searchCourse returns { records: [], total: ... }
            const rawCourses = data.records || (Array.isArray(data) ? data : []);
            
            // Filter for Available courses only
            const activeCourses = rawCourses.filter(c => c.course_status === "Available");
            
            setCourses(activeCourses);
            setFilteredCourses(activeCourses);
        } catch (error) {
            console.error("Error fetching courses:", error);
            // Optional: Set some error state to display to user
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Curriculum for Selected Course
    const fetchCurriculum = useCallback(async (courseCode) => {
        setLoadingCurriculum(true);
        try {
            const response = await fetch(`${API_BASE}/database/curriculums.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: "getCourseCurriculum",
                    course_code: courseCode
                })
            });
            const data = await response.json();
            setCurriculum(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching curriculum:", error);
        } finally {
            setLoadingCurriculum(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (selectedCourse) {
            fetchCurriculum(selectedCourse.course_code);
        }
    }, [selectedCourse, fetchCurriculum]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = courses.filter(course => 
            course.course_code.toLowerCase().includes(lowerSearch) || 
            course.course_title.toLowerCase().includes(lowerSearch) ||
            (course.course_description && course.course_description.toLowerCase().includes(lowerSearch))
        );
        setFilteredCourses(filtered);
        setVisibleCount(6); // Reset to first page on search
    }, [searchTerm, courses]);

    const visibleCourses = filteredCourses.slice(0, visibleCount);
    const hasMore = visibleCount < filteredCourses.length;

    // Group curriculum by Year Level and Semester
    const groupedCurriculum = curriculum.reduce((acc, curr) => {
        const key = `${curr.year_level} - ${curr.semester}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    // Helper for Total Units per block
    const getTotalUnits = (items) => items.reduce((sum, item) => sum + Number(item.units), 0);

    return (
        <section id="courses" className="py-24 bg-gray-50 relative">
             <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                     <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Academic Programs</span>
                    <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6">Explore Our Courses</h2>
                    <p className="text-lg text-gray-500">Discover the wide range of academic programs we offer to shape your future.</p>
                
                    {/* Search Bar */}
                    <div className="mt-8 relative max-w-xl mx-auto">
                        <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                        <input 
                            type="text" 
                            placeholder="Search for courses..." 
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                     <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                     </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visibleCourses.length > 0 ? (
                            visibleCourses.map((course) => (
                                <div 
                                    key={course.course_id} 
                                    onClick={() => setSelectedCourse(course)}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-full tracking-wide">
                                                {course.category}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {course.course_code}
                                        </h3>
                                        <p className="text-gray-600 font-medium mb-4 line-clamp-2">
                                            {course.course_title}
                                        </p>
                                         <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                                            {course.course_description || "No description available."}
                                        </p>
                                        <div className="flex items-center text-blue-600 font-semibold text-sm mt-auto">
                                            View Curriculum <BiRightArrowAlt className="ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="col-span-full text-center py-12 text-gray-500">
                                <BiSearch className="text-5xl mb-4 text-gray-300" />
                                <p>No courses found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>

                    {/* Show More Button */}
                    {hasMore && (
                        <div className="flex justify-center mt-10">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 6)}
                                className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                            >
                                Show More ({Math.min(6, filteredCourses.length - visibleCount)} more)
                            </button>
                        </div>
                    )}
                    </>
                )}
             </div>

             {/* Course Detail Modal */}
             {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCourse(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">
                                        {selectedCourse.category}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedCourse.course_code}</h2>
                                </div>
                                <p className="text-lg text-gray-600">{selectedCourse.course_title}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedCourse(null)}
                                className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors shadow-sm border border-gray-200"
                            >
                                <BiX className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                            {selectedCourse.course_description && (
                                <div className="mb-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <BiInfoCircle /> About this Program
                                    </h4>
                                    <p className="text-blue-800/80 leading-relaxed text-sm md:text-base">
                                        {selectedCourse.course_description}
                                    </p>
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <BiSolidBookContent className="text-blue-600" /> Curriculum Prospectus
                            </h3>

                            {loadingCurriculum ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : Object.keys(groupedCurriculum).length > 0 ? (
                                <div className="space-y-8">
                                    {Object.entries(groupedCurriculum).sort().map(([semester, subjects]) => (
                                        <div key={semester} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800">{semester}</h4>
                                                <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                                    Total Units: {getTotalUnits(subjects)}
                                                </span>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {subjects.map((sub, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-blue-50/30 transition-colors grid grid-cols-12 gap-4 items-center">
                                                        <div className="col-span-3 md:col-span-2 font-mono text-sm font-bold text-blue-600">
                                                            {sub.subject_code}
                                                        </div>
                                                        <div className="col-span-7 md:col-span-8">
                                                            <p className="font-semibold text-gray-900 text-sm md:text-base">{sub.subject_title}</p>
                                                            {sub.subject_description && (
                                                                <p className="text-xs text-gray-500 line-clamp-1 hidden md:block">{sub.subject_description}</p>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm font-medium text-gray-500">
                                                            {sub.units} Units
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <BiFileBlank className="text-4xl text-gray-300 mb-2" />
                                    <p className="text-gray-500">No curriculum data available for this course yet.</p>
                                </div>
                            )}
                        </div>

                         <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                            <button 
                                onClick={() => setSelectedCourse(null)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </section>
    );
};

export default LandingCourses;
