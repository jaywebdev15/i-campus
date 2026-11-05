import React, { useState } from 'react'
import { QRCodeCanvas } from "qrcode.react"
import { BiX, BiPaperclip, BiEdit, BiIdCard, BiSolidContact } from "react-icons/bi";

const StudentsInformation = ({ getStudent, modal, setModal, setStudentData }) => {
  const [preview, setPreview] =useState(null);

  const setImageChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className={`flex flex-col p-3 gap-2 bg-[#00bfa625] rounded-md 
                    transition-all duration-500 
                    ${modal !== "" ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
      <div className="flex flex-row justify-between items-center">
        <span className='font-semibold text-base 
                          lg:text-2xl lg:font-bold'>Student's Information</span>
        <BiX className="font-bold text-base cursor-pointer lg:text-2xl" /> 
      </div>
      <div className='flex flex-col gap-3 
                      md:flex-row'>
        {/* =====> Student Image <===== */}
        <div className='flex flex-col gap-2 text-white'>
          <div className="flex-1 flex justify-center items-center w-30">
            <img src={!preview 
                        ? '/user.jpg' 
                        : preview
                      } 
            alt="" 
                  className='h-fit w-fit rounded-md object-cover'/>
            {/* <QRCodeCanvas value={getStudent.student_number} 
                          bgColor='#ffffff' 
                          fgColor='#000000' 
                          level='H' 
                          includeMargin={true} 
                          className={`h-fit w-fit object-cover 
                                      ${!getStudent.student_number && 'hidden'}`} /> */}
          </div>
          <label htmlFor='pickImage' className="flex flex-row items-center justify-center gap-3 p-1 bg-[#00BFA6] rounded-full cursor-pointer">
            <BiPaperclip className="text-xl" /> 
            <span>Upload</span>
            <input id='pickImage' type="file" className='hidden' 
                    onChange={(e) => setImageChange(e)} />
          </label>
          <button className={`flex flex-row items-center justify-center gap-3 p-1 rounded-full bg-gradient-to-r from-[#0A1653] to-[#00BFA6] cursor-pointer 
                              ${!getStudent ? 'opacity-50 pointer-events-none' : ''}`} 
                  onClick={() => {
                    setStudentData(getStudent);
                    setModal("Edit");
                  }}>
            <BiEdit className="text-xl" /> 
            <span>Edit</span>
          </button>
        </div>
        {/* =====> Student Information <===== */}
        <div className="flex-1 flex flex-col bg-gradient-to-r from-[#0A1653] to-[#00BFA6] text-white p-3 rounded-md gap-2">
          <div className="flex flex-row items-center gap-2">
            <BiIdCard className="text-lg" /> 
            <span className='text-sm font-semibold'>{getStudent.first_name} {getStudent.middle_name} {getStudent.last_name}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>ID Number:</span>
            <span className='flex-1'>{getStudent.student_number}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Course:</span>
            <span className='flex-1'>{getStudent.course}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Grade Level:</span>
            <span className='flex-1'>{getStudent.grade_level}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Section:</span>
            <span className='flex-1'>{getStudent.section}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Gender:</span>
            <span className='flex-1'>{getStudent.gender}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Date of Birth:</span>
            <span className='flex-1'>{getStudent.date_of_birth}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Age:</span>
            <span className='flex-1'>{getStudent.date_of_birth 
                                        ? new Date(Date.now() - new Date(getStudent.date_of_birth)).getUTCFullYear() - 1970 
                                        : ''}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Address:</span>
            <span className='flex-1'>{getStudent.house_number}, {getStudent.street_purok}, {getStudent.barangay}, {getStudent.town}, {getStudent.province}</span>
          </div>
        </div>
        {/* =====> Contact Information <===== */}
        <div className="flex-1 flex flex-col bg-gradient-to-r from-[#0A1653] to-[#00BFA6] text-white p-3 rounded-md gap-2">
          <div className="flex flex-row items-center gap-2">
            <BiSolidContact className="text-lg" /> 
            <span className='text-sm font-semibold'>Contact Information</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Mobile Number:</span>
            <span className='flex-1'>{getStudent.contact_number}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Email Address:</span>
            <span className='flex-1'>{getStudent.email_address}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Guardian Name:</span>
            <span className='flex-1'>{getStudent.guardian_name}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className='w-[40%]'>Guardian Number:</span>
            <span className='flex-1'>{getStudent.guardian_number}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentsInformation