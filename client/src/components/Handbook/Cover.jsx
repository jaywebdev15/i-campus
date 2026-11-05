import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Cover = () => {
  return (
    <article className='flex bg-white flex-col justify-between p-10 min-h-200 w-150'>
      <div className='flex gap-2'>
        <img src={`${IMAGE_BASE}/logo/i-campus3.png`} alt="" 
              className='h-12' />
        <div className="flex flex-col">
          <span className='font-bold'>i-Campus University</span>
          <span className='text-xs'>“Your Digital Gateway to Academic Excellence.”</span>
        </div>
      </div>
      <div className="flex flex-col gap-5 pb-5">
        <div className='flex flex-col'>
          <span className='font-bold text-5xl'>Student</span>
          <span className='font-cold text-7xl text-blue-400 underline'>Handbook</span>
          <span className='mt-5'>This handbook is your go-to guide for policies, services, and opportunities to help you succeed throughout your academic journey.</span>
        </div>
        <div className="h-80 flex rounded-tl-4xl rounded-br-4xl overflow-hidden mt-10">
          <img src={`${IMAGE_BASE}/graduate.jfif`} alt="" 
                className='w-full' />
        </div>
      </div>
    </article>
  )
}

export default Cover