import React from 'react'
import { BiX, BiUserX } from "react-icons/bi";
import { getAge } from '../../scripts/utility';
import { IMAGE_BASE } from '../../config/api';

const TotalStudents = ({ totalStudentsModal, setTotalStudentsModal, students, setSectionId, loading }) => {

  const closeModal = () => {
    setSectionId("");
    setTotalStudentsModal(false);
  };

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 transition-all duration-300 font-sans
                    ${totalStudentsModal ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/40' : 'opacity-0 pointer-events-none'}`}
         onClick={closeModal}
    >
      <div className={`bg-white w-[95%] md:w-[75%] lg:w-[60%] xl:w-[50%] h-[80vh] shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 relative flex flex-col
                      ${totalStudentsModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
           onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-400 to-indigo-800 px-6 py-5 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-white text-xl font-bold tracking-tight">Student List</h1>
            <p className="text-white text-xs mt-0.5">Section: <span className="font-semibold text-white">{students[0]?.section_code || "Unknown"}</span></p>
          </div>
          <button 
            onClick={closeModal}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
          >
            <BiX className='text-2xl' />
          </button>
        </div>

        {/* Modal Body - Table */}
        <div className="flex-1 overflow-auto bg-gray-50/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-semibold text-xs border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Picture</th>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium text-center">Gender</th>
                <th className="px-6 py-4 font-medium text-center">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                 <tr><td colSpan="3" className='p-8 text-center text-gray-500 italic'>Loading student list...</td></tr>
              ) : (
                students.length > 0 ? (
                  students.map((student, index) => (
                    <tr key={index} className="hover:bg-emerald-50/50 transition-colors group">
                      <td className="px-6 py-3.5 font-medium text-gray-800 group-hover:text-emerald-800 transition-colors">
                        <img className="h-10 w-10 rounded-full" 
                              src={`${IMAGE_BASE}/students/${student.student_image}`}/>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-gray-800 group-hover:text-emerald-800 transition-colors">
                        {`${student.last_name}, ${student.first_name} ${student.middle_name}`} 
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${student.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 
                            student.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-gray-600">
                        {getAge(student.date_of_birth)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-12 flex flex-col items-center justify-center text-gray-400">
                      <BiUserX className='text-4xl mb-2' />
                      <span>No students enrolled in this section.</span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
           <div className="text-sm text-gray-500">
              Total Count: <span className="font-bold text-gray-900">{students.length}</span>
           </div>
           <button 
              onClick={closeModal}
              className='border border-gray-200 bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
            >
              Close
           </button>
        </div>

      </div>
    </div>
  )
}

export default TotalStudents
