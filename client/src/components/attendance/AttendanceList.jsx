
import { FaInfoCircle, FaEdit, FaRegTrashAlt, FaCalendarAlt } from "react-icons/fa";
import { BiPlus, BiImport, BiExport } from "react-icons/bi"; // Assuming these are needed for Command equivalent
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';
import Command from '../shared/Command'; // Assuming Command is uniform

const AttendanceList = ({ 
  attendance, 
  loading, 
  setModal, 
  categoryTypes,
  category, 
  setCategory, 
  subCategory, 
  setSubCategory, 
  subOptions,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  page, 
  setPage, 
  paginationInfo,
  searchTerm,
  setSearchTerm
}) => {
  
  return (
    <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Log</h2>
                <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Monitor student attendance records</p>
            </div>
             <div className="flex items-center gap-2">
                 {/* Manually building command buttons if Command component is too specific */}
                 <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-blue-600/30">
                    <BiPlus className='text-lg'/> <span className="text-xs font-bold uppercase tracking-wider">Record Attendance</span>
                 </button>
             </div>
        </div>

        {/* Filters */}
        <div className="px-8 pb-4 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full sm:max-w-3xl">
                 <FilterAndSearch 
                    category={category} 
                    setCategory={setCategory} 
                    categoryTypes={categoryTypes}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    subCategory={subCategory} 
                    setSubCategory={category !== "Date_From_To" ? setSubCategory : undefined} 
                    subOptions={subOptions} 
                >
                    {category === "Date_From_To" && (
                        <div className="flex gap-2 items-center">
                            <input 
                                type="date" 
                                value={dateFrom || ""} 
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-600 outline-none focus:border-blue-300 h-11"
                            />
                            <span className="text-gray-400 font-bold">-</span>
                            <input 
                                type="date" 
                                value={dateTo || ""} 
                                onChange={(e) => setDateTo(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-600 outline-none focus:border-blue-300 h-11"
                            />
                        </div>
                    )}
                </FilterAndSearch>
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
                <table className='whitespace-nowrap min-w-full text-xs text-left'>
                    <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                        <tr>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Date</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Student No.</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Name</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Subject</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Time In</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Time Out</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Status</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Recorded By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                        {loading ? (
                             <tr>
                                <td colSpan="8" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : attendance.length > 0 ? (
                            attendance.map((record, index) => (
                                <tr key={index} className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                                    <td className='py-3 px-4 text-gray-900 font-bold'>{record.attendance_date}</td>
                                    <td className='py-3 px-4 text-gray-600 font-mono'>{record.student_number}</td>
                                    <td className='py-3 px-4 text-gray-800 font-semibold'>{record.student_lastname || record.last_name}, {record.student_firstname || record.first_name}</td>
                                    <td className='py-3 px-4 text-blue-600 font-bold'>{record.subject_code}</td>
                                    <td className='py-3 px-4 text-gray-600'>{record.time_in}</td>
                                    <td className='py-3 px-4 text-gray-600'>{record.time_out}</td>
                                    <td className='py-3 px-4 text-center'>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ring-1 ring-inset ${
                                            record.attendance_status === 'Present' ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10' : 
                                            record.attendance_status === 'Absent' ? 'bg-rose-50 text-rose-600 ring-rose-600/10' : 
                                            record.attendance_status === 'Late' ? 'bg-amber-50 text-amber-600 ring-amber-600/10' :
                                            'bg-gray-50 text-gray-600 ring-gray-600/10'}`}>
                                            {record.attendance_status}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4 text-gray-400 text-[0.7rem] italic'>{record.recorded_by}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No attendance records found</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
             <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: attendance.length }} />
        </div>
    </div>
  )
}

export default AttendanceList
