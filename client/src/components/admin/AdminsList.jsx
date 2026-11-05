import Pagination from '../shared/Pagination';
import FilterAndSearch from '../shared/FilterAndSearch';
import Command from '../shared/Command';
import { useContext, useState } from 'react';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { FaSort, FaSortUp, FaSortDown, FaInfoCircle, FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { BiChevronDown, BiListCheck, BiWorld, BiX } from "react-icons/bi";
import { getAge } from '../../scripts/utility';
import { IMAGE_BASE, API_BASE } from '../../config/api';

const AdminsList = ({ admins, setModal, setGetAdminId, page, setPage, paginationInfo, loading, category, setCategory, searchTerm, setSearchTerm, categoryTypes, subCategory, setSubCategory, subOptions, fetchAdmins, activeNav, selectedIds, setSelectedIds, selectionMode, setSelectionMode, sortBy, sortOrder, handleSort }) => {
  const { showFlashMessage } = useContext(FlashMessageContext);
  const { total } = paginationInfo;
  
  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allPageIds = admins.map(a => a.admin_id);
      const newSelected = allPageIds.filter(aid => aid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === admins.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Toggle select all on current page
  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (admins.length > 0 && selectedIds.length === admins.length)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(admins.map(a => a.admin_id));
      setSelectionMode('page');
    }
  };

  // Select all data across all pages
  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(admins.map(a => a.admin_id)); // Visually select current page too
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
             const response = await fetch(`${API_BASE}/database/admins.php`, {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: "searchAdmin", 
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
          dataToExport = admins.filter(a => selectedIds.includes(a.admin_id));
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
      a.download = format === "csv" ? "admins.csv" : "admins.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "admins"); 

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchAdmins();
  };


  return (
    <div className="flex flex-col h-full bg-white">
      {/* List Header: Title & Actions */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin List ({total})</h2>
             <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage system administrators</p>
          </div>
           <div className="flex items-center gap-2">
               <Command  handleExport={handleExport} 
                         handleImport={handleImport} 
                         setModal={setModal} 
                         activeNav={activeNav}
                         buttonText="Add Admin" />
           </div>
      </div>

      {/* Filter */}
      <div className="px-8 pb-4 flex flex-col gap-4">
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
                <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 text-center flex items-center justify-center gap-2 min-w-[60px]'>
                    <div className="flex items-center gap-2 relative">
                        <input type="checkbox" 
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                            checked={admins.length > 0 && selectedIds.length === admins.length}
                            onChange={handleSelectAllPage} />
                        <BiChevronDown className="text-lg text-gray-400 hover:text-blue-500 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
                        
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
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>Picture</th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_number')}>
                    <div className="flex items-center gap-1">
                      Admin Number
                      {sortBy === 'admin_number' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_lastname')}>
                    <div className="flex items-center gap-1">
                      Full Name
                      {sortBy === 'admin_lastname' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_gender')}>
                    <div className="flex items-center gap-1">
                      Gender
                      {sortBy === 'admin_gender' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_date_of_birth')}>
                    <div className="flex items-center gap-1">
                      Date of Birth
                      {sortBy === 'admin_date_of_birth' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                 <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>
                    Age
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_contact_number')}>
                    <div className="flex items-center gap-1">
                      Contact
                      {sortBy === 'admin_contact_number' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_email_address')}>
                    <div className="flex items-center gap-1">
                      Email
                      {sortBy === 'admin_email_address' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]' onClick={() => handleSort('admin_province')}>
                    <div className="flex items-center gap-1">
                      Address
                      {sortBy === 'admin_province' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                </th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center text-[0.65rem]'>
                    Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 border-b border-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="11" className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                      </div>
                  </td>
                </tr>
              ) : 
                admins.length > 0 ? (
                  admins.map((admin, index) => {
                    const isSelected = selectedIds.includes(admin.admin_id);
                    return (
                    <tr key={index} 
                        className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 cursor-pointer'>
                        <td className={`sticky left-0 z-30 py-3 px-4 group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors text-center ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-3">
                              <input type="checkbox" 
                                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                  checked={isSelected}
                                  onChange={() => toggleSelectId(admin.admin_id)}
                                  onClick={(e) => e.stopPropagation()} />
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 ring-1 ring-gray-50">
                            <img src={admin.admin_image 
                                        ? `${IMAGE_BASE}/admins/${admin.admin_image}` 
                                        : `${IMAGE_BASE}/user.jpg` 
                                  } 
                                  alt="" 
                                  className='h-full w-full object-cover'/>
                          </div>
                        </td>
                        <td className='py-3 px-4 text-gray-900 font-bold text-[0.8rem]'>{admin.admin_number}</td>
                        <td className='py-3 px-4 text-gray-700 font-bold text-[0.75rem]'>{admin.admin_lastname}, {admin.admin_firstname} {admin.admin_middlename}</td>
                        <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{admin.admin_gender}</td>
                        <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{admin.admin_date_of_birth}</td>
                         <td className='py-3 px-4 text-right text-gray-600 text-[0.75rem]'>{getAge(admin.admin_date_of_birth)}</td>
                        <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{admin.admin_contact_number}</td>
                        <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{admin.admin_email_address}</td>
                        <td className='py-3 px-4 text-gray-500 text-[0.75rem] max-w-xs truncate' title={`${admin.admin_house_number}, ${admin.admin_street} ${admin.admin_barangay} ${admin.admin_town} ${admin.admin_province}`}>
                            {admin.admin_house_number}, {admin.admin_street} {admin.admin_barangay} {admin.admin_town} {admin.admin_province}
                        </td>
                        <td className='py-3 px-4'>
                            <div className="flex items-center justify-center gap-2">
                                <button className='text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200' 
                                    onClick={() => {
                                    setGetAdminId(admin.admin_id);
                                    setModal("info");
                                }}>
                                  <FaInfoCircle className="text-base" />
                                </button>
                                <button className='text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-all duration-200' 
                                    onClick={() => {
                                      setGetAdminId(admin.admin_id);
                                      setModal("edit");
                                }}>
                                  <FaEdit className="text-base" />
                                </button>
                                <button className='text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all duration-200'
                                    onClick={() => {
                                      // Potentially add delete confirm here if available in this project's patterns
                                    }}>
                                  <FaRegTrashAlt className="text-base" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                         <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No admin records found</span>
                      </div>
                    </td>
                  </tr>
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

export default AdminsList
