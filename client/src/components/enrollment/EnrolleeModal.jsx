import { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiX } from "react-icons/bi";
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertNewEnrollee } from '../../scripts/enrollments';
import { completeDateTime } from '../../scripts/utility';

const EnrolleeModal = ({ enrolleeData, setEnrolleeData, modal, setModal, fetchEnrollees, setEnrolleeId }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);


  const fetchCourseBasedOnEducationLevel = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST", 
        headers: { 'Content_Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getCourseCode", 
          category: enrolleeData.education_level
        })
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.log("Error fetching courses", error);
    }
  }, [enrolleeData.education_level]);

  useEffect(() => {
    if(enrolleeData.education_level) {
      fetchCourseBasedOnEducationLevel();
    }
  }, [enrolleeData.education_level, fetchCourseBasedOnEducationLevel]);


  /* Updated: Fetch ALL sections regardless of course/year */
  const fetchAllSections = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/sections.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getAllSectionCodes" 
        })
      });
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.log("Error in fetching sections", error);
    }
  }, []);

  useEffect(() => {
    fetchAllSections();
  }, [fetchAllSections]);


  const educationLevels   = [ "College", "Senior High", "TESDA" ]; 
  const collegeLevels     = [ "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year" ]; 
  const seniorHighLevels  = [ "Grade 11", "Grade 12" ]; 
  const tesdaLevels       = [ "NC I", "NC II", "NC III", "NC IV", "Diploma Program" ]; 
  const semesters         = [ "1st Semester", "2nd Semester" ]; 
  const enrollmentStatus  = [ "Enrolled", "Pending", "Drop", "Completed" ]; 
  const paymentStatus     = [ "Paid", "Unpaid", "Partial" ]; 


  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(modal === "info") {
                setModal("");
                setEnrolleeId("");
                setEnrolleeData({
                  student_number:   "",
                  course_code:      "",
                  education_level:  "",
                  year_level:       "",
                  semester:         "",
                  school_year:      "",
                  section_code:     "",
                  date_enrolled:    "",
                  enrollee_status:  "",
                  payment_status:   "",
                  remarks:          "",
                });
             }
           }}
      />

       <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[95%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-h-[90vh]
                    bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                    transition-all duration-300 ease-out
                    ${modal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
             {modal === "add" ? "Add New Enrollee" : modal === "edit" ? "Update Enrollee" : "Enrollee Information"}
          </h2>
          <button onClick={() => { 
                    setEnrolleeData({
                      student_number:   "",
                      course_code:      "",
                      education_level:  "",
                      year_level:       "",
                      semester:         "",
                      school_year:      "",
                      section_code:     "",
                      date_enrolled:    "",
                      enrollee_status:  "",
                      payment_status:   "",
                      remarks:          "",
                    });
                    setEnrolleeId("");
                    setModal("");
                }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className='text-3xl' />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Number</label>
                 <input type="text" value={enrolleeData.student_number || ""} readOnly={modal === "info"} 
                        onChange={(e) => setEnrolleeData({...enrolleeData, student_number: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education Level</label>
                  <select disabled={modal === "info"}
                          value={enrolleeData.education_level || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, education_level: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Education Level</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Code</label>
                  <select disabled={modal === "info"}
                          value={enrolleeData.course_code || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, course_code: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Course Code</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_code}>{course.course_code}</option>
                    ))}
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year Level</label>
                 <select disabled={modal === "info"}
                          value={enrolleeData.year_level || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, year_level: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Year Level</option>
                    {enrolleeData.education_level === "College" ? (
                        collegeLevels.map(l => <option key={l} value={l}>{l}</option>)
                    ) : enrolleeData.education_level === "Senior High" ? (
                         seniorHighLevels.map(l => <option key={l} value={l}>{l}</option>)
                    ) : enrolleeData.education_level === "TESDA" ? (
                         tesdaLevels.map(l => <option key={l} value={l}>{l}</option>)
                    ) : ""}
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Semester</label>
                  <select disabled={modal === "info"}
                          value={enrolleeData.semester || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, semester: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Semester</option>
                    {enrolleeData.education_level === "TESDA" ? (
                        <option value="NA">No Semester</option>
                    ) : (
                        semesters.map(s => <option key={s} value={s}>{s}</option>)
                    )}
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">School Year</label>
                 <input type="text" value={enrolleeData.school_year || ""} readOnly={modal === "info"} 
                        onChange={(e) => setEnrolleeData({...enrolleeData, school_year: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Section</label>
                  <select disabled={modal === "info"}
                          value={enrolleeData.section_code || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, section_code: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Section</option>
                    {sections.map((section) => (
                      <option key={section.section_code} value={section.section_code}>{section.section_code}</option>
                    ))}
                  </select>
              </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Enrolled</label>
                 <input type="date" value={enrolleeData.date_enrolled || ""} readOnly={modal === "info"} 
                        onChange={(e) => setEnrolleeData({...enrolleeData, date_enrolled: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrollee Status</label>
                 <select disabled={modal === "info"}
                          value={enrolleeData.enrollee_status || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, enrollee_status: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Status</option>
                    {enrollmentStatus.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Status</label>
                 <select disabled={modal === "info"}
                          value={enrolleeData.payment_status || ""} 
                          onChange={(e) => setEnrolleeData({...enrolleeData, payment_status: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled >Select Payment Status</option>
                    {paymentStatus.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
              </div>

               <div className="flex flex-col gap-1 md:col-span-2">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Remarks</label>
                 <textarea value={enrolleeData.remarks || ""} readOnly={modal === "info"} 
                        onChange={(e) => setEnrolleeData({...enrolleeData, remarks: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 resize-none"/>
              </div>

           </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => {
                   setEnrolleeData({
                      student_number:   "",
                      course_code:      "",
                      education_level:  "",
                      year_level:       "",
                      semester:         "",
                      school_year:      "",
                      section_code:     "",
                      date_enrolled:    "",
                      enrollee_status:  "",
                      payment_status:   "",
                      remarks:          "",
                    });
                    setEnrolleeId("");
                    setModal("");
                }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {modal !== "info" && (
            <button onClick={async () => {
                 if (modal === "add") {
                     // Add logic
                      if( !enrolleeData.student_number || !enrolleeData.education_level ) { // simplified check
                         showFlashMessage("failed", "Please fill required fields.");
                      } else {
                        const result = await insertNewEnrollee("insertEnrollee", {...enrolleeData, 
                          created_at:       completeDateTime(),  
                          updated_at:       completeDateTime() 
                        });
                        showFlashMessage(result.status, result.message);
                        if(result.status === "success") {
                            setEnrolleeData({
                              student_number:   "",
                              education_level:  "",
                              course_code:      "",
                              year_level:       "",
                              semester:         "",
                              school_year:      "",
                              section_code:     "",
                              date_enrolled:    "",
                              enrollee_status:  "",
                              payment_status:   "",
                              remarks:          "",
                            });
                        }
                      }
                 } else {
                     // Update logic
                      const result = await insertNewEnrollee("updateEnrollee", enrolleeData);
                      showFlashMessage(result.status, result.message);
                      if(result.status === "success") {
                         setModal("");
                         setEnrolleeId("");
                         setEnrolleeData({
                            enrollment_id:    "", 
                            student_number:   "",
                            course_code:      "",
                            education_level:  "",
                            year_level:       "",
                            semester:         "",
                            school_year:      "",
                            section_code:     "",
                            date_enrolled:    "",
                            enrollee_status:  "",
                            payment_status:   "",
                            remarks:          "",
                          });
                      }
                 }
                 await fetchEnrollees();
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {modal === "add" ? 'Save' : 'Update'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default EnrolleeModal