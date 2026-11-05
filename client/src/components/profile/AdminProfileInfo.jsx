import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { completeFullDate } from '../../scripts/utility';
import { FaUser } from "react-icons/fa";
import { BiLockAlt } from "react-icons/bi";
import ChangePassword from './ChangePassword';

const AdminProfileInfo = () => {
  const { userCredential } = useContext(AuthContext);
  const [imagePreview, setImagePreview] = useState(`${API_BASE}/images/user.jpg`);
  const [profiles, setProfiles] = useState("");
  const [modal, setModal] = useState(false);

    const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };


  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/users.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: "include", 
        body: JSON.stringify({
          action: "getUserProfileAdmin", 
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

  useEffect(() => {
    if (profiles?.admin_image) {
      setImagePreview(`${API_BASE}/images/admins/${profiles.admin_image}`);
    }
  }, [profiles]);
  

  return (
    <div className='flex-1 p-6 flex flex-col gap-6 font-sans h-full overflow-y-auto scrollbar-thin'>
      
      <ChangePassword modal={modal} setModal={setModal} />

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 relative group shrink-0">
        <div className="h-40 bg-gradient-to-r from-gray-700 to-gray-900"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
            <label htmlFor="selectImage" className='cursor-pointer relative z-10 hover:opacity-90 transition-opacity group-hover:scale-105 transform duration-300'>
              <img src={imagePreview} 
                   alt="Profile" 
                   onError={(e) => {e.target.src = `${API_BASE}/images/user.jpg`}}
                   className='w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white' />
               <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold">Change</div>
               <input type="file" className='hidden' id='selectImage' onChange={handleImageChange} />
            </label>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left mb-2 sm:mb-0">
              <h2 className="text-3xl font-bold text-gray-800">{profiles.admin_firstname} {profiles.admin_lastname}</h2>
              <p className="text-gray-500 font-medium text-lg">Administrator</p> 
            </div>
             <div className="flex gap-2 mt-4 sm:mt-0">
                <button 
                  onClick={() => setModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                   <BiLockAlt /> Change Password
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 shrink-0">
        
        {/* Personal Information Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6"> 
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <FaUser size={20} /> 
            </div>
            <b className="text-lg text-gray-800 tracking-wide">PERSONAL INFORMATION</b>
          </div>
          
          <div className="flex flex-col gap-4 text-gray-600">
             {[
                { label: 'Name', value: `${profiles.admin_firstname} ${profiles.admin_middlename} ${profiles.admin_lastname}` },
                { label: 'Gender', value: profiles.admin_gender },
                { label: 'Civil Status', value: profiles.admin_civil_status },
                { label: 'Date of Birth', value: completeFullDate(profiles.admin_date_of_birth) },
                { label: 'Contact', value: profiles.admin_contact_number },
                { label: 'Email', value: profiles.admin_email_address },
                { label: 'Address', value: `${profiles.admin_house_number ? profiles.admin_house_number + ', ' : ''}${profiles.admin_street ? profiles.admin_street + ', ' : ''}${profiles.admin_barangay}, ${profiles.admin_town}, ${profiles.admin_province}` },
             ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className='font-medium text-gray-500 w-1/3'>{item.label}</span>
                  <span className='font-semibold text-gray-800 flex-1 sm:text-right'>{item.value || '-'}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfileInfo