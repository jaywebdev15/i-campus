import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import Command from '../shared/Command';
import FilterAndSearch from '../shared/FilterAndSearch';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import Pagination from '../shared/Pagination';
import { FaInfoCircle, FaEdit, FaRegIdBadge, FaRegTrashAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";
import { AiFillPrinter } from "react-icons/ai";

const EnrollmentList = ({ 
  enrollees, 
  setModal, 
  setEnrolleeId, 
  loading, 
  setEnrollmentModalInfo, 
  setEnrolleeCardModal, 
  paginationInfo, 
  page, 
  setPage, 
  categoryTypes, 
  category, 
  setCategory, 
  activeNav, 
  subCategory, 
  setSubCategory, 
  subOptions, 
  searchTerm, 
  setSearchTerm, 
  fetchEnrollees,
  selectedIds, 
  setSelectedIds, 
  selectionMode, 
  setSelectionMode, 
  sortBy, 
  sortOrder, 
  handleSort
}) => {
  const { showFlashMessage } = useContext(FlashMessageContext);
  const { total } = paginationInfo;

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allPageIds = enrollees.map(e => e.enrollment_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === enrollees.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (selectedIds.length === enrollees.length && enrollees.length > 0)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(enrollees.map(e => e.enrollment_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(enrollees.map(e => e.enrollment_id)); // Visually select current page too
  };

  const handleExport = async (format) => {
      let dataToExport = [];

      if (selectionMode === 'all') {
          // Fetch ALL data
          try {
             const response = await fetch(`${API_BASE}/database/enrollments.php` , {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchEnrollees", 
                  category: category, 
                  subCategory: subCategory, 
                  searchTerm: searchTerm, 
                  page: 1,
                  limit: 1000000 // Large limit to get all
                })
              });
              const result = await response.json();
              dataToExport = result.records || result; 
          } catch (error) {
              console.error("Error fetching all data for export", error);
              showFlashMessage("error", "Failed to fetch all data for export");
              return;
          }
      } else {
          // Export selected IDs from current page
          if (selectedIds.length === 0) {
            showFlashMessage("error", "Please select items to export.");
            return;
          }
          dataToExport = enrollees.filter(e => selectedIds.includes(e.enrollment_id));
      }

      if (dataToExport.length === 0) {
        showFlashMessage("error", "No data to export.");
        return;
      }

      const response = await fetch(`${API_BASE}/database/export.php?format=${format}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToExport)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "enrollees.csv" : "enrollees.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchEnrollees();
  };

  const [showDropdown, setShowDropdown] = useState(false);

  const handleDeselectAll = () => {
    setSelectedIds([]);
    setSelectionMode('none');
    setShowDropdown(false);
  };

  const handleSelectAllGlobalAndClose = () => {
    handleSelectAllGlobal();
    setShowDropdown(false);
  }

  const handleSelectAllPageAndClose = () => {
    handleSelectAllPage();
    setShowDropdown(false);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* List Header: Title + Buttons */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Enrollment List</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage student enrollment records</p>
        </div>
        <Command  handleExport={handleExport} 
                  handleImport={handleImport} 
                  setModal={setModal} 
                  activeNav={activeNav}
                  buttonText="Add Enrollment" />
      </div>

      {/* Search and Filters */}
      <div className="px-8 pb-4">
        <FilterAndSearch category={category} 
                          setCategory={setCategory} 
                          categoryTypes={categoryTypes} 
                          searchTerm={searchTerm} 
                          setSearchTerm={setSearchTerm} 
                          subCategory={subCategory} 
                          setSubCategory={setSubCategory} 
                          subOptions={subOptions}  />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
            <table className='whitespace-nowrap min-w-full text-xs text-left'>
              <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                <tr className="bg-white">
                  <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 flex items-center gap-2'>
                    <div className="flex items-center gap-1 relative">
                        <input type="checkbox" 
                            className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-300"
                            checked={enrollees.length > 0 && selectedIds.length === enrollees.length}
                            onChange={handleSelectAllPage} />
                        <BiChevronDown className="text-lg cursor-pointer hover:bg-gray-50 rounded p-0.5 transition-colors" onClick={() => setShowDropdown(!showDropdown)} />
                        
                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <ul className="text-[0.7rem] font-bold uppercase tracking-wider">
                                    <li className="px-4 py-3 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2 transition-colors" onClick={handleSelectAllPageAndClose}>
                                        <BiListCheck className="text-lg" /> Select Current Page
                                    </li>
                                    <li className="px-4 py-3 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2 transition-colors" onClick={handleSelectAllGlobalAndClose}>
                                        <BiWorld className="text-lg" /> Select All Data ({total})
                                    </li>
                                    <li className="px-4 py-3 hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center gap-2 text-red-500 border-t border-gray-50 transition-colors mt-1" onClick={handleDeselectAll}>
                                        <BiX className="text-lg" /> Deselect All
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Photo</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('student_number')}>
                    <div className="flex items-center gap-1">
                      Student ID
                      {sortBy === 'student_number' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('last_name')}>
                    <div className="flex items-center gap-1">
                      Student Name
                      {sortBy === 'last_name' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('education_level')}>
                    <div className="flex items-center gap-1">
                      Level
                      {sortBy === 'education_level' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('course_code')}>
                    <div className="flex items-center gap-1">
                      Course
                      {sortBy === 'course_code' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('year_level')}>
                    <div className="flex items-center gap-1">
                      Year
                      {sortBy === 'year_level' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('semester')}>
                    <div className="flex items-center gap-1">
                      Term
                      {sortBy === 'semester' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('section_code')}>
                    <div className="flex items-center gap-1">
                      Section
                      {sortBy === 'section_code' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('enrollee_status')}>
                    <div className="flex items-center gap-1">
                      Enrollment
                      {sortBy === 'enrollee_status' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('payment_status')}>
                    <div className="flex items-center gap-1">
                      Payment
                      {sortBy === 'payment_status' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                {loading 
                  ? (
                    <tr><td colSpan="12" className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                      </div>
                    </td></tr>
                  ) : (
                    enrollees.length > 0 ? (
                      enrollees.map((enrollee, index) => (
                        <tr key={index} 
                            className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                            <td className='sticky left-0 z-30 py-4 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors'>
                              <input type="checkbox" 
                                      className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-300"
                                      checked={selectedIds.includes(enrollee.enrollment_id)}
                                      onChange={() => toggleSelectId(enrollee.enrollment_id)}
                                      onClick={(e) => e.stopPropagation()} />
                            </td>
                            <td className='py-4 px-4'>
                              <div className="flex justify-center">
                                <div className="rounded-2xl ring-4 ring-gray-50/50 w-11 h-11 overflow-hidden shadow-sm border border-white">
                                  <img src={enrollee.student_image 
                                              ? `${API_BASE}/images/students/${enrollee.student_image}` 
                                              : `${API_BASE}/images/user.jpg` 
                                        } 
                                        alt="" 
                                        className='h-full w-full object-cover'/>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-gray-900 font-black text-[0.85rem] tracking-tight'>{enrollee.student_number}</td>
                            <td className='py-4 px-4'>
                              <div className="flex flex-col leading-tight">
                                <span className="text-gray-900 font-black text-[0.8rem]">{enrollee.last_name}, {enrollee.first_name}</span>
                                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{enrollee.middle_name || '...'}</span>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{enrollee.education_level}</td>
                            <td className='py-4 px-4 text-gray-900 font-black text-[0.8rem]'>{enrollee.course_code}</td>
                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{enrollee.year_level}</td>
                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{enrollee.semester}</td>
                            <td className='py-4 px-4'>
                              <span className="text-blue-600 font-black text-[0.75rem] bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/50">
                                {enrollee.section_code}
                              </span>
                            </td>
                            <td className='py-4 px-4'>
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ring-1 ring-inset ${
                                  enrollee.enrollee_status === 'Enrolled' 
                                    ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10' 
                                    : 'bg-amber-50 text-amber-600 ring-amber-600/10'
                                }`}>
                                    {enrollee.enrollee_status}
                                </span>
                            </td>
                            <td className='py-4 px-4'>
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ring-1 ring-inset ${
                                  enrollee.payment_status === 'Paid' 
                                    ? 'bg-sky-50 text-sky-600 ring-sky-600/10' 
                                    : enrollee.payment_status === 'Partial'
                                      ? 'bg-violet-50 text-violet-600 ring-violet-600/10'
                                      : 'bg-rose-50 text-rose-600 ring-rose-600/10'
                                }`}>
                                    {enrollee.payment_status}
                                </span>
                            </td>
                            <td className='py-4 px-4'>
                              <div className="flex items-center justify-center gap-0.5">
                                <button className='p-1.5 text-sky-400 hover:bg-sky-50 rounded-lg transition-all group/btn' 
                                        title="View Details"
                                        onClick={() => {
                                          setEnrolleeId(enrollee.enrollment_id);
                                          setModal("info");
                                        }}>
                                  <FaInfoCircle className='text-lg group-active/btn:scale-90 transition-transform' />
                                </button>
                                <button className='p-1.5 text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all group/btn' 
                                        title="Edit Record"
                                        onClick={() => {
                                          setEnrolleeId(enrollee.enrollment_id);
                                          setModal("edit");
                                        }}>
                                  <FaEdit className='text-lg group-active/btn:scale-90 transition-transform' />
                                </button>
                                <button className='p-1.5 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all group/btn'
                                        title="Print Enrollment"
                                        onClick={() => {
                                          setEnrolleeId(enrollee.enrollment_id);
                                          setEnrollmentModalInfo(true);
                                        }}>
                                  <AiFillPrinter className='text-lg group-active/btn:scale-90 transition-transform' />
                                </button>
                                <button className='p-1.5 text-amber-400 hover:bg-amber-50 rounded-lg transition-all group/btn'
                                        title="ID Badge"
                                        onClick={() => {
                                          setEnrolleeId(enrollee.enrollment_id); 
                                          setEnrolleeCardModal(true);
                                        }}>
                                  <FaRegIdBadge className='text-lg group-active/btn:scale-90 transition-transform' />
                                </button>
                                <button className='p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all group/btn' 
                                        title="Delete Record">
                                  <FaRegTrashAlt className='text-lg group-active/btn:scale-90 transition-transform' />
                                </button>
                              </div>
                            </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className='p-12 text-center'>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No enrollees found</span>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                }
              </tbody>
            </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
        <Pagination page={page} 
                    setPage={setPage} 
                    paginationInfo={paginationInfo} />
      </div>
    </div>
  )
}

export default EnrollmentList