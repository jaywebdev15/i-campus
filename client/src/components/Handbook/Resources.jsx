import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Resources = () => {
  return (
    <article className='flex bg-white flex-col justify-between p-10 min-h-200 w-150 text-sm'>
      <span className='text-2xl font-bold mb-2'>Resources</span>
      <p>The school provides a variety of resources to support student learning, personal growth, and academic success. These include libraries, computer and multimedia facilities, guidance services, learning materials, and access to online platforms. Students are encouraged to utilize these resources responsibly to enhance their educational experience and achieve their academic goals.</p>
      
      <div className="flex-1 flex flex-row gap-5 mt-5">
        <div className="flex-1 rounded-lg overflow-hidden">
          <img src={`${IMAGE_BASE}/resources.jpg`} alt="" 
              className='h-full w-full shadow-lg' />
        </div>
        <div className="flex-1 flex flex-col">
          <span className='text-lg font-bold my-1'>Academic Resources:</span>
          <p>The school provides essential academic resources to help students succeed in their studies and research</p>
          <ul className="list-disc pl-5 mb-5">
            <li>Library access</li>
            <li>Online databases</li>
            <li>Study materials</li>
          </ul>
          <span className='text-lg font-bold my-1'>Support Services:</span>
          <p>Students have access to support services that promote personal well-being and academic guidance</p>
          <ul className='list-disc pl-5 mb-5'>
            <li>Guidance counseling</li>
            <li>Tutoring programs</li>
            <li>Peer mentoring</li>
          </ul>
          <span className='text-lg font-bold my-1'>Emergency Resources:</span>
          <p>Emergency resources are available to ensure the safety and security of students and staff</p>
          <ul className='list-disc pl-5 mb-5'>
            <li>First aid kits</li>
            <li>Emergency exits</li>
            <li>Safety personnel</li>
          </ul>
        </div>
      </div>
    </article>
  )
}

export default Resources