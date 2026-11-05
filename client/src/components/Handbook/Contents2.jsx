import React from 'react'
import { IMAGE_BASE } from '../../config/api';

const Contents2 = () => {
  return (
    <article className='flex bg-gray-800 flex-col gap-5 py-10 min-h-200 w-150'>
      <div className="flex h-75">
        <img src={`${IMAGE_BASE}/students.webp`} alt="" />
      </div>
      <div className="flex flex-col px-10 text-white gap-5">
        <span className='text-3xl max-w-70 font-bold mb-5'>Welcome to Student Handbook</span>
        <p className='text-xs'>This handbook has been carefully prepared to provide students with essential information about academic policies, institutional guidelines, campus services, and student responsibilities. It is designed to help you understand the standards and expectations of the institution, as well as the support systems available to assist you throughout your academic journey.</p>
        <p className='text-xs'>This handbook serves as a reliable reference that students are encouraged to consult regularly. By familiarizing yourself with its contents, you will be better equipped to make informed decisions, comply with campus policies, and take full advantage of the opportunities offered by the institution. We hope this handbook supports you in achieving academic success and fostering a positive and respectful campus environment.</p>
        <p className='text-right underline mt-15 font-bold'>Signature</p>
      </div>
    </article>
  )
}

export default Contents2