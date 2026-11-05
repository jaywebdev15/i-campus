import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { FaInfoCircle, FaEdit, FaRegTrashAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';
import Command from '../shared/Command';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const CourseList = ({ 
  courses, 
  setCourseId, 
  loading, 
  setCourseModal, 
  setCourseModalInfo, 
  setCourseCode,
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
  activeNav,
  fetchCourses,
  selectedIds, 
  setSelectedIds, 
  selectionMode, 
  setSelectionMode, 
  sortBy, 
  sortOrder, 
  handleSort,
  handleDeleteRequest
}) => {
  const { total } = paginationInfo || { total: courses.length };
  const { showFlashMessage } = useContext(FlashMessageContext);

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allPageIds = courses.map(c => c.course_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === courses.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (selectedIds.length === courses.length && courses.length > 0)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(courses.map(c => c.course_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(courses.map(c => c.course_id)); // Visually select current page too
  };

  const handleExport = async (format) => {
      let dataToExport = [];

      if (selectionMode === 'all') {
          // Fetch ALL data
          try {
             const response = await fetch(`${API_BASE}/database/courses.php` , {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchCourse", 
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
          dataToExport = courses.filter(c => selectedIds.includes(c.course_id));
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
      a.download = format === "csv" ? "courses.csv" : "courses.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "courses");

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchCourses && fetchCourses();
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
            {/* List Header: Title & Actions */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Course List</h2>
                   <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage academic courses & curriculum</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Command  handleExport={handleExport} 
                              handleImport={handleImport} 
                              setModal={setCourseModal} 
                              activeNav={activeNav}
                              buttonText="Add Course" />
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
                                <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 text-center flex items-center justify-center gap-2 min-w-[120px]'>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input type="checkbox" 
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                                checked={courses.length > 0 && selectedIds.length === courses.length}
                                                onChange={handleSelectAllPage} />
                                            <BiChevronDown className="absolute -right-5 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-blue-500 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
                                            
                                            {/* Dropdown Menu */}
                                            {showDropdown && (
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
                                                    <ul className="py-1">
                                                        <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-xs font-semibold" onClick={handleSelectAllPageAndClose}>
                                                            <BiListCheck className="text-lg text-blue-500"/> Select Current Page
                                                        </li>
                                                        <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-xs font-semibold" onClick={handleSelectAllGlobalAndClose}>
                                                            <BiWorld className="text-lg text-blue-500"/> Select All Data ({total})
                                                        </li>
                                                        <li className="px-4 py-2.5 hover:bg-red-50 cursor-pointer flex items-center gap-2 text-xs font-semibold text-red-600 border-t border-gray-50" onClick={handleDeselectAll}>
                                                            <BiX className="text-lg"/> Deselect All
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <span className="ml-4">Action</span>
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('course_code')}>
                                    <div className="flex items-center gap-1">
                                        Code
                                        {sortBy === 'course_code' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('course_title')}>
                                    <div className="flex items-center gap-1">
                                        Title
                                        {sortBy === 'course_title' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Description</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('category')}>
                                    <div className="flex items-center gap-1">
                                        Category
                                        {sortBy === 'category' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('total_units')}>
                                    <div className="flex items-center gap-1">
                                        Units
                                        {sortBy === 'total_units' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('course_status')}>
                                    <div className="flex items-center justify-center gap-1">
                                        Status
                                        {sortBy === 'course_status' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading courses...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : courses.length > 0 ? (
                                courses.map((course, index) => (
                                    <tr key={index} className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                                        <td className='sticky left-0 z-30 py-3 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors text-center'>
                                            <div className="flex items-center justify-center gap-2">
                                                <input type="checkbox" 
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedIds.includes(course.course_id)}
                                                    onChange={() => toggleSelectId(course.course_id)}
                                                    onClick={(e) => e.stopPropagation()} />
                                                
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button className='p-1.5 text-sky-400 hover:bg-sky-50 rounded-lg transition-all group/btn' 
                                                            title="View Info"
                                                            onClick={() => {
                                                                setCourseId(course.course_id); 
                                                                setCourseCode(course.course_code);
                                                                setCourseModalInfo(true);
                                                            }}>
                                                        <FaInfoCircle className='text-lg group-active/btn:scale-90 transition-transform' />
                                                    </button>
                                                    <button className='p-1.5 text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all group/btn' 
                                                            title="Edit Course"
                                                            onClick={() => {
                                                                setCourseId(course.course_id);
                                                                setCourseModal("edit");
                                                            }}>
                                                        <FaEdit className='text-lg group-active/btn:scale-90 transition-transform' />
                                                    </button>
                                                    <button className='p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all group/btn' 
                                                            title="Delete Course"
                                                            onClick={() => handleDeleteRequest(course)}>
                                                        <FaRegTrashAlt className='text-lg group-active/btn:scale-90 transition-transform'/>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 text-gray-900 font-black text-[0.8rem] tracking-tight'>{course.course_code}</td>
                                        <td className='py-3 px-4 text-gray-700 font-bold text-[0.8rem]'>{course.course_title}</td>
                                        <td className='py-3 px-4 text-gray-500 text-[0.75rem] max-w-md truncate' title={course.course_description}>{course.course_description}</td>
                                        <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{course.category}</td>
                                        <td className='py-3 px-4 font-black text-gray-900 text-[0.8rem]'>{course.total_units === 0 ? '-' : course.total_units}</td>
                                        <td className='py-3 px-4 text-center'>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                course.course_status === 'Active' ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10' : 'bg-rose-50 text-rose-600 ring-rose-600/10'}`}>
                                                {course.course_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No courses available</span>
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
                <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: courses.length }} />
            </div>
        </div>
  )
}

export default CourseList