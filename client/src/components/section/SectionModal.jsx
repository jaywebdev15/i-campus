import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiX } from "react-icons/bi";
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertOrUpdateSection } from '../../scripts/sections';

const SectionModal = ({ sectionData, setSectionData, sectionModal, setSectionModal, fetchSections, setSectionId }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [courses, setCourses] = useState([]);
  const [curriculums, setCurriculums] = useState([]);

  const educationLevels   = [ "College", "Senior High", "TESDA" ];
  const collegeLevels     = [ "1st Year", "2nd Year", "3rd Year", "4th Year" ];
  const seniorHighLevels  = [ "Grade 11", "Grade 12" ];
  const tesdaLevels       = [ "NC I", "NC II", "NC III", "NC IV", "Diploma Program" ];
  const semesters         = [ "1st Semester", "2nd Semester" ];
  const schedules         = [
    { longDay: "Monday",    shortDay: "M"   }, 
    { longDay: "Tuesday",   shortDay: "T"   }, 
    { longDay: "Wednesday", shortDay: "W"   }, 
    { longDay: "Thursday",  shortDay: "Th"  }, 
    { longDay: "Friday",    shortDay: "F"   }, 
    { longDay: "Saturday",  shortDay: "S"   }, 
  ];

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          action: "getCourseCode", 
          category: sectionData.education_level
        })
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.log("Error in fetching categories", error);
    }
  }, [sectionData.education_level])

  useEffect(() => {
    if(sectionData.education_level) {
      fetchCourses();
    }
  }, [sectionData.education_level, fetchCourses]);

  const fetchCurriculums = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getCurriculumSubject", 
          education_level: sectionData.education_level, 
          course_code: sectionData.course_code, 
          year_level: sectionData.year_level, 
          semester: sectionData.semester
        })
      });
      const data = await response.json();
      setCurriculums(data);
    } catch (error) {
      console.log("Error in fetching curriculums", error);
    }
  }, [sectionData.education_level, sectionData.course_code, sectionData.year_level, sectionData.semester]);

  useEffect(() => {
    if(sectionData.education_level && sectionData.course_code && sectionData.year_level && sectionData.semester) {
      fetchCurriculums();
    }
  }, [sectionData.education_level, sectionData.course_code, sectionData.year_level, sectionData.semester, fetchCurriculums]);


  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${sectionModal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(sectionModal === "info") {
                setSectionData({
                    section_id:       "", 
                    section_code:     "", 
                    education_level:  "", 
                    course_code:      "", 
                    curriculum_id:    "", 
                    year_level:       "", 
                    semester:         "", 
                    teacher_number:   "", 
                    schedule:         "", 
                    time_in:          "", 
                    time_out:         "", 
                  });
                  setSectionModal("");
                  setSectionId("");
             }
           }}
      />

      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[95%] md:w-[80%] lg:w-[60%] xl:w-[50%] max-h-[90vh]
                    bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                    transition-all duration-300 ease-out
                    ${sectionModal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
             {sectionModal === "info" ? "Section Info" : sectionModal === "edit" ? "Update Section" : "Add New Section"}
          </h2>
          <button onClick={() => { 
                setSectionData({
                    section_id:       "", 
                    section_code:     "", 
                    education_level:  "", 
                    course_code:      "", 
                    curriculum_id:    "", 
                    year_level:       "", 
                    semester:         "", 
                    teacher_number:   "", 
                    schedule:         "", 
                    time_in:          "", 
                    time_out:         "", 
                  });
                  setSectionModal("");
                  setSectionId(""); 
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
                 <select value={sectionData.education_level || ""} disabled={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, education_level: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Level</option>
                    {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
              </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year Level</label>
                 <select value={sectionData.year_level || ""} disabled={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, year_level: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Year</option>
                     {sectionData.education_level === "College" ? (
                      collegeLevels.map(l => <option key={l} value={l}>{l}</option>)
                  ) : sectionData.education_level === "Senior High" ? (
                      seniorHighLevels.map(l => <option key={l} value={l}>{l}</option>)
                  ) : sectionData.education_level === "TESDA" ? (
                      tesdaLevels.map(l => <option key={l} value={l}>{l}</option>)
                  ) : ""}
                 </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Semester</label>
                 <select value={sectionData.semester || ""} disabled={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, semester: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Semester</option>
                    {sectionData.education_level === "TESDA" ? (
                      <option value="NA">No Semester</option>
                  ) : (
                      semesters.map(s => <option key={s} value={s}>{s}</option>)
                  )}
                 </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Code</label>
                 <select value={sectionData.course_code || ""} disabled={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, course_code: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Course</option>
                    {courses.map((c, i) => <option key={i} value={c.course_code}>{c.course_code}</option>)}
                 </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Curriculum</label>
                 <select value={sectionData.curriculum_id || ""} disabled={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, curriculum_id: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Curriculum</option>
                    {curriculums.map((c, i) => <option key={i} value={c.curriculum_id}>{c.subject_code}</option>)}
                 </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Section Code</label>
                 <input type="text" value={sectionData.section_code || ""} readOnly={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, section_code: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teacher ID</label>
                 <input type="text" value={sectionData.teacher_number || ""} readOnly={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, teacher_number: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</label>
                 <select value={sectionData.schedule || ""} disabled={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, schedule: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                    <option value="" disabled>Select Day</option>
                    {schedules.map(s => <option key={s.longDay} value={s.shortDay}>{s.longDay}</option>)}
                 </select>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time In</label>
                 <input type="time" value={sectionData.time_in || ""} readOnly={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, time_in: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Out</label>
                 <input type="time" value={sectionData.time_out || ""} readOnly={sectionModal === "info"} 
                        onChange={(e) => setSectionData({...sectionData, time_out: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

           </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => {
                   setSectionData({
                        section_id:       "", 
                        section_code:     "", 
                        education_level:  "", 
                        course_code:      "", 
                        curriculum_id:    "", 
                        year_level:       "", 
                        semester:         "", 
                        teacher_number:   "", 
                        schedule:         "", 
                        time_in:          "", 
                        time_out:         "", 
                      });
                  setSectionModal("");
                  setSectionId("");
                }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {sectionModal !== "info" && (
            <button onClick={async () => {
                 if (sectionModal === "add") {
                    if( sectionData.course_code === "" || sectionData.time_in === "" ) { // Simplified
                       showFlashMessage("failed", "Please fill fields.");
                    } else {
                        const result = await insertOrUpdateSection("insertSection", sectionData);
                        showFlashMessage(result.status, result.message);
                        if(result.status === "success") {
                            setSectionData({
                              section_id:       "", 
                              section_code:     "", 
                              education_level:  "", 
                              course_code:      "", 
                              curriculum_id:    "", 
                              year_level:       "", 
                              semester:         "", 
                              teacher_number:   "", 
                              schedule:         "", 
                              time_in:          "", 
                              time_out:         "", 
                            });
                        }
                    }
                 } else {
                     const result = await insertOrUpdateSection("updateSection", sectionData);
                     showFlashMessage(result.status, result.message);
                     if(result.status === "success") {
                        setSectionData({
                              section_id:       "", 
                              section_code:     "", 
                              education_level:  "", 
                              course_code:      "", 
                              curriculum_id:    "", 
                              year_level:       "", 
                              semester:         "", 
                              teacher_number:   "", 
                              schedule:         "", 
                              time_in:          "", 
                              time_out:         "", 
                            });
                        setSectionModal("");
                        setSectionId("");
                     }
                 }
                 await fetchSections();
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {sectionModal === "add" ? 'Save' : 'Update'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default SectionModal