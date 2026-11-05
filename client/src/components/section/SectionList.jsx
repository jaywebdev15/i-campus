import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { FaInfoCircle, FaEdit, FaRegTrashAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';
import Command from '../shared/Command';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const SectionList = ({ 
  sections, 
  setSectionId, 
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
  activeNav,
  fetchSections,
  selectedIds, 
  setSelectedIds, 
  selectionMode, 
  setSelectionMode, 
  sortBy, 
  sortOrder, 
  handleSort,
  handleDelete
}) => {
  const { total } = paginationInfo || { total: sections.length };
  const { showFlashMessage } = useContext(FlashMessageContext);

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allPageIds = sections.map(c => c.section_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === sections.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (selectedIds.length === sections.length && sections.length > 0)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(sections.map(c => c.section_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(sections.map(c => c.section_id));
  };

  const handleExport = async (format) => {
      let dataToExport = [];

      if (selectionMode === 'all') {
          // Fetch ALL data
          try {
             const response = await fetch(`${API_BASE}/database/sections.php` , {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchSection", 
                  // Pass search params to get all
                  searchTerm: searchTerm,
                  category: category === "Education_Level" ? subCategory : "", 
                  educationLevel: category === "Education_Level" ? subCategory : "",
                  page: 1,
                  limit: 1000000 
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
          if (selectedIds.length === 0) {
            showFlashMessage("error", "Please select items to export.");
            return;
          }
          dataToExport = sections.filter(c => selectedIds.includes(c.section_id));
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
      a.download = format === "csv" ? "sections.csv" : "sections.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "sections");

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchSections && fetchSections();
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
            {/* List Header */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Section List</h2>
                   <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage class sections & schedules</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Command  handleExport={handleExport} 
                              handleImport={handleImport} 
                              setModal={setModal} 
                              activeNav={activeNav}
                              buttonText="Add Section" />
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
                                                checked={sections.length > 0 && selectedIds.length === sections.length}
                                                onChange={handleSelectAllPage} />
                                            <BiChevronDown className="absolute -right-5 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-blue-500 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
                                            
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
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('section_code')}>
                                    <div className="flex items-center gap-1">
                                        Code
                                        {sortBy === 'section_code' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('education_level')}>
                                    <div className="flex items-center gap-1">
                                        Level
                                        {sortBy === 'education_level' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('course_code')}>
                                    <div className="flex items-center gap-1">
                                        Course
                                        {sortBy === 'course_code' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Yr/Sem</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Schedule</th>
                                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('teacher_number')}>
                                    <div className="flex items-center gap-1">
                                        Teacher
                                        {sortBy === 'teacher_number' ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
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
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading sections...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : sections.length > 0 ? (
                                sections.map((section, index) => (
                                    <tr key={index} className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                                        <td className='sticky left-0 z-30 py-3 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors text-center'>
                                            <div className="flex items-center justify-center gap-2">
                                                <input type="checkbox" 
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedIds.includes(section.section_id)}
                                                    onChange={() => toggleSelectId(section.section_id)}
                                                    onClick={(e) => e.stopPropagation()} />
                                                
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button className='p-1.5 text-sky-400 hover:bg-sky-50 rounded-lg transition-all group/btn' 
                                                            title="View Info"
                                                            onClick={() => {
                                                                setSectionId(section.section_id); 
                                                                setModal("info");
                                                            }}>
                                                        <FaInfoCircle className='text-lg group-active/btn:scale-90 transition-transform' />
                                                    </button>
                                                    <button className='p-1.5 text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all group/btn' 
                                                            title="Edit Section"
                                                            onClick={() => {
                                                                setSectionId(section.section_id);
                                                                setModal("edit");
                                                            }}>
                                                        <FaEdit className='text-lg group-active/btn:scale-90 transition-transform' />
                                                    </button>
                                                    <button className='p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all group/btn' 
                                                            title="Delete Section"
                                                            onClick={() => handleDelete && handleDelete(section.section_id)}>
                                                        <FaRegTrashAlt className='text-lg group-active/btn:scale-90 transition-transform'/>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 text-gray-900 font-black text-[0.8rem] tracking-tight'>{section.section_code}</td>
                                        <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{section.education_level}</td>
                                        <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{section.course_code}</td>
                                        <td className='py-3 px-4 text-gray-500 font-medium text-[0.7rem]'>{section.year_level} / {section.semester}</td>
                                        <td className='py-3 px-4 text-gray-500 text-[0.7rem] font-bold'>
                                            {section.schedule} <span className="text-gray-400 font-normal">({section.time_in} - {section.time_out})</span>
                                        </td>
                                        <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{section.teacher_number}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No sections available</span>
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
                <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: sections.length }} />
            </div>
        </div>
  )
}

export default SectionList
