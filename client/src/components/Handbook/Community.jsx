import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Community = () => {
  return (
    <article className='flex bg-white flex-col justify-between p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>Community Service</span>
      <p>The school provides a variety of resources to support student learning, personal growth, and academic success. These include libraries, computer and multimedia facilities, guidance services, learning materials, and access to online platforms. Students are encouraged to utilize these resources responsibly to enhance their educational experience and achieve their academic goals.</p>
      
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className='font-bold text-lg'>Develop Social Responsibility:</span>
          <p>The Parent-Teacher Association (PTA) provides opportunities for parents to participate in school decisions, activities, and initiatives that benefit students.</p>
        </div>

        <div className="flex flex-col">
          <span className='font-bold text-lg mb-2'>Build Leadership Skills:</span>
          <p>Parents and guardians are encouraged to volunteer in school programs and events, contributing time and skills to enhance the learning environment.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-row gap-5 mt-5">
        <div className="flex-1 rounded-lg overflow-hidden">
          <img src={`${IMAGE_BASE}/resources.jpg`} alt="" 
              className='h-full w-full shadow-lg' />
        </div>
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex flex-col">
            <span className='font-bold text-lg mb-2'>Enhance Academic Learning:</span>
            <p>Parents and guardians are encouraged to volunteer in school programs and events, contributing time and skills to enhance the learning environment.</p>
          </div>

          <div className="flex flex-col">
            <span className='font-bold text-lg mb-2'>Foster Connection:</span>
            <p>Parents and guardians are encouraged to volunteer in school programs and events, contributing time and skills to enhance the learning environment.</p>
          </div>

          <div className="flex justify-center items-center rounded-full overflow-hidden">
            <img src={`${IMAGE_BASE}/learning.jfif`} alt="" 
                className='h-50 w-50 shadow-lg rounded-full' />
          </div>
        </div>
      </div>
    </article>
  )
}

export default Community