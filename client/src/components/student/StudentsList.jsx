import Pagination from '../shared/Pagination';
import { API_BASE } from '../../config/api';
import { QRCodeCanvas } from 'qrcode.react'
import FilterAndSearch from '../shared/FilterAndSearch';
import Command from '../shared/Command';
import { useContext, useState } from 'react';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { FaSort, FaSortUp, FaSortDown, FaInfoCircle, FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";

const StudentsList = ({ students, setModal, setGetStudentId, page, setPage, paginationInfo, loading, category, setCategory, searchTerm, setSearchTerm, categoryTypes, subCategory, setSubCategory, subOptions, fetchStudents, activeNav, selectedIds, setSelectedIds, selectionMode, setSelectionMode, sortBy, sortOrder, handleSort, handleDelete }) => {
  const { total } = paginationInfo;
  const { showFlashMessage } = useContext(FlashMessageContext);
  
  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      // If 'all' was selected, and we toggle one off, we switch to manual.
      // Logic: Start with all IDs on current page except the one toggled? 
      // This is complicated with 'all' mode across pages. 
      // Simplified strategy consistent with TeachersList:
      setSelectionMode('manual');
      const allPageIds = students.map(s => s.student_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === students.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (students.length > 0 && selectedIds.length === students.length)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(students.map(s => s.student_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(students.map(s => s.student_id)); // Visually select current page too
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

  const handleExport = async (format) => {
      let dataToExport = [];

      if (selectionMode === 'all') {
          // Fetch ALL data
          try {
             const response = await fetch(`${API_BASE}/database/students.php`, {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchStudent", 
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
          dataToExport = students.filter(s => selectedIds.includes(s.student_id));
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
      a.download = format === "csv" ? "students.csv" : "students.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "students"); 

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchStudents();
  };


  return (
    <div className="flex flex-col h-full bg-white">
      {/* List Header: Title + Buttons */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Student List</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your student records</p>
        </div>
        <Command  handleExport={handleExport} 
                  handleImport={handleImport} 
                  setModal={setModal} 
                  activeNav={activeNav}
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
                  <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 flex items-center gap-2'>
                      <div className="flex items-center gap-1 relative">
                          <input type="checkbox" 
                              className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              checked={students.length > 0 && selectedIds.length === students.length}
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
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Gender</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Section & Course</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Year & Sem</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Status</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="9" className='p-12 text-center'>
                      <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </td>
                  </tr>
                ) : 
                  students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={index} 
                          className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50'>
                          <td className='sticky left-0 z-30 py-4 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors'>
                            <input type="checkbox" 
                                  className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  checked={selectedIds.includes(student.student_id)}
                                  onChange={() => toggleSelectId(student.student_id)}
                                  onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td className='py-4 px-4'>
                            <div className="flex items-center rounded-xl bg-gray-100 w-9 h-9 overflow-hidden shadow-inner">
                              <img src={student.student_image                                            ? `${API_BASE}/images/students/${student.student_image}` 
                                            : `${API_BASE}/images/user.jpg` 
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
                             <span className="text-[0.65rem] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-1 rounded-md">{student.gender}</span>
                          </td>
                          <td className='py-4 px-4'>
                            <div className="flex flex-col">
                              <span className="font-bold text-blue-600">{student.section_code}</span>
                              <span className="text-[0.6rem] text-gray-400 font-black uppercase">{student.course_code}</span>
                            </div>
                          </td>
                          <td className='py-4 px-4'>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">{student.year_level}</span>
                              <span className="text-[0.6rem] text-gray-400 font-black uppercase">{student.semester}</span>
                            </div>
                          </td>
                          <td className='py-4 px-4'>
                              <span className={`px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest
                                  ${student.student_status === 'Active' ? 'bg-sky-50 text-sky-500' : 'bg-red-50 text-red-500'}`}>
                                  {student.student_status}
                              </span>
                          </td>
                          <td className='py-4 px-4'>
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => { setGetStudentId(student.student_id); setModal("info"); }}
                                        className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-50 transition-colors">
                                  <FaInfoCircle className='text-lg' />
                                </button>
                                <button onClick={() => { setGetStudentId(student.student_id); setModal("edit"); }}
                                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-50 transition-colors">
                                  <FaEdit className='text-lg' />
                                </button>
                                 <button onClick={() => handleDelete(student.student_id)}
                                         className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors">
                                  <FaRegTrashAlt className='text-lg' />
                                </button>
                              </div>
                          </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className='p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[0.6rem]'>No student records found.</td>
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

export default StudentsList