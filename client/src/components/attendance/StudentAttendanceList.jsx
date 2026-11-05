import React from 'react'
import Pagination from '../shared/Pagination';
import { BiCalendarCheck } from 'react-icons/bi';

const StudentAttendanceList = ({ attendance, loading, paginationInfo, page, setPage }) => {
  return (
    <div className="flex flex-col h-full bg-white">
        <div className="px-8 py-6">
             <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <BiCalendarCheck className='text-blue-600'/> My Attendance
             </h2>
             <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">View your attendance history</p>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
                 <table className='whitespace-nowrap min-w-full text-xs text-left'>
                    <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                         <tr>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Date</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Subject</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Time In</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Time Out</th>
                            <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Status</th>
                         </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                        {loading ? (
                             <tr>
                                <td colSpan="5" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : attendance.length > 0 ? (
                            attendance.map((record, index) => (
                                <tr key={index} className='hover:bg-blue-50/30 transition-colors'>
                                    <td className='py-3 px-4 text-gray-900 font-bold'>{record.attendance_date}</td>
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
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan="5" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No attendance records</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>

        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
             <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: attendance.length }} />
        </div>
    </div>
  )
}

export default StudentAttendanceList
