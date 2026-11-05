import React from 'react'
import { BiX, BiIdCard, BiSolidContact } from 'react-icons/bi';

const TeachersInformation = ({ getTeacher }) => {
  return (
          <div className="flex flex-col p-3 gap-2 bg-[#00bfa625] rounded-md">
            <div className="flex flex-row justify-between items-center">
              <span className='font-semibold text-base'>Teacher's Information</span>
              <BiX className="font-bold text-base cursor-pointer" /> 
            </div>
            <div className='flex flex-col gap-3 
                            md:flex-row'>
              {/* =====> Teacher Information <===== */}
              <div className="flex-1 flex flex-col bg-gradient-to-r from-[#0A1653] to-[#00BFA6] text-white p-3 rounded-md gap-2">
                <div className="flex flex-row items-center gap-2">
                  <BiIdCard className="text-lg" /> 
                  <span className='text-sm font-semibold'>{getTeacher.first_name} {getTeacher.middle_name} {getTeacher.last_name}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>ID Number:</span>
                  <span className='flex-1'>{getTeacher.teacher_number}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>Gender:</span>
                  <span className='flex-1'>{getTeacher.gender}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>Date of Birth:</span>
                  <span className='flex-1'>{getTeacher.date_of_birth}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>Age:</span>
                  <span className='flex-1'>{getTeacher.date_of_birth 
                                              ? new Date(Date.now() - new Date(getTeacher.date_of_birth)).getUTCFullYear() - 1970 
                                              : ''}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>Address:</span>
                  <span className='flex-1'>{getTeacher.full_address}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>Status:</span>
                  <span className='flex-1'>{getTeacher.teacher_status}</span>
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
                  <span className='flex-1'>{getTeacher.contact_number}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className='w-[40%]'>Email Address:</span>
                  <span className='flex-1'>{getTeacher.email_address}</span>
                </div>
              </div>
            </div>
          </div>
  )
}

export default TeachersInformation