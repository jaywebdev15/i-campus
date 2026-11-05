import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { FaSort, FaSortUp, FaSortDown, FaInfoCircle, FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';
import Command from '../shared/Command';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const CurriculumList = ({ 
  curriculums, 
  setCurriculumModal, 
  setCurriculumId, 
  loading,
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
  fetchCurriculums,
  selectedIds, 
  setSelectedIds, 
  selectionMode, 
  setSelectionMode, 
  sortBy, 
  sortOrder, 
  handleSort
}) => {
  const { total } = paginationInfo || { total: curriculums.length };
  const { showFlashMessage } = useContext(FlashMessageContext);

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allPageIds = curriculums.map(c => c.curriculum_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === curriculums.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (selectedIds.length === curriculums.length && curriculums.length > 0)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(curriculums.map(c => c.curriculum_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(curriculums.map(c => c.curriculum_id)); // Visually select current page too
  };

  const handleExport = async (format) => {
      let dataToExport = [];

      if (selectionMode === 'all') {
          // Fetch ALL data
          try {
             const response = await fetch(`${API_BASE}/database/curriculums.php` , {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchCurriculum", 
                  category: category, 
                  subCategory: subCategory, 
                  searchTerm: searchTerm, 
                  page: 1,
                  limit: 1000000 // Large limit to get all
                })
              });
              const result = await response.json();
              dataToExport = result.records || result; // adjust based on API response structure if needed
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
          dataToExport = curriculums.filter(c => selectedIds.includes(c.curriculum_id));
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
      a.download = format === "csv" ? "curriculums.csv" : "curriculums.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "curriculums");

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchCurriculums && fetchCurriculums();
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Curriculum List</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage academic curriculum records</p>
        </div>
        <Command  handleExport={handleExport} 
                  handleImport={handleImport} 
                  setModal={setCurriculumModal} 
                  activeNav={activeNav}
                  buttonText="Add Curriculum" />
      </div>

      {/* Search and Filters */}
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
        <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-4">
            <table className='whitespace-nowrap min-w-full text-xs text-left'>
              <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                <tr className="bg-white">
                  <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 flex items-center gap-2'>
                    <div className="flex items-center gap-1 relative">
                        <input type="checkbox" 
                            className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-300"
                            checked={curriculums.length > 0 && selectedIds.length === curriculums.length}
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
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('education_level')}>
                    <div className="flex items-center gap-1">
                      Education Level
                      {sortBy === 'education_level' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('year_level')}>
                    <div className="flex items-center gap-1">
                      Year Level
                      {sortBy === 'year_level' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('semester')}>
                    <div className="flex items-center gap-1">
                      Semester
                      {sortBy === 'semester' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('course_code')}>
                    <div className="flex items-center gap-1">
                      Course Code
                      {sortBy === 'course_code' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('subject_code')}>
                    <div className="flex items-center gap-1">
                      Subject Code
                      {sortBy === 'subject_code' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('subject_title')}>
                    <div className="flex items-center gap-1">
                      Subject Title
                      {sortBy === 'subject_title' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Description</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('units')}>
                    <div className="flex items-center gap-1 justify-center">
                      Units
                      {sortBy === 'units' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      Category
                      {sortBy === 'category' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">
                      Price
                      {sortBy === 'price' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors' onClick={() => handleSort('curriculum_status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === 'curriculum_status' 
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
                    <tr><td colSpan="13" className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                      </div>
                    </td></tr>
                  ) : (
                    curriculums.length > 0 ? (
                      curriculums.map((curriculum, index) => (
                        <tr key={index} 
                            className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                        <td className='sticky left-0 z-30 py-4 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors'>
                          <input type="checkbox" 
                                 className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-300"
                                 checked={selectedIds.includes(curriculum.curriculum_id)}
                                 onChange={() => toggleSelectId(curriculum.curriculum_id)}
                                 onClick={(e) => e.stopPropagation()} />
                        </td>
                             <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{curriculum.education_level}</td>
                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{curriculum.year_level}</td>
                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{curriculum.semester}</td>
                            <td className='py-4 px-4 text-gray-900 font-black text-[0.8rem]'>{curriculum.course_code}</td>
                            <td className='py-4 px-4'>
                              <span className="text-blue-600 font-black text-[0.8rem] bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/50">
                                {curriculum.subject_code}
                              </span>
                            </td>
                            <td className='py-4 px-4 text-gray-700 font-bold text-[0.8rem]'>{curriculum.subject_title}</td>
                            <td className='py-4 px-4 text-gray-400 font-medium text-[0.75rem] max-w-xs truncate' title={curriculum.subject_description}>{curriculum.subject_description}</td>
                            <td className='py-4 px-4 text-gray-900 text-center font-black text-[0.8rem]'>{curriculum.units}</td>
                            <td className='py-4 px-4 text-gray-500 font-bold text-[0.8rem]'>{curriculum.category}</td>
                            <td className='py-4 px-4 text-gray-900 font-black text-[0.82rem]'>₱{Number(curriculum.price).toLocaleString()}</td>
                            <td className='py-4 px-4'>
                                <span className={`px-2 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${curriculum.curriculum_status === 'Active' || curriculum.curriculum_status === 'Available' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                                    {curriculum.curriculum_status}
                                </span>
                            </td>
                            <td className='py-4 px-4'>
                                <div className="flex items-center justify-center gap-1">
                                  <button className='p-1.5 text-sky-400 hover:bg-sky-50 rounded-lg transition-all group/btn' 
                                          title="View Details"
                                          onClick={() => {
                                            setCurriculumId(curriculum.curriculum_id);
                                            setCurriculumModal("info");
                                          }}>
                                    <FaInfoCircle className='text-lg group-active/btn:scale-90 transition-transform' />
                                  </button>
                                  <button className='p-1.5 text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all group/btn' 
                                          title="Edit Record"
                                          onClick={() => {
                                            setCurriculumId(curriculum.curriculum_id);
                                            setCurriculumModal("edit");
                                          }}>
                                    <FaEdit className='text-lg group-active/btn:scale-90 transition-transform' />
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
                        <td colSpan="13" className='p-12 text-center'>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No curriculums found</span>
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
                    paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: curriculums.length }} />
      </div>
    </div>
  )
}

export default CurriculumList