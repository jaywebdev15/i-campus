import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const HealthAndSafety = () => {
  return (
    <article className='flex bg-white flex-col justify-start p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>Health and Safety</span>
      <p>The school is committed to promoting the health, well-being, and safety of all students and staff. Policies and procedures are in place to ensure access to health services, proper handling of medications, and preparedness for emergencies. Students are encouraged to take an active role in maintaining their health and following safety guidelines.</p>

            {/* =====> Health Services <===== */}
      <div className="flex flex-col my-5">
        <span className='font-bold text-base mb-1.5'>Health Services:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>School Nurse:</span>
          <p className='flex-1'>The school nurse provides basic healthcare, first aid, and guidance on health-related concerns.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Health Screening:</span>
          <p className='flex-1'>Regular health screenings are conducted to monitor students’ well-being and prevent illness.</p>
        </div>
      </div>

            {/* =====> Medication Policy <===== */}
      <div className="flex flex-col mb-5">
        <span className='font-bold text-base mb-1.5'>Medication Policy:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Administering Medication:</span>
          <p className='flex-1'>Medications may only be administered by authorized personnel according to school guidelines.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Storage of Medications:</span>
          <p className='flex-1'>All medications must be securely stored in designated areas to ensure safety.</p>
        </div>
      </div>

            {/* =====> Health Services <===== */}
      <div className="flex flex-col mb-5">
        <span className='font-bold text-base mb-1.5'>Safety Protocols:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Emergency Procedure:</span>
          <p className='flex-1'>Students should follow school instructions during emergencies to ensure safety.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[30%]'>Safety Drills:</span>
          <p className='flex-1'>Regular safety drills are conducted to prepare students and staff for emergency situations.</p>
        </div>
      </div>

      <div className="flex my-5 rounded-lg overflow-hidden">
        <img src={`${IMAGE_BASE}/health.jpg`} alt="" 
              className='w-full'/>
      </div>

    </article>
  )
}

export default HealthAndSafety