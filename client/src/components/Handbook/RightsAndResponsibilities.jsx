import React from 'react'
import { IoBookSharp } from "react-icons/io5";
import { LuSpeech } from "react-icons/lu";
import { GiInjustice } from "react-icons/gi";
import { FaHandshake, FaSchool } from "react-icons/fa";
import { ImBooks } from "react-icons/im";

const RightsAndResponsibilities = () => {
  return (
    <article className='flex bg-white flex-col justify-start p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>Student Rights and Responsibilities</span>
      <p>Students are entitled to certain rights that support a fair and inclusive learning environment, while also being responsible for upholding school rules and standards. Understanding these rights and responsibilities helps maintain respect, accountability, and a positive school community.</p>

            {/* =====> Student Rights <===== */}
      <div className="flex flex-col gap-7 my-5">
        <span className='text-lg font-bold'>STUDENT RIGHTS:</span>

            {/* =====> A <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-gray-600">
            <IoBookSharp className='text-white' />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Right to Education</span>
            <p>Every student has the right to access quality education in a safe and supportive environment.</p>
          </div>
        </div>
        
            {/* =====> B <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-blue-400">
            <LuSpeech className='text-white'/>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Right to Free Expression</span>
            <p>Students may express their ideas and opinions respectfully, provided it does not disrupt learning or violate school policies.</p>
          </div>
        </div>
        
            {/* =====> C <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-gray-600">
            <GiInjustice />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Right to Due Process</span>
            <p>Students have the right to fair and transparent procedures when school rules are enforced.</p>
          </div>
        </div>
      </div>
      
            {/* =====> Student Responsibilities <===== */}
      <div className="flex flex-col gap-7 my-5">
        <span className='text-lg font-bold'>STUDENT RESPONSIBILITIES:</span>

            {/* =====> A <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-gray-600">
            <FaHandshake />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Respect Others</span>
            <p>Students are responsible for treating peers, teachers, and staff with courtesy and respect.</p>
          </div>
        </div>
        
            {/* =====> B <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-blue-400">
            <FaSchool />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Follow School Policies</span>
            <p>Students must comply with school rules, guidelines, and academic requirements.</p>
          </div>
        </div>
        
            {/* =====> C <===== */}
        <div className="flex flex-row items-center gap-5">
          <div className="flex justify-center items-center rounded-full text-xl h-10 w-10 font-extrabold bg-gray-600">
            <ImBooks />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-base">Engage in Learning</span>
            <p>Students are expected to participate actively in their learning and academic activities.</p>
          </div>
        </div>
      </div>

    </article>
  )
}

export default RightsAndResponsibilities