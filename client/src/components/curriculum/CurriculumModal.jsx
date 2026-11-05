import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiX } from "react-icons/bi";
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertNewcurriculum } from '../../scripts/curriculums';

const CurriculumModal = ({ curriculumModal, setCurriculumModal, curriculumData, setCurriculumData, fetchCurriculums, setCurriculumId, filterOptions }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [curriculumCategories, setCurriculumCategories] = useState([]);
  
  const educationLevels   = [ "College", "Senior High", "TESDA" ];
  const collegeLevels     = [ "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year" ];
  const seniorHighLevels  = [ "Grade 11", "Grade 12" ];
  const tesdaLevels       = [ "NC I", "NC II", "NC III", "NC IV", "Diploma Program" ];
  const semesters         = [ "1st Semester", "2nd Semester" ];
  const status            = [ "Available", "Unavailable" ]; // Updated status values
  
  const fetchCourseBasedOnEducationLevel = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCourseCode",
          category: curriculumData.education_level
        })
      });

      const data = await response.json();
      setCourses(data);

    } catch (error) {
      console.log("Error fetching courses", error);
    }
  }, [curriculumData.education_level]);

  useEffect(() => {
    if(curriculumData.education_level) {
      fetchCourseBasedOnEducationLevel();
    }
  }, [curriculumData.education_level, fetchCourseBasedOnEducationLevel]);

  const fetchCurriculumCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getCategory" })
      });
      const data = await response.json();
      setCurriculumCategories(data);
    } catch (error) {
      console.log("Error fetching curriculum categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCurriculumCategories();
  }, [fetchCurriculumCategories]);
  
  useEffect(() => {
    if (curriculumData.course_code) {
      setSelectedCourses(
        curriculumData.course_code.split(",").map(c => c.trim())
      );
    }
  }, [curriculumData.course_code]);


  const handleCheckboxChange = (courseCode) => {
    let updated;

    if (selectedCourses.includes(courseCode)) {
      updated = selectedCourses.filter(c => c !== courseCode);
    } else {
      updated = [...selectedCourses, courseCode];
    }

    setSelectedCourses(updated);

    setCurriculumData({
      ...curriculumData,
      course_code: updated.join(", ")
    });
  };


  return (
    <>
      {/* Backdrop */}
       <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${curriculumModal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(curriculumModal === "info") {
                setCurriculumData({
                    curriculum_id:    "", 
                    education_level:  "", 
                    course_code:      "", 
                    subject_code:     "", 
                    year_level:       "", 
                    semester:         "", 
                    status:           ""
                  });
                  setCurriculumId("");
                  setCurriculumModal("");
             }
           }}
      />

       <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh]
                      bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                      transition-all duration-300 ease-out
                      ${curriculumModal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
             {curriculumModal === "info" ? 'Curriculum Info' : curriculumModal === "edit" ? "Update Curriculum" : "Add New Curriculum"}
          </h2>
          <button onClick={() => { 
                  setCurriculumData({
                    curriculum_id:    "", 
                    education_level:  "", 
                    course_code:      "", 
                    subject_code:     "", 
                    year_level:       "", 
                    semester:         "", 
                    status:           ""
                  });
                  setCurriculumId("");
                  setCurriculumModal(""); 
                }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className='text-3xl' />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education Level</label>
                 <select value={curriculumData.education_level || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, education_level: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                  <option value="" disabled>Select Level</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year Level</label>
                 <select value={curriculumData.year_level || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, year_level: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                  <option value="" disabled>Select Year</option>
                   {curriculumData.education_level === "College" ? (
                      collegeLevels.map(l => <option key={l} value={l}>{l}</option>)
                  ) : curriculumData.education_level === "Senior High" ? (
                      seniorHighLevels.map(l => <option key={l} value={l}>{l}</option>)
                  ) : curriculumData.education_level === "TESDA" ? (
                      tesdaLevels.map(l => <option key={l} value={l}>{l}</option>)
                  ) : <option value="" disabled>Select Education Level First</option>}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Semester</label>
                 <select value={curriculumData.semester || ""} disabled={curriculumModal === "info" || curriculumData.education_level === "TESDA"} 
                        onChange={(e) => setCurriculumData({...curriculumData, semester: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                   {curriculumData.education_level === "TESDA" ? (
                      <option value="NA">No Semester</option>
                  ) : (
                      <>
                        <option value="" disabled>Select Semester</option>
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                      </>
                  )}
                </select>
              </div>

               <div className="flex flex-col gap-1 md:row-span-2">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Code(s)</label>
                 <textarea readOnly={curriculumModal === "info"} value={curriculumData.course_code || ""}
                        onChange={(e) => setCurriculumData({...curriculumData, course_code: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 min-h-[100px] resize-none"/>
                 
                 {curriculumModal !== "info" && (
                    <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                        {courses.length === 0 ? <p className="text-xs text-gray-400 p-1">No courses available</p> : 
                          courses.map((course) => (
                          <label key={course.course_id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                            <input type="checkbox" checked={selectedCourses.includes(course.course_code)}
                                  onChange={() => handleCheckboxChange(course.course_code)}
                                  className="accent-blue-600"/>
                            <span className="text-sm text-gray-700">{course.course_code}</span>
                          </label>
                        ))}
                    </div>
                 )}
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject Code</label>
                 <input type="text" value={curriculumData.subject_code || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, subject_code: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject Title</label>
                 <input type="text" value={curriculumData.subject_title || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, subject_title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

               <div className="flex flex-col gap-1 md:col-span-2">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject Description</label>
                 <textarea value={curriculumData.subject_description || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, subject_description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 resize-none"/>
               </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</label>
                 <input type="number" min="1" max="10" value={curriculumData.units || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, units: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>

                <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                 <select value={curriculumData.category || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Category</option>
                    {curriculumCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                 </select>
               </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                 <select value={curriculumData.status || ""} disabled={curriculumModal === "info"} 
                        onChange={(e) => setCurriculumData({...curriculumData, status: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Status</option>
                    {status.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
           </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => {
                  setCurriculumData({
                    curriculum_id:    "", 
                    education_level:  "", 
                    course_code:      "", 
                    subject_code:     "", 
                    year_level:       "", 
                    semester:         "", 
                    status:           ""
                  });
                  setCurriculumId("");
                  setCurriculumModal("");
                }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {curriculumModal !== "info" && (
            <button onClick={async () => {
                 if (curriculumModal === "add") {
                     // Add logic
                      const result = await insertNewcurriculum("insertCurriculum", curriculumData);
                      showFlashMessage(result.status, result.message);
                      if(result.status === "success") {
                         setCurriculumData({
                            curriculum_id:    "", 
                            education_level:  "", 
                            course_code:      "", 
                            subject_code:     "", 
                            year_level:       "", 
                            semester:         "", 
                            status:           ""
                          });
                      }
                 } else {
                     // Update logic
                      const result = await insertNewcurriculum("updateCurriculum", curriculumData);
                      showFlashMessage(result.status, result.message);
                      if(result.status === "success") {
                         setCurriculumModal("");
                         setCurriculumId("");
                      }
                 }
                 await fetchCurriculums();
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {curriculumModal === "add" ? 'Save' : 'Update'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default CurriculumModal