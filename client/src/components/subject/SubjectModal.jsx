import React, { useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiX } from "react-icons/bi";
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertNewSubject } from '../../scripts/subjects';

const SubjectModal = ({ subjectModal, setSubjectModal, subjectData, setSubjectData, fetchSubjects, setSubjectId }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/subjects.php`, {
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
      const response = await fetch(`${API_BASE}/database/subjects.php`, {
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
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${subjectModal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
         onClick={() => {
           if(subjectModal === "info") {
              setSubjectData({
                subject_id:           "", 
                subject_code:         "", 
                subject_title:        "", 
                subject_description:  "", 
                units:                "", 
                category:             "", 
                subject_status:       ""
              });
              setSubjectModal("");
              setSubjectId("");
           }
         }}
      />

      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh]
                    bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                    transition-all duration-300 ease-out
                    ${subjectModal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
      
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
           {subjectModal === "info" ? "Subject Details" : subjectModal === "edit" ? "Update Subject" : "Add New Subject"}
        </h2>
        <button className="text-gray-400 hover:text-gray-600 transition-colors"
           onClick={() => {
              setSubjectData({
                subject_id:           "", 
                subject_code:         "", 
                subject_title:        "", 
                subject_description:  "", 
                units:                "", 
                category:             "", 
                subject_status:       ""
              });
              setSubjectModal("");
              setSubjectId("");
           }}
        >
          <BiX className='text-3xl' />
        </button>
      </div>

      {/* Content */}
      <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject Code</label>
             <input type="text" value={subjectData.subject_code || ""} readOnly={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, subject_code: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
          </div>
           <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject Title</label>
             <input type="text" value={subjectData.subject_title || ""} readOnly={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, subject_title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
             <textarea value={subjectData.subject_description || ""} readOnly={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, subject_description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 resize-none"/>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</label>
             <input type="number" max="9" min="3" value={subjectData.units || ""} readOnly={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, units: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</label>
             <input type="text" value={subjectData.price || ""} readOnly={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, price: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
             <select value={subjectData.category || ""} disabled={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, category: e.target.value})}
                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 cursor-pointer appearance-none bg-white">
                <option value="" disabled>Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
             </select>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
             <select value={subjectData.subject_status || ""} disabled={subjectModal === "info"} onChange={(e) => setSubjectData({...subjectData, subject_status: e.target.value})}
                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 cursor-pointer appearance-none bg-white">
                <option value="" disabled>Select Status</option>
                {status.map((stat, index) =>(
                  <option key={index} value={stat}>{stat}</option>
                ))}
             </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
        <button onClick={() => {
                      setSubjectData({
                        subject_id:           "", 
                        subject_code:         "", 
                        subject_title:        "", 
                        subject_description:  "", 
                        units:                "", 
                        category:             "", 
                        subject_status:       ""
                      });
                  setSubjectModal("");
                  setSubjectId("");
                }} 
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
           Close
        </button>
        
        {subjectModal !== "info" && (
          <button onClick={async () => {
                if(subjectModal === "add") {
                  if( !subjectData.subject_code || !subjectData.subject_title || !subjectData.units ) {
                    showFlashMessage("failed", "Please fill required fields.");
                  } else {
                    const result = await insertNewSubject("insertSubject", subjectData);
                    showFlashMessage(result.status, result.message);
                    if(result.status === "success") {
                       setSubjectData({
                        subject_id:           "", 
                        subject_code:         "", 
                        subject_title:        "", 
                        subject_description:  "", 
                        units:                "", 
                        category:             "", 
                        subject_status:       ""
                      });
                    }
                  }
                } else {
                   // Update logic
                   const result = await insertNewSubject("updateSubject", subjectData);
                   showFlashMessage(result.status, result.message);
                   if(result.status === "success") {
                      setSubjectModal("");
                   }
                }
                await fetchSubjects();
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {subjectModal === "add" ? 'Save Subject' : 'Update Subject'}
          </button>
        )}
      </div>

      </div>
    </>
  )
}

export default SubjectModal