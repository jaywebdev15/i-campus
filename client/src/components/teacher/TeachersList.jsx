import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { FaSort, FaSortUp, FaSortDown, FaInfoCircle, FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";
import Command from '../shared/Command';
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const TeachersList = ({ teachers, setTeacherId, loading, setModal, categoryTypes, category, setCategory, searchTerm, setSearchTerm, subCategory, setSubCategory, subOptions, page, setPage, paginationInfo, activeNav, fetchTeachers, selectedIds, setSelectedIds, selectionMode, setSelectionMode, sortBy, sortOrder, handleSort }) => {
  const { total } = paginationInfo;
  const { showFlashMessage } = useContext(FlashMessageContext);

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id)); // This logic is tricky if 'all' implies implicit selection. 
      // Simplified: If mode is 'all', we probably shouldn't allow deselecting one without switching to 'page' mode minus one?
      // Better approach for now: If 'all' is selected, and user clicks a row, switch to 'manual' (just that page selected minus one? No, valid specific usage is getting complicated).
      // Let's stick to: "Select All" is a special mode. Deselecting one switches to manual selection of the REST on the page.
      // Actually simpler: If mode is 'all', and I click one, it clears 'all' mode.
      setSelectionMode('manual');
      const allPageIds = teachers.map(t => t.teacher_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === teachers.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (selectedIds.length === teachers.length && teachers.length > 0)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(teachers.map(t => t.teacher_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(teachers.map(t => t.teacher_id)); // Visually select current page too
  };

  const handleExport = async (format) => {
      let dataToExport = [];

      if (selectionMode === 'all') {
          // Fetch ALL data
          try {
             const response = await fetch(`${API_BASE}/database/teachers.php` , {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchTeacher", 
                  category: category, 
                  subCategory: subCategory, 
                  searchTerm: searchTerm, 
                  page: 1,
                  limit: 1000000 // Large limit to get all
                })
              });
              const result = await response.json();
              dataToExport = result.records;
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
          dataToExport = teachers.filter(t => selectedIds.includes(t.teacher_id));
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
      a.download = format === "csv" ? "teachers.csv" : "teachers.xlsx";
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
    fetchTeachers();
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Teacher List</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your faculty information</p>
        </div>
        <Command  
                  handleExport={handleExport} 
                  handleImport={handleImport} 
                  setModal={setModal} 
                  activeNav={activeNav}
                  buttonText="Add Teacher" />
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
                  <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 flex items-center gap-2'>
                    <div className="flex items-center gap-1 relative">
                        <input type="checkbox" 
                            className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={teachers.length > 0 && selectedIds.length === teachers.length}
                            onChange={handleSelectAllPage} />
                        <BiChevronDown className="text-base cursor-pointer hover:text-blue-500 rounded" onClick={() => setShowDropdown(!showDropdown)} />
                        
                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white text-gray-600 rounded-xl shadow-xl border border-gray-50 z-[60] overflow-hidden">
                                <ul className="py-1 text-[0.6rem] font-black uppercase tracking-widest">
                                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2" onClick={handleSelectAllPageAndClose}>
                                        <BiListCheck className="text-lg"/> Select Current Page
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2" onClick={handleSelectAllGlobalAndClose}>
                                        <BiWorld className="text-lg"/> Select All Data ({total})
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-red-500 border-t border-gray-50" onClick={handleDeselectAll}>
                                        <BiX className="text-lg"/> Deselect All
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>ID</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Picture</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('teacher_number')}>
                    <div className="flex items-center gap-1">
                      Full Name
                      {sortBy === 'teacher_number' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('last_name')}>
                    <div className="flex items-center gap-1">
                      Gender
                      {sortBy === 'last_name' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Date of Birth</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Status</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Actions</th>
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
                  teachers.length > 0 ? (
                    teachers.map((teacher, index) => (
                        <tr key={index} 
                            className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                            <td className='sticky left-0 z-30 py-4 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors'>
                                <input type="checkbox" 
                                       className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                       checked={selectedIds.includes(teacher.teacher_id)}
                                       onChange={() => toggleSelectId(teacher.teacher_id)}
                                       onClick={(e) => e.stopPropagation()} />
                            </td>
                            <td className='py-4 px-4 font-bold text-gray-400'>#{teacher.teacher_id}</td>
                            <td className='py-4 px-4'>
                              <div className="flex items-center rounded-xl bg-gray-100 w-9 h-9 overflow-hidden shadow-inner">
                                <img src={teacher.teacher_image 
                                            ? `${API_BASE}/images/teachers/${teacher.teacher_image}` 
                                            : `${API_BASE}/images/user.jpg` 
                                      } 
                                      alt="" 
                                      className='h-full w-full object-cover'/>
                              </div>
                            </td>
                            <td className='py-4 px-4'>
                              <div className="flex flex-col">
                                <span className="font-black text-gray-900 leading-tight">{`${teacher.last_name}, ${teacher.first_name}`}</span>
                                <span className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{teacher.teacher_number}</span>
                              </div>
                            </td>
                            <td className='py-4 px-4'>
                               <span className="text-[0.65rem] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-1 rounded-md">{teacher.gender}</span>
                            </td>
                            <td className='py-4 px-4'>
                               <span className="text-[0.65rem] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-1 rounded-md">{teacher.date_of_birth}</span>
                            </td>
                            <td className='py-4 px-4'>
                                <span className={`px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest
                                    ${teacher.teacher_status === 'Active' ? 'bg-sky-50 text-sky-500' : 'bg-red-50 text-red-500'}`}>
                                    {teacher.teacher_status}
                                </span>
                            </td>
                            <td className='py-4 px-4'>
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => { setTeacherId(teacher.teacher_id); setModal("info"); }}
                                          className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-50 transition-colors">
                                    <FaInfoCircle className='text-lg' />
                                  </button>
                                  <button onClick={() => { setTeacherId(teacher.teacher_id); setModal("edit"); }}
                                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-50 transition-colors">
                                    <FaEdit className='text-lg' />
                                  </button>
                                  <button className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors">
                                    <FaRegTrashAlt className='text-lg' />
                                  </button>
                                </div>
                            </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className='p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[0.6rem]'>No faculty members found.</td>
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

export default TeachersList