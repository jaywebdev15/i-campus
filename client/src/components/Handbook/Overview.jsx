import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Overview = () => {
  return (
    <article className='flex bg-white flex-col justify-between p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>School Overview</span>
      <p>The school is a learner-centered institution committed to providing quality, inclusive, and innovative education that fosters academic excellence, character development, and lifelong learning.</p>
      <div className="flex flex-row gap-5">
        <div className="flex-1 flex flex-col">
          <span className='text-base font-bold my-2'>About School:</span>
          <p>The school was founded to provide accessible, quality education that prepares students for academic and personal success. It offers structured programs, skilled educators, and modern resources in a safe and engaging environment. Students are encouraged to develop skills, values, and social responsibility.</p>
          <span className='text-base font-bold my-2'>Mission:</span>
          <p>The mission of the school is to provide a holistic and quality education that nurtures academic excellence, personal growth, and social responsibility. The school is committed to:</p>
          <ul className='list-disc pl-5'>
            <li>Delivering programs that promote critical thinking and lifelong learning</li>
            <li>Instilling values, discipline, and ethical behavior in students</li>
            <li>Equipping students with the skills and knowledge to contribute positively to society</li>
          </ul>
        </div>
        <div className="flex-1">
          <img src={`${IMAGE_BASE}/overview.jfif`} alt="" 
              className='h-full w-full shadow-lg' />
        </div>
      </div>
      <div className="flex flex-col">
        <span className='text-base font-bold my-2'>Vision:</span>
        <p className='mb-1'>The school envisions developing competent, ethical, and globally competitive learners who can thrive in a changing world. It aims:</p>
        <ul className='list-disc pl-5'>
          <li>To be a center of excellence in teaching, learning, and innovation</li>
          <li>To foster a community that upholds integrity, inclusivity, and social responsibility</li>
        </ul>
      </div>
      
      <div className="flex h-35">
        <img src={`${IMAGE_BASE}/students.webp`} alt="" />
      </div>
    </article>
  )
}

export default Overview