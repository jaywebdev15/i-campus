import Pagination from '../shared/Pagination';
import FilterAndSearch from '../shared/FilterAndSearch';
import Command from '../shared/Command';
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { IMAGE_BASE } from '../../config/api';

const TeacherStudentList = ({ students = [], setModal, page, setPage, paginationInfo, loading, category, setCategory, searchTerm, setSearchTerm, categoryTypes, subCategory, setSubCategory, subOptions, activeNav, sortBy, sortOrder, handleSort }) => {
  const { total } = paginationInfo;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* List Header: Title + Buttons */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Students ({total})</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your student records</p>
        </div>
        <Command  handleExport={() => {}} 
                  handleImport={() => {}} 
                  setModal={setModal} 
                  activeNav={activeNav} 
                  hideExport={true} 
                  hideImport={true}
                  buttonText="Add Student" />
      </div>

      {/* Search & Filter Bar */}
      <div className="px-8 pb-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
        <FilterAndSearch  category={category} 
                          setCategory={setCategory} 
                          categoryTypes={categoryTypes} 
                          searchTerm={searchTerm} 
                          setSearchTerm={setSearchTerm} 
                          subCategory={subCategory} 
                          setSubCategory={setSubCategory} 
                          subOptions={subOptions} />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-4">
            <table className='whitespace-nowrap min-w-full text-xs text-left'>
              <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                <tr className="bg-white">
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Picture</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('student_number')}>
                      <div className="flex items-center gap-1">
                        Student ID
                        {sortBy === 'student_number' 
                          ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                          : <FaSort className="text-gray-200" />}
                      </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('last_name')}>
                      <div className="flex items-center gap-1">
                        Full Name
                        {sortBy === 'last_name' 
                          ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                          : <FaSort className="text-gray-200" />}
                      </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('section_code')}>
                      <div className="flex items-center gap-1">
                        Section
                        {sortBy === 'section_code' 
                          ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                          : <FaSort className="text-gray-200" />}
                      </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Gender</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Course & Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className='p-12 text-center'>
                      <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </td>
                  </tr>
                ) : 
                  students && students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={index} 
                          className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                          <td className='py-4 px-4'>
                            <div className="flex items-center rounded-xl bg-gray-100 w-9 h-9 overflow-hidden shadow-inner">
                              <img src={student.student_image 
                                          ? `${IMAGE_BASE}/students/${student.student_image}` 
                                          : `${IMAGE_BASE}/user.jpg` 
                                    } 
                                    alt="" 
                                    className='h-full w-full object-cover'/>
                            </div>
                          </td>
                          <td className='py-4 px-4 font-bold text-gray-400'>#{student.student_number}</td>
                          <td className='py-4 px-4'>
                            <div className="flex flex-col">
                              <span className="font-black text-gray-900 leading-tight">{`${student.last_name}, ${student.first_name}`}</span>
                              <span className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{student.email_address || 'No email provided'}</span>
                            </div>
                          </td>
                          <td className='py-4 px-4'>
                             <span className="text-[0.65rem] font-bold text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">{student.section_code}</span>
                          </td>
                          <td className='py-4 px-4'>
                             <span className="text-[0.65rem] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-1 rounded-md">{student.gender}</span>
                          </td>
                          <td className='py-4 px-4'>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">{student.course_code}</span>
                              <span className="text-[0.6rem] text-gray-400 font-black uppercase">{student.contact_number}</span>
                            </div>
                          </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className='p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[0.6rem]'>No students found assigned to your sections.</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
      </div>

      {/* List Footer: Pagination */}
      <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
        <Pagination page={page} 
                    setPage={setPage} 
                    paginationInfo={paginationInfo} />
      </div>
    </div>
  )
}

export default TeacherStudentList
