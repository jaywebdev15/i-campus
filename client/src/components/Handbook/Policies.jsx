import React from 'react'

const Policies = () => {
  return (
    <article className='flex bg-white flex-col justify-between p-10 min-h-200 w-150 text-xs'>
      <span className='text-2xl font-bold mb-2'>Academic Policies</span>
      <p>Academic integrity is the foundation of a fair and honest learning environment. It reflects the commitment of students, faculty, and the institution to uphold honesty, trust, fairness, respect, and responsibility in all academic work. Maintaining academic integrity ensures that students’ achievements are genuine, knowledge is properly credited, and the academic community remains credible and respected.</p>

            {/* =====> Academic Integrity <===== */}
      <div className="flex flex-col">
        <span className='font-bold text-base'>Academic Integrity:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Definition:</span>
          <p className='flex-1'>Academic integrity is the practice of being honest and ethical in all academic activities, including assignments, examinations, research, and collaborative work.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Expectation:</span>
          <p className='flex-1'>Students are expected to uphold academic integrity by avoiding plagiarism, cheating, fabrication, and any form of academic dishonesty, while giving proper credit to others’ work and maintaining personal responsibility in learning.</p>
        </div>
      </div>

            {/* =====> Grading Policy <===== */}
      <div className="flex flex-col">
        <span className='font-bold text-base'>Grading Policy:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Grading Scale:</span>
          <p className='flex-1'>The grading scale defines the range of scores corresponding to each grade, ensuring consistency and fairness in evaluating student performance.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Grade Calculation:</span>
          <p className='flex-1'>Grade calculation refers to the process of determining a student’s final grade by combining scores from assignments, exams, projects, participation, and other academic activities according to their respective weights.</p>
        </div>
      </div>

            {/* =====> Attendance Policy <===== */}
      <div className="flex flex-col">
        <span className='font-bold text-base'>Attendance Policy:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Attendance Requirements:</span>
          <p className='flex-1'>The grading scale defines the range of scores corresponding to each grade, ensuring consistency and fairness in evaluating student performance.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Unexcuse Absences:</span>
          <p className='flex-1'>Grade calculation refers to the process of determining a student’s final grade by combining scores from assignments, exams, projects, participation, and other academic activities according to their respective weights.</p>
        </div>
      </div>

            {/* =====> Academic Support Service <===== */}
      <div className="flex flex-col">
        <span className='font-bold text-base'>Academic Support Service:</span>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Computing Services:</span>
          <p className='flex-1'>The grading scale defines the range of scores corresponding to each grade, ensuring consistency and fairness in evaluating student performance.</p>
        </div>
        <div className="flex flex-row gap-5">
          <span className='font-bold w-[20%]'>Unexcuse Absences:</span>
          <p className='flex-1'>Grade calculation refers to the process of determining a student’s final grade by combining scores from assignments, exams, projects, participation, and other academic activities according to their respective weights.</p>
        </div>
      </div>

    </article>
  )
}

export default Policies