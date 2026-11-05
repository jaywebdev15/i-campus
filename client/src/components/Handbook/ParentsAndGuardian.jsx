import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const ParentsAndGuardian = () => {
  return (
    <article className='flex bg-white flex-col justify-start p-10 min-h-200 w-150 text-sm'>
      <span className='text-2xl font-bold mb-2'>Parent and Guardian Envolvement</span>
      <p className='my-5'>Parents and guardians play a vital role in supporting student learning and school activities. Active involvement helps foster a positive school community and strengthens collaboration between families and the school.</p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className='font-bold text-lg'>Parent-Teacher Association (PTA):</span>
          <p>The Parent-Teacher Association (PTA) provides opportunities for parents to participate in school decisions, activities, and initiatives that benefit students.</p>
        </div>

        <div className="flex flex-col">
          <span className='font-bold text-lg mb-2'>Volunteering:</span>
          <p>Parents and guardians are encouraged to volunteer in school programs and events, contributing time and skills to enhance the learning environment.</p>
        </div>

        <div className="flex flex-col">
          <span className='font-bold text-lg mb-2'>Attendance at School Events:</span>
          <p>Attending school events allows parents to stay informed about their child’s progress and engage with the school community.</p>
        </div>

        <div className="flex flex-col">
          <span className='font-bold text-lg mb-2'>Communication:</span>
          <p>Open and regular communication between parents, guardians, and school staff is essential for supporting student success and addressing concerns effectively.</p>
        </div>

      </div>

      <div className="relative flex justify-center items-center my-5 overflow-hidden">
        <div className="absolute bottom-0 bg-gray-600 w-full h-[50%]"></div>
        <img src={`${IMAGE_BASE}/parent-teacher.jfif`} alt="" 
              className='h-full aspect-square rounded-full z-50'/>
      </div>

    </article>
  )
}

export default ParentsAndGuardian