import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Conduct = () => {
  return (
    <article className='flex bg-white flex-col justify-start p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>Student Conduct</span>
      <p>Students are expected to conduct themselves responsibly and demonstrate behavior that reflects the values and standards of the school. Good conduct includes showing respect for others, acting with integrity, and taking accountability for one’s actions, both inside and outside the classroom. By adhering to these standards, students contribute to a safe, positive, and productive learning environment for everyone.</p>

      <div className="flex my-5 rounded-lg overflow-hidden">
        <img src={`${IMAGE_BASE}/conduct.jfif`} alt="" 
              className='w-full'/>
      </div>

            {/* =====> Behaviour Expectations <===== */}
      <div className="flex flex-col mb-5">
        <span className='font-bold text-base mb-1.5'>Behaviour Expectations:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Respect for Others:</span>
          <p className='flex-1'>Students must treat peers, teachers, and staff with courtesy, fairness, and consideration.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Classroom Conduct:</span>
          <p className='flex-1'>Students are expected to participate actively, follow class rules, and maintain a positive learning environment.</p>
        </div>
      </div>

            {/* =====> Dress Code <===== */}
      <div className="flex flex-col">
        <span className='font-bold text-base mb-1.5'>Dress Code:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>General Guidelines:</span>
          <p className='flex-1'>Students should wear clothing that is neat, clean, and suitable for an academic setting. Clothing with offensive language, imagery, or messages that disrupt the learning environment is not permitted.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Classroom Dress:</span>
          <p className='flex-1'>Students should wear clothing that allows comfortable and safe participation in class activities. Required uniforms must be worn properly and maintained in good condition.</p>
        </div>
      </div>

    </article>
  )
}

export default Conduct