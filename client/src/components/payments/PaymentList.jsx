import React from 'react'
import { FaInfoCircle, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';

const PaymentList = ({ 
    enrollees, 
    loading, 
    paginationInfo, 
    page, 
    setPage, 
    setSelectedEnrolleeId, 
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    handleSort,
    paymentStatus,
    setPaymentStatus
}) => {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* List Header: Title */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment List</h2>
                   <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage student payment records</p>
                </div>
            </div>
            
            {/* Filter */}
            <div className="px-8 pb-4">
                <FilterAndSearch 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm}
                    category={paymentStatus}
                    setCategory={setPaymentStatus}
                    categoryTypes={{
                        "Paid": [],
                        "Partial": [],
                        "Unpaid": []
                    }}
                />
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
                    <table className='whitespace-nowrap min-w-full text-xs text-left'>
                        <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                            <tr className="bg-white">
                                <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 text-center'>Action</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('student_number')}>
                                    <div className="flex items-center gap-1">
                                        Student ID
                                        {sortBy === 'student_number' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('last_name')}>
                                    <div className="flex items-center gap-1">
                                        Student Name
                                        {sortBy === 'last_name' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Assessment</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Paid</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Balance</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Status</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Date Enrolled</th>
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
                            ) : enrollees.length > 0 ? (
                                enrollees.map((enrollee, index) => {
                                    const balance = parseFloat(enrollee.total_assessment) - parseFloat(enrollee.total_paid);
                                    return (
                                        <tr key={index} className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                                            <td className='sticky left-0 z-30 py-4 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors text-center'>
                                                <button className='p-1.5 text-sky-400 hover:bg-sky-50 rounded-lg transition-all group/btn' 
                                                        title="View Payment Details"
                                                        onClick={() => {
                                                            setSelectedEnrolleeId(enrollee.enrollment_id);
                                                            setIsModalOpen(true);
                                                        }}>
                                                    <FaInfoCircle className='text-lg group-active/btn:scale-90 transition-transform' />
                                                </button>
                                            </td>
                                            <td className='py-4 px-4 text-gray-900 font-black text-[0.8rem] tracking-tight'>{enrollee.student_number}</td>
                                            <td className='py-4 px-4'>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-gray-900 font-black text-[0.8rem]">{enrollee.last_name}, {enrollee.first_name}</span>
                                                </div>
                                            </td>
                                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>₱{parseFloat(enrollee.total_assessment).toLocaleString()}</td>
                                            <td className='py-4 px-4 text-emerald-600 font-black text-[0.8rem]'>₱{parseFloat(enrollee.total_paid).toLocaleString()}</td>
                                            <td className={`py-4 px-4 font-black text-[0.8rem] ${balance > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                                                ₱{balance.toLocaleString()}
                                            </td>
                                            <td className='py-4 px-4 text-center'>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                    enrollee.calculated_status === 'Paid' ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10' : 
                                                    enrollee.calculated_status === 'Partial' ? 'bg-amber-50 text-amber-600 ring-amber-600/10' : 
                                                    'bg-rose-50 text-rose-600 ring-rose-600/10'}`}>
                                                    {enrollee.calculated_status}
                                                </span>
                                            </td>
                                            <td className='py-4 px-4 text-gray-400 font-bold text-[0.75rem]'>{enrollee.date_enrolled}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No payment records found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
                <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo} />
            </div>
        </div>
    )
}

export default PaymentList
