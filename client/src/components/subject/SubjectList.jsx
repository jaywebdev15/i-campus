import React from 'react'
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';

const SubjectList = ({ 
  subjects, 
  setSubjectId, 
  loading, 
  setModal, 
  categoryTypes,
  category,
  setCategory,
  searchTerm,
  setSearchTerm,
  subCategory,
  setSubCategory,
  subOptions,
  page,
  setPage,
  paginationInfo,
  sortBy, 
  sortOrder, 
  handleSort
}) => {
  const { total } = paginationInfo || { total: subjects.length };



  return (
    <div className="flex flex-col h-full bg-white">
            {/* List Header */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Subject List</h2>
                   <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage academic subjects & units</p>
                </div>

            </div>
            
            {/* Filter */}
            <div className="px-8 pb-4">
                <FilterAndSearch  category={category} 
                                  setCategory={setCategory} 
                                  categoryTypes={categoryTypes || {}} 
                                  searchTerm={searchTerm} 
                                  setSearchTerm={setSearchTerm} 
                                  subCategory={subCategory} 
                                  setSubCategory={setSubCategory} 
                                  subOptions={subOptions || []} />
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
                    <table className='whitespace-nowrap min-w-full text-xs text-left'>
                        <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                            <tr className="bg-white">
                                {/* Action Column Removed */}
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('subject_code')}>
                                    <div className="flex items-center gap-1">
                                        Code
                                        {sortBy === 'subject_code' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('subject_title')}>
                                    <div className="flex items-center gap-1">
                                        Title
                                        {sortBy === 'subject_title' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Description</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('units')}>
                                    <div className="flex items-center gap-1">
                                        Units
                                        {sortBy === 'units' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('price')}>
                                    <div className="flex items-center gap-1">
                                        Price
                                        {sortBy === 'price' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                 <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('category')}>
                                    <div className="flex items-center gap-1">
                                        Category
                                        {sortBy === 'category' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('subject_status')}>
                                    <div className="flex items-center justify-center gap-1">
                                        Status
                                        {sortBy === 'subject_status' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading subjects...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : subjects.length > 0 ? (
                                subjects.map((subject, index) => (
                                    <tr key={index} 
                                        className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 cursor-pointer'
                                        onClick={() => {
                                            setSubjectId(subject.subject_id);
                                            setModal("info");
                                        }}>
                                        {/* Action Column Removed */}
                                        <td className='py-3 px-4 text-gray-900 font-black text-[0.8rem] tracking-tight'>{subject.subject_code}</td>
                                        <td className='py-3 px-4 text-gray-700 font-bold text-[0.8rem]'>{subject.subject_title}</td>
                                        <td className='py-3 px-4 text-gray-500 text-[0.75rem] max-w-md truncate' title={subject.subject_description}>{subject.subject_description}</td>
                                        <td className='py-3 px-4 font-black text-gray-900 text-[0.8rem]'>{subject.units}</td>
                                        <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{subject.price}</td>
                                        <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{subject.category}</td>
                                        <td className='py-3 px-4 text-center'>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                subject.subject_status === 'Active' ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10' : 'bg-rose-50 text-rose-600 ring-rose-600/10'}`}>
                                                {subject.subject_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No subjects available</span>
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
                <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: subjects.length }} />
            </div>
        </div>
  )
}

export default SubjectList
