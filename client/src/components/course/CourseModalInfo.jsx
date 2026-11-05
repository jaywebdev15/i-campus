import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiX, BiBookOpen } from "react-icons/bi";

const CourseModalInfo = ({ courseModalInfo, setCourseModalInfo, courseCode, courseData }) => {
  const [courseCurriculums, setCourseCurriculums] = useState([]);

  const groupedCurriculums = courseCurriculums.reduce((acc, curr) => {
    const { year_level, semester } = curr;

    if (!acc[year_level]) acc[year_level] = {};
    if (!acc[year_level][semester]) acc[year_level][semester] = [];

    acc[year_level][semester].push(curr);

    return acc;
  }, {});

  const fetchCourseCurriculum = useCallback(async () => {
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
      setCourseCurriculums(data);
    } catch (error) {
      console.log("Error in fetching course curriculum", error);
    } 
  }, [courseCode]);

  useEffect(() => {
    if(courseCode) {
      fetchCourseCurriculum();
    }
  }, [courseCode, fetchCourseCurriculum]);
  
  const closeModal = () => setCourseModalInfo(false);

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-[100] transition-all duration-300 font-sans
                    ${courseModalInfo ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/40' : 'opacity-0 pointer-events-none'}`}
         onClick={closeModal}
    >
      <div className={`bg-white w-[95%] md:w-[85%] lg:w-[75%] xl:w-[60%] h-[90vh] md:h-[85vh] shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 relative flex flex-col
                      ${courseModalInfo ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
           onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-8 py-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
                {courseData?.course_code ? `${courseData.course_code} - ${courseData.course_title}` : courseCode}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
                {courseData?.course_description || "Detailed subject list by year and semester"}
            </p>
          </div>
          <button 
            onClick={closeModal}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
          >
            <BiX className='text-2xl' />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          <div className="flex flex-col gap-8">
            {Object.entries(groupedCurriculums).map(([year, semesters]) => (
              <div key={year} className="flex flex-col gap-4">
                
                {/* Year Header */}
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-indigo-900">{year}</h2>
                  <div className="h-px bg-indigo-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(semesters).map(([semester, subjects]) => (
                    <div key={semester} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      
                      {/* Semester Header */}
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{semester}</h3>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                          {subjects.reduce((sum, s) => sum + Number(s.units), 0)} Units
                        </span>
                      </div>

                      {/* Content Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white text-gray-500 font-semibold text-xs border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3 font-medium">Subject Code</th>
                              <th className="px-6 py-3 font-medium">Title</th>
                              <th className="px-6 py-3 font-medium text-center">Units</th>
                              <th className="px-6 py-3 font-medium text-right">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {subjects.map((subject, index) => (
                              <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-3 font-semibold text-gray-800 whitespace-nowrap group-hover:text-blue-700 transition-colors">
                                  {subject.subject_code}
                                </td>
                                <td className="px-6 py-3 text-gray-600">{subject.subject_title}</td>
                                <td className="px-6 py-3 text-center text-gray-700">{subject.units}</td>
                                <td className="px-6 py-3 text-right text-gray-700 font-medium">
                                  ₱{Number(subject.price).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50/50 text-gray-700 font-semibold text-sm">
                            <tr>
                              <td colSpan="2" className="px-6 py-3 text-right text-xs uppercase tracking-wide text-gray-500">Subtotal</td>
                              <td className="px-6 py-3 text-center text-indigo-700">
                                {subjects.reduce((sum, s) => sum + Number(s.units), 0)}
                              </td>
                              <td className="px-6 py-3 text-right text-indigo-700">
                                ₱{subjects.reduce((sum, s) => sum + Number(s.price), 0).toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {courseCurriculums.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <BiBookOpen className='text-6xl mb-4 opacity-20' />
                <p>No curriculum data available for this course.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-8 py-5 border-t border-gray-100 flex justify-between items-center shrink-0">
           <div className="text-sm text-gray-500">
              Total Units Required: <span className="font-bold text-gray-900">{courseCurriculums.reduce((sum, s) => sum + Number(s.units), 0)}</span>
           </div>
           <button 
              onClick={closeModal}
              className='bg-gray-900 text-white px-8 py-2.5 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-lg shadow-gray-200 transform active:scale-95'
            >
              Close Details
           </button>
        </div>

      </div>
    </div>
  )
}

export default CourseModalInfo
