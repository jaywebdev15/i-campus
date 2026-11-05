import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Curricular = () => {
  return (
    <article className='flex bg-white flex-col justify-start p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>Extra Curricular Activities</span>
      <p>The school encourages students to participate in extra-curricular activities to develop their skills, interests, and talents beyond the classroom. These activities help foster teamwork, leadership, creativity, and personal growth.</p>

            {/* =====> Bullets <===== */}
      <div className="flex flex-col gap-7 my-5">

            {/* =====> A <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-gray-600">
            A
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Athletics</span>
            <p>The school offers a variety of athletic programs and sports teams that promote physical fitness, teamwork, and sportsmanship among students.</p>
          </div>
        </div>
        
            {/* =====> B <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-blue-400">
            B
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Clubs and Organizations</span>
            <p>Students can join various clubs and organizations to explore hobbies, develop leadership skills, and engage with peers who share similar interests.</p>
          </div>
        </div>
        
            {/* =====> C <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-gray-600">
            C
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Music and Performing Arts</span>
            <p>The school provides opportunities for students to participate in music, drama, and other performing arts, enhancing creativity and self-expression.</p>
          </div>
        </div>
        
            {/* =====> D <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-blue-400">
            D
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Academic Competitions</span>
            <p>Students are encouraged to take part in academic competitions to challenge their knowledge, critical thinking, and problem-solving skills.</p>
          </div>
        </div>

      </div>

      <div className="flex my-5 rounded-lg overflow-hidden">
        <img src={`${IMAGE_BASE}/extracurricular.jfif`} alt="" 
              className='h-60 w-full'/>
      </div>

    </article>
  )
}

export default Curricular