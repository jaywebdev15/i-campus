import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Contents = () => {
  return (
    <article className='flex bg-white flex-col justify-between p-10 min-h-200 w-150 font-bold'>
      <span className='text-2xl'>Table of Contents</span>
      <span className='text-xs font-normal'>The Table of Contents serves as a guide to the policies, procedures, and resources outlined in this handbook</span>
      <span>01. School Overview</span>
      <span>02. Academic Policies</span>
      <span>03. Student Conduct</span>
      <span>04. Health and Safety</span>
      <span>05. Resources</span>
      <span>06. Extracurricular Activities</span>
      <span>07. School Calendar</span>
      <span>08. Parents and Guardian Envolvement</span>
      <span>09. Community Service</span>
      <span>10. Student Rights and Responsibilities</span>
      <div className="flex h-50">
        <img src={`${IMAGE_BASE}/students.webp`} alt="" />
      </div>
    </article>
  )
}

export default Contents