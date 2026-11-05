import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { completeFullDate, getAge } from '../../scripts/utility';
import { FaUser } from "react-icons/fa";
import { MdComputer } from "react-icons/md";
import ChangePassword from './ChangePassword';

const StudentProfileInfo = ({ modal, setModal }) => {
  const { userCredential } = useContext(AuthContext);
  const [profiles, setProfiles] = useState({
    personal_info: {}, 
    enrollment_detail: []
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/users.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: "include", 
        body: JSON.stringify({
          action: "getUserprofileStudent", 
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
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
            <label htmlFor="selectImage" className='cursor-pointer relative z-10 hover:opacity-90 transition-opacity'>
              <img src={profiles.personal_info?.student_image ? `${API_BASE}/images/students/${profiles.personal_info?.student_image}` : `${API_BASE}/images/user.jpg`} 
                   alt="Profile" 
                   className='w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white' />
            </label>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left mb-2 sm:mb-0">
              <h2 className="text-3xl font-bold text-gray-800">{profiles.personal_info?.first_name} {profiles.personal_info?.last_name}</h2>
              <p className="text-gray-500 font-medium text-lg">{profiles.personal_info?.student_number}</p>
            </div>
            <button className='mt-4 sm:mt-0 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-0.5'
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
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FaUser size={20} /> 
            </div>
            <b className="text-lg text-gray-800 tracking-wide">PERSONAL INFORMATION</b>
          </div>
          
          <div className="flex flex-col gap-4 text-gray-600">
             {/* Helper for responsive rows */}
             {[
                { label: 'Name', value: `${profiles.personal_info?.first_name} ${profiles.personal_info?.middle_name} ${profiles.personal_info?.last_name}` },
                { label: 'Gender', value: profiles.personal_info?.gender },
                { label: 'Date of Birth', value: completeFullDate(profiles.personal_info?.date_of_birth) },
                { label: 'Age', value: getAge(profiles.personal_info?.date_of_birth) },
                { label: 'Contact', value: profiles.personal_info?.contact_number },
                { label: 'Email', value: profiles.personal_info?.email_address },
                { label: 'Address', value: `${profiles.personal_info?.street_number ? profiles.personal_info?.street_number + ', ' : ''}${profiles.personal_info?.street ? profiles.personal_info?.street + ', ' : ''}${profiles.personal_info?.barangay}, ${profiles.personal_info?.town}, ${profiles.personal_info?.province}` },
                { label: 'Guardian', value: profiles.personal_info?.guardian_name },
                { label: 'Guardian Contact', value: profiles.personal_info?.guardian_number },
             ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className='font-medium text-gray-500 w-1/3'>{item.label}</span>
                  <span className='font-semibold text-gray-800 flex-1 sm:text-right'>{item.value || '-'}</span>
                </div>
             ))}
          </div>
        </div>
        
        {/* Enrollment Details Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 h-fit">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <MdComputer size={20} /> 
            </div>
            <b className="text-lg text-gray-800 tracking-wide">ENROLLMENT DETAILS</b>
          </div>

          <div className="flex flex-col gap-6">
            {profiles.enrollment_detail.map((profile, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                 <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Education Level', value: profile.education_level },
                      { label: 'Course', value: profile.course_code },
                      { label: 'School Year', value: profile.school_year },
                      { label: 'Year Level', value: profile.year_level },
                      { label: 'Semester', value: profile.semester },
                      { label: 'Section', value: profile.section_code },
                      { label: 'Status', value: profile.enrollee_status, isStatus: true },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-2 last:pb-0 border-dashed">
                        <span className="text-sm font-medium text-gray-500">{item.label}</span>
                        {item.isStatus ? (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.value === 'Enrolled' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                            {item.value || '-'}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-800">{item.value || '-'}</span>
                        )}
                      </div>
                    ))}
                 </div>
              </div>
            ))}
            {profiles.enrollment_detail.length === 0 && <p className="text-gray-500 text-center italic">No enrollment records found.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}

export default StudentProfileInfo