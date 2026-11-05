import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Calendar = () => {
  return (
    <article className='flex bg-white flex-col justify-start p-10 min-h-200 w-150 text-sm'>
      <span className='text-2xl font-bold mb-2'>School Calendar</span>
      <p>The school calendar provides an overview of important dates and events throughout the academic year, including the start and end of terms, holidays, and school activities. Students and parents are encouraged to consult the calendar regularly to stay informed and plan accordingly.</p>

      <div className="flex my-5 rounded-lg overflow-hidden">
        <img src={`${IMAGE_BASE}/calendar.jfif`} alt="" 
              className='h-60 w-full'/>
      </div>
      
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <span className='font-bold text-lg'>Academic Year Schedule:</span>
          <p className='my-2'>The academic year schedule outlines the specific timeline of classes, examinations, and other academic activities. It helps students organize their studies, manage deadlines, and participate effectively in school programs.</p>
          <p>First Day of School (June 1, 2026)</p>
          <p>Last Day of Schoold (May 26, 2027)</p>
          <p>1st Semester Break (October 3, 2026)</p>
        </div>
        <div className="flex flex-col">
          <span className='font-bold text-lg mb-2'>Holiday and No-Schoold Days:</span>
          <p>Independence Day</p>
          <p>All Saint's Day</p>
          <p>All Soul's Day</p>
          <p>Immaculate Concepcion</p>
        </div>
      </div>

    </article>
  )
}

export default Calendar