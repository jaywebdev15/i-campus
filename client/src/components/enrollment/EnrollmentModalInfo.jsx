import React, { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, IMAGE_BASE } from '../../config/api';
import { BiPrinter } from "react-icons/bi";
import { getAge } from '../../scripts/utility';
import { usePrint } from '../../context/PrinterContext';

const EnrollmentModalInfo = ({ enrollmentModalInfo, setEnrollmentModalInfo, enrolleeId, setEnrolleeId }) => {
  const [enrolleeCurriculums, setEnrolleeCurriculums] = useState([]);
  const refToPrint = useRef();
  const { handlePrint } = usePrint();

  const fetchEnrolleeCurriculum = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getEnrolleeCurriculumById", 
          enrollment_id: enrolleeId
        })
      });
      const data = await response.json();
      setEnrolleeCurriculums(data);
    } catch (error) {
      console.log("Error in fetching course curriculum", error);
    } 
  }, [enrolleeId]);

  useEffect(() => {
    if(enrolleeId) {
      fetchEnrolleeCurriculum();
    }
  }, [enrolleeId, fetchEnrolleeCurriculum]);

  const closeModal = () => {
    setEnrolleeId("");
    setEnrollmentModalInfo(false);
  };

  const student = enrolleeCurriculums[0] || {};
  const totalUnits = enrolleeCurriculums.reduce((sum, subject) => sum + Number(subject.units), 0);

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 transition-all duration-300 font-sans
                    ${enrollmentModalInfo ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/20' : 'opacity-0 pointer-events-none'}`}
         onClick={closeModal} // Close on backdrop click
    >
      <div className={`bg-white w-[95%] md:w-[80%] lg:w-[65%] xl:w-[50%] shadow-2xl rounded-sm overflow-hidden transform transition-all duration-500 relative
                      ${enrollmentModalInfo ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
           onClick={(e) => e.stopPropagation()} // Prevent close on modal click
      >
        {/* Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-800 w-full"></div>

        {/* Printable Area - Compacted Padding */}
        <div ref={refToPrint} className="p-6 md:p-8 relative bg-white text-gray-800">
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="Watermark" className="w-80 opacity-[0.03] grayscale" />
          </div>

          <div className="relative z-10">
            
            {/* Header - Compacted */}
            <div className="flex flex-col items-center mb-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="Logo" className="h-12 w-12 object-contain" />
                <div className="text-center">
                  <div className="text-[0.65rem] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">Republic of the Philippines</div>
                  <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-none">i-Campus Technological College</h1>
                  <p className="text-xs text-gray-600 mt-0.5">Guiguinto, Bulacan</p>
                </div>
              </div>
              <div className="mt-2 bg-gray-900 text-white px-4 py-0.5 text-xs font-bold tracking-[0.2em] uppercase rounded-sm">
                Certificate of Enrollment
              </div>
              <div className="absolute top-0 right-0 text-[0.65rem] text-gray-400">
                Reg. No: 1654545
              </div>
            </div>

            {/* Student Information - Compacted */}
            <div className="mb-4">
              <h2 className="text-[0.65rem] font-bold uppercase text-gray-400 tracking-wider mb-2 border-l-2 border-blue-600 pl-2">
                Student General Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Student Number</span>
                  <span className="font-semibold text-gray-900 text-sm">{student.student_number}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Course</span>
                  <span className="font-semibold text-gray-900">{student.course_title}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Name</span>
                  <span className="font-semibold text-gray-900 text-sm">{student.last_name}, {student.first_name} {student.middle_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Year Level & Semester</span>
                  <span className="font-semibold text-gray-900">{student.year_level} - {student.semester}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Gender</span>
                    <span className="font-semibold text-gray-900">{student.gender}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Age</span>
                    <span className="font-semibold text-gray-900">{getAge(student.date_of_birth)}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">School Year</span>
                  <span className="font-semibold text-gray-900">{student.school_year}</span>
                </div>
              </div>
            </div>

            {/* Enrolled Subjects Table - Compacted */}
            <div className="mb-4">
              <h2 className="text-[0.65rem] font-bold uppercase text-gray-400 tracking-wider mb-2 border-l-2 border-blue-600 pl-2">
                Enrolled Subjects
              </h2>
              <div className="overflow-x-auto border border-gray-200 rounded-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[0.65rem]">
                    <tr>
                      <th className="px-3 py-1.5 border-b border-gray-200">Date/Time</th>
                      <th className="px-3 py-1.5 border-b border-gray-200">Code</th>
                      <th className="px-3 py-1.5 border-b border-gray-200">Description</th>
                      <th className="px-3 py-1.5 border-b border-gray-200 text-center">Units</th>
                      <th className="px-3 py-1.5 border-b border-gray-200">Section</th>
                      <th className="px-3 py-1.5 border-b border-gray-200">Instructor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrolleeCurriculums.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">{subject.schedule || "TBA"}</td>
                        <td className="px-3 py-1.5 font-medium text-gray-900 whitespace-nowrap">{subject.subject_code}</td>
                        <td className="px-3 py-1.5 text-gray-800">{subject.subject_title}</td>
                        <td className="px-3 py-1.5 text-center text-gray-800">{subject.units}</td>
                        <td className="px-3 py-1.5 text-gray-600">{subject.section_code}</td>
                        <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">
                          {subject.teacher_firstname ? `${subject.teacher_firstname} ${subject.teacher_lastname}` : "TBA"}
                        </td>
                      </tr>
                    ))}
                    {enrolleeCurriculums.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-3 py-4 text-center text-gray-500 italic">No subjects enrolled.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-3 py-1.5 text-right font-bold text-gray-700 uppercase text-[0.65rem]">Total Units Enrolled</td>
                      <td className="px-3 py-1.5 text-center font-bold text-gray-900 border-t border-gray-200">{totalUnits}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer / Signatures - Compacted */}
            <div className="flex justify-between items-end mt-6 pt-4">
              <div className="text-center">
                 <div className="border-b border-gray-400 w-48 mb-1"></div>
                 <span className="text-[0.65rem] uppercase text-gray-500 tracking-wider">Registrar's Signature</span>
              </div>
              <div className="text-right text-[0.65rem] text-gray-400 italic">
                Generated internally by i-Campus System
              </div>
            </div>

          </div>
        </div>

        {/* Control Bar - Compacted */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={closeModal}
            className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
          <button 
            onClick={() => handlePrint(refToPrint)}
            className="px-4 py-1.5 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors duration-200 text-xs flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
          >
            <BiPrinter className='text-base' />
            Print Certificate
          </button>
        </div>

      </div>
    </div>
  )
}

export default EnrollmentModalInfo
