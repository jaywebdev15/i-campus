import React, { useState } from 'react'
import { BiX, BiPaperclip, BiEdit, BiIdCard } from 'react-icons/bi';

const UserInformation = ({ getUser, modal, setModal, setUserData }) => {
  const [preview, setPreview] = useState(null);

  const setImageChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  // Helper to safely access data
  const user = getUser || {};

  return (
    <div className={`flex flex-col p-3 gap-2 bg-[#00bfa625] rounded-md 
                    transition-all duration-500 
                    ${modal !== "" ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
      <div className="flex flex-row justify-between items-center">
        <span className='font-semibold text-base 
                          lg:text-2xl lg:font-bold'>User's Information</span>
        <BiX className="font-bold text-base cursor-pointer lg:text-2xl" /> 
      </div>
      <div className='flex flex-col gap-3 
                      md:flex-row'>
        {/* =====> User Image <===== */}
        <div className='flex flex-col gap-2 text-white'>
          <div className="flex-1 flex justify-center items-center w-30">
            <img src={!preview 
                        ? '/user.jpg' 
                        : preview
                      } 
            alt="" 
                  className='h-fit w-fit rounded-md object-cover'/>
          </div>
          {/* Note: User image upload handled via linked profile normally, usually not direct on user table unless fields added */}
          <label htmlFor='pickImage' className="flex flex-row items-center justify-center gap-3 p-1 bg-[#00BFA6] rounded-full cursor-pointer">
            <BiPaperclip className="text-xl" /> 
            <span>Upload</span>
            <input id='pickImage' type="file" className='hidden' 
                    onChange={(e) => setImageChange(e)} />
          </label>
          <button className={`flex flex-row items-center justify-center gap-3 p-1 rounded-full bg-gradient-to-r from-[#0A1653] to-[#00BFA6] cursor-pointer 
                              ${!getUser ? 'opacity-50 pointer-events-none' : ''}`} 
                  onClick={() => {
                    setUserData(getUser);
                    setModal("Edit");
                  }}>
            <BiEdit className="text-xl" /> 
            <span>Edit</span>
          </button>
        </div>
        {/* =====> User Information <===== */}
        <div className="flex-1 flex flex-col bg-gradient-to-r from-[#0A1653] to-[#00BFA6] text-white p-3 rounded-md gap-2">
          <div className="flex flex-row items-center gap-2">
            <BiIdCard className="text-lg" /> 
            <span className='text-sm font-semibold'>{user.user_code}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Email:</span>
            <span className='flex-1'>{user.user_email}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Role:</span>
            <span className='flex-1'>{user.user_role}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Status:</span>
            <span className='flex-1'>{user.user_status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInformation
