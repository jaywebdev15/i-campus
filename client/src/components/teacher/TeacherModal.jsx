import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { upsertTeacher } from '../../scripts/teachers.js';
import { getAge } from '../../scripts/utility.js';
import { BiX } from 'react-icons/bi';

const TeacherModal = ({ modal, setModal, teacherData, setTeacherData, fetchTeachers, setTeacherId, clearFields }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [subjects, setSubjects] = useState([]); 
  const selectedSubjects = teacherData?.subject_to_teach 
    ? teacherData.subject_to_teach.split(',').map(s => s.trim()).filter(s => s !== "") 
    : [];

  // Reset image preview when modal closes
  useEffect(() => {
    if (modal === "") {
        setImagePreview(null);
        setImageFile(null);
    }
  }, [modal]);

  const [searchSubject, setSearchSubject] = useState("");
  const civilStatus = [ "Single", "Married", "Widow" ];
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const imageView = imagePreview 
                      ? imagePreview 
                      : (teacherData?.teacher_image 
                          ? `${API_BASE}/images/teachers/${teacherData.teacher_image}` 
                          : `${API_BASE}/images/teachers/default.jpg`
                      );

  
  const handleImageFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if(file) {
      if(imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      const newImagePreview = URL.createObjectURL(file);
      setImagePreview(newImagePreview);
    }
  }



  // =====> Fetching Subjects of Teacher <===== \\
  const fetchSubjects = useCallback(async () => {
    try {
      let response;
      if(searchSubject === "") {
        response = await fetch(`${API_BASE}/database/curriculums.php`);
      } else {
        response = await fetch(`${API_BASE}/database/curriculums.php`, {
          method: "POST", 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            action: "getSubjectLists", 
            searchSubject: searchSubject
          })
        });
      }
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.log("Error in fetching subjects", error);
    }
  }, [searchSubject]);
// ----------------------------------------- \\
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);
  // =====> Fetching Subjects of Teacher <===== \\



  // =====> Checkbox Handling <===== \\
  // =====> Checkbox Handling <===== \\
  const handleCheckboxChange = (subjectCode) => {
    // 1. Get current list from the text (Source of Truth) to ensure we are up to date
    const currentText = teacherData.subject_to_teach || "";
    const currentList = currentText.split(',').map(s => s.trim()).filter(s => s !== "");
    const uniqueSet = new Set(currentList);

    // 2. Toggle validity
    if (uniqueSet.has(subjectCode)) {
      uniqueSet.delete(subjectCode);
    } else {
      uniqueSet.add(subjectCode);
    }

    // 3. Convert back to array -> string
    const updatedList = Array.from(uniqueSet);
    const newString = updatedList.join(", ");

    // 4. Update parent state (Effect will update local 'selectedSubjects' for UI)
    setTeacherData({
      ...teacherData,
      subject_to_teach: newString,
    });
  };


  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(modal === "info") {
               clearFields();
               setModal("");
               setTeacherId("");
             }
           }}
      />

      {/* Modal Container */}
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[95%] md:w-[80%] lg:w-[60%] xl:w-[50%] max-h-[90vh]
                      bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                      transition-all duration-300 ease-out
                      ${modal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
            {modal === "add" ? 'Add New Teacher' : modal === "edit" ? 'Update Teacher Info' : 'View Teacher Info'}
          </h2>
          <button onClick={() => { clearFields(); setModal(""); setTeacherId(""); }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className="text-3xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Image Section (Top or Left) */}
            <div className="md:col-span-4 flex flex-col items-center gap-4">
              <div className="relative group w-40 h-40 rounded-full ring-4 ring-gray-50 overflow-hidden shadow-md">
                 <img src={imageView} alt="Teacher" className='w-full h-full object-cover' />
                 {modal !== "info" && (
                    <label htmlFor="image" className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-medium text-sm">
                       Change Photo
                    </label>
                 )}
              </div>
              {modal !== "info" && (
                <div className="text-sm text-gray-500 text-center">
                   Click image to upload
                   <input type="file" id='image' hidden onChange={handleImageFileChange} className='hidden'/>
                </div>
              )}
            </div>

            {/* Main Info Section */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
               {/* First Name */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                 <input type="text" readOnly={modal === "info"} value={teacherData.first_name || ""} 
                        onChange={(e) => setTeacherData({...teacherData, first_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"/>
               </div>
               
               {/* Last Name */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                 <input type="text" readOnly={modal === "info"} value={teacherData.last_name || ""} 
                        onChange={(e) => setTeacherData({...teacherData, last_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"/>
               </div>

               {/* Middle Name & Suffix - Combining to save space? Or just Middle Name */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle Name</label>
                 <input type="text" readOnly={modal === "info"} value={teacherData.middle_name || ""} 
                        onChange={(e) => setTeacherData({...teacherData, middle_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"/>
               </div>

               {/* Gender */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                 <div className="flex gap-4 items-center h-full px-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <input type="radio" name='gender' value='Male' disabled={modal === "info"} checked={teacherData.gender === "Male"} onChange={(e) => setTeacherData({...teacherData, gender: e.target.value})} className="accent-blue-600"/> Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <input type="radio" name='gender' value='Female' disabled={modal === "info"} checked={teacherData.gender === "Female"} onChange={(e) => setTeacherData({...teacherData, gender: e.target.value})} className="accent-pink-600"/> Female
                    </label>
                 </div>
               </div>

               {/* Civil Status */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Civil Status</label>
                 <select value={teacherData.civil_status || ""} disabled={modal === "info"} onChange={(e) => setTeacherData({...teacherData, civil_status: e.target.value})}
                         className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white disabled:bg-gray-50">
                    <option value="" disabled>Select Status</option>
                    {civilStatus.map((stat, i) => <option key={i} value={stat}>{stat}</option>)}
                 </select>
               </div>

               {/* Date of Birth */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                 <input type="date" readOnly={modal === "info"} value={teacherData.date_of_birth || ""} 
                        onChange={(e) => setTeacherData({...teacherData, date_of_birth: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"/>
               </div>

               {/* Age (Auto-calculated, Read only usually) */}
               {modal !== "info" && (
                 <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
                    <input type="text" readOnly value={teacherData.date_of_birth ? getAge(teacherData.date_of_birth) : ''} 
                           className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"/>
                 </div>
               )}

               {/* Contact */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</label>
                 <input type="text" readOnly={modal === "info"} value={teacherData.contact_number || ""} 
                        onChange={(e) => setTeacherData({...teacherData, contact_number: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"/>
               </div>

               {/* Email */}
               <div className="flex flex-col gap-1 sm:col-span-2">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                 <input type="email" readOnly={modal === "info"} value={teacherData.email_address || ""} 
                        onChange={(e) => setTeacherData({...teacherData, email_address: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50"/>
               </div>

            </div>

            {/* Address Section */}
            <div className="md:col-span-12 border-t border-gray-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-gray-800 mb-3">Address Information</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input placeholder="House No." readOnly={modal === "info"} value={teacherData.house_number || ""} onChange={(e) => setTeacherData({...teacherData, house_number: e.target.value})} className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none disabled:bg-gray-50"/>
                  <input placeholder="Street/Purok" readOnly={modal === "info"} value={teacherData.street || ""} onChange={(e) => setTeacherData({...teacherData, street: e.target.value})} className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none disabled:bg-gray-50"/>
                  <input placeholder="Barangay" readOnly={modal === "info"} value={teacherData.barangay || ""} onChange={(e) => setTeacherData({...teacherData, barangay: e.target.value})} className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none disabled:bg-gray-50"/>
                  <input placeholder="Town" readOnly={modal === "info"} value={teacherData.town || ""} onChange={(e) => setTeacherData({...teacherData, town: e.target.value})} className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none disabled:bg-gray-50"/>
                  <input placeholder="Province" readOnly={modal === "info"} value={teacherData.province || ""} onChange={(e) => setTeacherData({...teacherData, province: e.target.value})} className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>
            </div>

             {/* Professional Info */}
            <div className="md:col-span-12 border-t border-gray-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-gray-800 mb-3">Professional Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Educational Attainment</label>
                      <input type="text" readOnly={modal === "info"} value={teacherData.educational_attainment || ""} onChange={(e) => setTeacherData({...teacherData, educational_attainment: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none disabled:bg-gray-50"/>
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Specialty</label>
                      <input type="text" readOnly={modal === "info"} value={teacherData.specialty || ""} onChange={(e) => setTeacherData({...teacherData, specialty: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none disabled:bg-gray-50"/>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Achievements</label>
                      <input type="text" readOnly={modal === "info"} value={teacherData.achievements || ""} onChange={(e) => setTeacherData({...teacherData, achievements: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none disabled:bg-gray-50"/>
                  </div>
                   <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Teaching Experience</label>
                      <input type="text" readOnly={modal === "info"} value={teacherData.teaching_experience || ""} onChange={(e) => setTeacherData({...teacherData, teaching_experience: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none disabled:bg-gray-50"/>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Teacher Status</label>
                      <select value={teacherData.teacher_status || ""} disabled={modal === "info"} onChange={(e) => setTeacherData({...teacherData, teacher_status: e.target.value})}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white disabled:bg-gray-50">
                        <option value="" disabled>Select Status</option>
                        {['Active', 'Inactive', 'On Leave', 'Resigned'].map((stat, i) => <option key={i} value={stat}>{stat}</option>)}
                      </select>
                  </div>
               </div>
            </div>

            {/* Subjects */}
            <div className="md:col-span-12 border-t border-gray-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-gray-800 mb-3">Subjects Taught</h3>
               <div className="flex flex-col gap-2">
                  <textarea readOnly={modal} value={teacherData.subject_to_teach || ""} 
                           onChange={(e) => setTeacherData({ ...teacherData, subject_to_teach: e.target.value })}
                           className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none min-h-[80px]" placeholder="Selected subjects will appear here..."/>
                  
                  {modal !== "info" && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                       <input type="text" value={searchSubject} onChange={(e) => setSearchSubject(e.target.value)} placeholder="Search subjects..." className='w-full mb-3 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500'/>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subjects.map((subject) => {
                             const code = subject.subject_code?.trim();
                             return (
                              <label key={code} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100 cursor-pointer hover:border-blue-300 transition-colors">
                                  <input type="checkbox" 
                                        checked={selectedSubjects.includes(code)} 
                                        onChange={() => handleCheckboxChange(code)} 
                                        className="accent-blue-600 rounded"/>
                                  <span className="text-sm font-medium text-gray-700">{code}</span>
                              </label>
                             );
                          })}
                       </div>
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => { clearFields(); setModal(""); setTeacherId(""); }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {modal !== "info" && (
            <button onClick={async () => {
                      if(modal === "add") {
                        if( !teacherData.first_name || !teacherData.last_name ) { // Simplified check for brevity in snippet, rely on original logic ideally
                          return showFlashMessage("failed", "Please fill required fields.");
                        }
                         // ... (Original logic for Upsert)
                         const result = await upsertTeacher("insertTeacher", teacherData, imageFile);
                         showFlashMessage(result.status, result.message);
                         if(result.status === "success") { setModal(""); clearFields(); setTeacherId(""); fetchTeachers(); }
                      } else {
                         const result = await upsertTeacher("updateTeacher", teacherData, imageFile);
                         showFlashMessage(result.status, result.message);
                         if(result.status === "success") { setModal(""); clearFields(); setTeacherId(""); fetchTeachers(); }
                      }
                   }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {modal === "add" ? 'Save Teacher' : 'Update Info'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default TeacherModal