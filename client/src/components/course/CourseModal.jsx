import React, { useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiX } from "react-icons/bi";
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertNewCourse } from '../../scripts/courses';

const CourseModal = ({ courseModal, setCourseModal, courseData, setCourseData, fetchCourses, setCourseId }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: "getCategory" })
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.log("Error in fetching categories", error);
    }
  }

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: "getStatus" })
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.log("Error in fetching status", error);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchStatus();
  }, []);


  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${courseModal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(courseModal === "info") {
                setCourseModal("");
                setCourseData({
                  course_code:        "", 
                  course_title:       "", 
                  course_description: "", 
                  category:           "", 
                  course_status:      ""
                });
                setCourseId("");
             }
           }}
      />

       <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh]
                    bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                    transition-all duration-300 ease-out
                    ${courseModal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
             {courseModal === "add" ? "Add New Course" : courseModal === "edit" ? "Update Course" : "Course Information"}
          </h2>
          <button onClick={() => { 
                  setCourseModal("");
                  setCourseData({
                    course_code:        "", 
                    course_title:       "", 
                    course_description: "", 
                    category:           "", 
                    course_status:      ""
                  });
                  setCourseId("");
                }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className='text-3xl' />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
           <div className="grid grid-cols-1 gap-6">
              
              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Code</label>
                 <input type="text" value={courseData.course_code || ""} readOnly={courseModal === "info"} 
                        onChange={(e) => setCourseData({...courseData, course_code: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Title</label>
                 <input type="text" value={courseData.course_title || ""} readOnly={courseModal === "info"} 
                        onChange={(e) => setCourseData({...courseData, course_title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                 <textarea value={courseData.course_description || ""} readOnly={courseModal === "info"} 
                        onChange={(e) => setCourseData({...courseData, course_description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 resize-none"/>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                     <select value={courseData.category || ""} disabled={courseModal === "info"} 
                            onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                        <option value="" disabled>Select Category</option>
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                     </select>
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                     <select value={courseData.course_status || ""} disabled={courseModal === "info"} 
                            onChange={(e) => setCourseData({...courseData, course_status: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                        <option value="" disabled>Select Status</option>
                        {status.map((s, i) => <option key={i} value={s}>{s}</option>)}
                     </select>
                  </div>
               </div>

           </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => {
                   setCourseModal("");
                  setCourseData({
                    course_code:        "", 
                    course_title:       "", 
                    course_description: "", 
                    category:           "", 
                    course_status:      ""
                  });
                  setCourseId("");
                }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {courseModal !== "info" && (
            <button onClick={async () => {
                 if (courseModal === "add") {
                     // Add logic
                      if( !courseData.course_code || !courseData.course_title ) {
                         showFlashMessage("failed", "Please fill required fields.");
                      } else {
                        const result = await insertNewCourse("insertCourse", courseData);
                        showFlashMessage(result.status, result.message);
                        if(result.status === "success") {
                            setCourseData({
                              course_code:        "", 
                              course_title:       "", 
                              course_description: "", 
                              category:           "", 
                              course_status:      ""
                            });
                        }
                      }
                 } else {
                     // Update logic
                      const result = await insertNewCourse("updateCourse", courseData);
                      showFlashMessage(result.status, result.message);
                      if(result.status === "success") {
                         setCourseModal("");
                         setCourseId("");
                         setCourseData({
                              course_code:        "", 
                              course_title:       "", 
                              course_description: "", 
                              category:           "", 
                              course_status:      ""
                            });
                      }
                 }
                 await fetchCourses();
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {courseModal === "add" ? 'Save' : 'Update'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default CourseModal