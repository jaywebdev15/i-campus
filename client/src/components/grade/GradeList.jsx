import React from 'react'
import { BiPlus, BiInfoCircle, BiEdit, BiTrash } from 'react-icons/bi';

const GradeList = ({ grades, setGradeId, setGradeModal, loading, selectedTab }) => {

  return (
    <div className={`flex flex-col gap-2 p-3 border border-gray-300 rounded-b-lg rounded-tr-lg 
                      ${selectedTab === "Grading" 
                          ? '' 
                          : 'hidden'
                      }`}>
      <div className="flex flex-row items-center">
        <div className="flex-1 font-bold text-2xl">Grades' List ({grades.length})</div>
        <button className="flex flex-row items-center gap-1.5 border border-gray-700 rounded-md py-0.5 px-2 cursor-pointer" 
                onClick={() => setGradeModal("add")}>
          <BiPlus className="text-lg" /> 
          <span>Add New grades</span>
        </button>
      </div>
      <div className="h-150 overflow-auto rounded-lg border border-gray-700 hide-scrollbar
                      lg:max-w-[calc(100vw-323px)]">
        <table className='whitespace-nowrap w-full'>
          <thead className='p-5 sticky top-0 bg-gray-500'>
            <tr>
              <th className='py-5 px-4 text-left'>Action</th>
              <th className='py-5 px-4 text-left'>Student Name</th>
              <th className='py-5 px-4 text-left'>Subject</th>
              <th className='py-5 px-4 text-left'>Criteria</th>
              <th className='py-5 px-4 text-left'>Assessment</th>
              <th className='py-5 px-4 text-left'>Grading Term</th>
              <th className='py-5 px-4 text-left'>Date</th>
              <th className='py-5 px-4 text-left'>Grade</th>
            </tr>
          </thead>
          <tbody>
            {loading 
              ? (
                <tr><td colSpan="7" className='p-2'>Loading...</td></tr>
              ) : (
                grades.length > 0 ? (
                  grades.map((grade, index) => (
                    <tr key={index} 
                        className='cursor-pointer 
                                transition-all duration-100 
                                even:bg-gray-300 
                                hover:bg-gray-700 hover:text-white
                                '>
                        <td className='flex items-center justify-center text-lg p-2'>
                          <BiInfoCircle  className='p-2 text-blue-500 rounded-full hover:bg-blue-100 text-4xl transition-colors' 
                              onClick={() => {
                              setGradeId(grade.grade_id); 
                          }} />
                          <BiEdit className='p-2 text-green-500 rounded-full hover:bg-green-100 text-4xl transition-colors' 
                              onClick={() => {
                                setGradeId(grade.grade_id);
                                setGradeModal("edit");
                          }} />
                          <BiTrash className='p-2 text-red-500 rounded-full hover:bg-red-100 text-4xl transition-colors' />
                        </td>
                        <td className='py-1 px-2'>{`${grade.last_name}, ${grade.first_name} ${grade.middle_name}`}</td>
                        <td className='py-1 px-2'>{`${grade.subject_title} (${grade.subject_code})`}</td>
                        <td className='py-1 px-2'>{grade.criteria_name}</td>
                        <td className='py-1 px-2'>{grade.assessment}</td>
                        <td className='py-1 px-2'>{grade.grading_term}</td>
                        <td className='py-1 px-2'>{grade.date}</td>
                        <td className='py-1 px-2'>{grade.grade}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className='p-2'>No grades available</td>
                  </tr>
                )
              )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GradeList