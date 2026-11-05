import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { completeFullDate, getAge } from '../../scripts/utility';
import { FaUser } from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
import ChangePassword from './ChangePassword';

const TeacherProfileInfo = ({ modal, setModal }) => {
  const { userCredential } = useContext(AuthContext);
  const [profiles, setProfiles] = useState("");

  const subjectLists = profiles.subject_to_teach ? profiles.subject_to_teach.split(/,\s*|\s+/) : [];
  const displayLimit = 2;
  const visibleSubjects = subjectLists.slice(0, displayLimit);
  const remainingSubject = subjectLists.length - displayLimit;
  const [allSubject, setAllSubject] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/users.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: "include", 
        body: JSON.stringify({
          action: "getUserProfileTeacher", 
          userCode: userCredential?.login_code
        })
      });
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.log("Error in fetching user", error);
    }
  }, [userCredential?.login_code]);

  useEffect(() => {
    if(userCredential?.login_code) {
      fetchUserProfile();
    }
  }, [userCredential?.login_code, fetchUserProfile]);
  

  return (
    <div className='flex-1 p-6 flex flex-col gap-6 font-sans h-full overflow-y-auto scrollbar-thin'>

      <ChangePassword modal={modal} setModal={setModal} />

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 relative group shrink-0">
        <div className="h-40 bg-gradient-to-r from-purple-600 to-pink-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
            <label htmlFor="selectImage" className='cursor-pointer relative z-10 hover:opacity-90 transition-opacity'>
              <img src={profiles?.teacher_image ? `${API_BASE}/images/teachers/${profiles?.teacher_image}` : `${API_BASE}/images/teachers/default.jpg`} 
                   alt="Profile" 
                   className='w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white' />
               <input type="file" className='hidden' id='selectImage' />
            </label>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left mb-2 sm:mb-0">
              <h2 className="text-3xl font-bold text-gray-800">{profiles.first_name} {profiles.last_name}</h2>
              <p className="text-gray-500 font-medium text-lg">{profiles.teacher_number}</p> 
            </div>
            <button className='mt-4 sm:mt-0 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow-sm hover:bg-gray-50 hover:text-purple-600 transition-all duration-300 transform hover:-translate-y-0.5'
                    onClick={() => setModal(true)}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        
        {/* Personal Information Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6"> 
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <FaUser size={20} /> 
            </div>
            <b className="text-lg text-gray-800 tracking-wide">PERSONAL INFORMATION</b>
          </div>
          
          <div className="flex flex-col gap-4 text-gray-600">
             {[
                { label: 'Name', value: `${profiles.first_name} ${profiles.middle_name} ${profiles.last_name}` },
                { label: 'Gender', value: profiles.gender },
                { label: 'Date of Birth', value: completeFullDate(profiles.date_of_birth) },
                { label: 'Age', value: getAge(profiles.date_of_birth) },
                { label: 'Contact', value: profiles.contact_number },
                { label: 'Email', value: profiles.email_address },
                { label: 'Address', value: `${profiles.street_number ? profiles.street_number + ', ' : ''}${profiles.street ? profiles.street + ', ' : ''}${profiles.barangay}, ${profiles.town}, ${profiles.province}` },
             ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className='font-medium text-gray-500 w-1/3'>{item.label}</span>
                  <span className='font-semibold text-gray-800 flex-1 sm:text-right'>{item.value || '-'}</span>
                </div>
             ))}
          </div>
        </div>
        
        {/* Educational Attainment & Work */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
              <GiAchievement size={20} /> 
            </div>
            <b className="text-lg text-gray-800 tracking-wide">PROFESSIONAL DETAILS</b>
          </div>

          <div className="flex flex-col gap-4 text-gray-600">
              {[
                  { label: 'Educational Attainment', value: profiles.educational_attainment },
                  { label: 'Specialty', value: profiles.specialty },
                  { label: 'Teaching Experience', value: profiles.teaching_experience },
                  { label: 'Awards/Recognition', value: profiles.achievements },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-dashed border-gray-100 last:border-0">
                  <span className='font-medium text-gray-500 w-1/3'>{item.label}</span>
                  <span className='font-semibold text-gray-800 flex-1 sm:text-right'>{item.value || '-'}</span>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-100">
                 <span className='font-medium text-gray-500 block mb-3'>Subjects Taught</span>
                 <div className="flex flex-wrap gap-2">
                    {subjectLists && subjectLists.length > 0 ? (
                        <>
                           {allSubject || subjectLists.length <= displayLimit ? (
                              subjectLists.map((sub, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-100">{sub}</span>
                              ))
                           ) : (
                              visibleSubjects.map((sub, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-100">{sub}</span>
                              ))
                           )}

                           {!allSubject && subjectLists.length > displayLimit && (
                              <button onClick={() => setAllSubject(true)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-200 transition">+{remainingSubject} More</button>
                           )}
                           {allSubject && subjectLists.length > displayLimit && (
                              <button onClick={() => setAllSubject(false)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-200 transition">Show Less</button>
                           )}
                        </>
                    ) : <span className="text-sm italic text-gray-400">No subjects assigned</span>}
                 </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TeacherProfileInfo