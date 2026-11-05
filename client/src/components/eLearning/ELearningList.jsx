import React, { useState, useRef } from 'react';
import { FaInfoCircle, FaEdit, FaRegTrashAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiPlus, BiImport, BiExport } from "react-icons/bi";
import FilterAndSearch from '../shared/FilterAndSearch';
import { exportToCSV, parseCSV } from '../../scripts/csvHelper';
import { API_BASE } from '../../config/api';

const ELearningList = ({ 
    eLearnings, 
    setELearningId, 
    setModal, 
    loading, 
    handleDelete, 
    onRefresh,
    selectedIds,
    setSelectedIds,
    selectionMode,
    setSelectionMode,
    sortBy,
    sortOrder,
    handleSort
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const fileInputRef = useRef(null);


  const categoryTypes = {
      category: "Category",
      subject_code: "Subject Code"
  };

  // Filter logic
  const filteredLearnings = eLearnings.filter(item => {
       const matchesSearch = searchTerm === "" || 
            (item.e_learning_title && item.e_learning_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.subject_code && item.subject_code.toLowerCase().includes(searchTerm.toLowerCase()));
       


       return matchesSearch;
  });

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allIds = filteredLearnings.map(s => s.e_learning_id);
      const newSelected = allIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === filteredLearnings.length) {
          setSelectionMode('page'); // 'page' here essentially means all displayed
        }
      }
    }
  };

  // Select all visible
  const handleSelectAll = () => {
    if (selectionMode === 'page' || (selectedIds.length === filteredLearnings.length && filteredLearnings.length > 0)) {
       setSelectedIds([]);
       setSelectionMode('none');
    } else {
       setSelectedIds(filteredLearnings.map(s => s.e_learning_id));
       setSelectionMode('page');
    }
  };


  const handleExport = () => {
      let dataToExport = [];
      
      if (selectedIds.length > 0) {
           // Export selected
           dataToExport = filteredLearnings.filter(item => selectedIds.includes(item.e_learning_id));
      } else {
           // Export all (filtered)
           dataToExport = filteredLearnings;
      }

      if (dataToExport.length === 0) {
        alert("No data to export");
        return;
      }

      const csvData = dataToExport.map(item => ({
          Title: item.e_learning_title,
          Video: item.e_learning_video,
          'Subject Code': item.subject_code,
          'Subject Title': item.subject_title,
          Category: item.category
      }));
      exportToCSV(csvData, "e_learnings.csv");
  };

  const handleImport = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
          const data = await parseCSV(file);
          if(data.length === 0) { alert("No data found in CSV"); return; }
          
          const response = await fetch(`${API_BASE}/database/e_learning.php`, {
               method: "POST",
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ action: "importELearning", data: data })
          });
          const result = await response.json();
          alert(result.message);
          if(result.status === "success" && onRefresh) {
              onRefresh();
          }
      } catch (error) {
          console.error("Import Error:", error);
          alert("Import failed: " + error);
      } finally {
          e.target.value = ""; // Reset input
      }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".csv" 
        className="hidden" 
      />

      {/* List Header: Title + Buttons */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">E-Learning List</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage e-learning materials</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-blue-600/30">
                <BiPlus className='text-lg'/> <span className="text-xs font-bold uppercase tracking-wider">Add New</span>
            </button>
             <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-emerald-500/30">
                <BiImport className='text-lg'/> <span className="text-xs font-bold uppercase tracking-wider">Import</span>
            </button>
             <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-gray-500/30">
                <BiExport className='text-lg'/> <span className="text-xs font-bold uppercase tracking-wider">Export</span>
            </button>
        </div>
      </div>

       {/* Search & Filter Bar */}
      <div className="px-8 pb-4 flex flex-col sm:flex-row gap-3">
        <FilterAndSearch 
            category={filterCategory}
            setCategory={setFilterCategory}
            categoryTypes={categoryTypes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            subCategory={filterSubCategory}
            setSubCategory={setFilterSubCategory}
            subOptions={[]} 
        />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
            <table className='whitespace-nowrap min-w-full text-xs text-left'>
              <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
                <tr>
                  <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 flex items-center gap-2'>
                     <div className="flex items-center gap-1 relative">
                        <input type="checkbox" 
                            className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={filteredLearnings.length > 0 && selectedIds.length === filteredLearnings.length}
                            onChange={handleSelectAll} />
                     </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('e_learning_title')}>
                    <div className="flex items-center gap-1">
                       Video Title
                      {sortBy === 'e_learning_title' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('subject_code')}>
                    <div className="flex items-center gap-1">
                       Subject Code
                      {sortBy === 'subject_code' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('subject_title')}>
                    <div className="flex items-center gap-1">
                       Subject Title
                      {sortBy === 'subject_title' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Subject Description</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                       Category
                      {sortBy === 'category' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                {loading 
                  ? (
                    <tr>
                         <td colSpan="7" className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                            </div>
                        </td>
                    </tr>
                  ) : (
                    filteredLearnings.length > 0 ? (
                      filteredLearnings.map(eLearning => (
                        <tr key={eLearning.e_learning_id} 
                            className={`group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 ${selectedIds.includes(eLearning.e_learning_id) ? 'bg-blue-50/30' : ''}`}
                            onClick={() => toggleSelectId(eLearning.e_learning_id)}>
                            <td className='sticky left-0 z-30 py-3 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors'
                                onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={selectedIds.includes(eLearning.e_learning_id)}
                                    onChange={() => toggleSelectId(eLearning.e_learning_id)}
                                />
                              </div>
                            </td>
                            <td className='py-3 px-4 font-bold text-gray-800'>{eLearning.e_learning_title}</td>
                            <td className='py-3 px-4 text-blue-600 font-bold'>{eLearning.subject_code}</td>
                            <td className='py-3 px-4 text-gray-700 font-semibold'>{eLearning.subject_title}</td>
                            <td className='py-3 px-4 text-gray-500 max-w-xs truncate' title={eLearning.subject_description}>{eLearning.subject_description}</td>
                            <td className='py-3 px-4'>
                                <span className="text-[0.6rem] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-1 rounded-md">{eLearning.category}</span>
                            </td>
                             <td className='py-3 px-4 text-center'>
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={(e) => {
                                      e.stopPropagation();
                                      setELearningId(eLearning.e_learning_id); 
                                      setModal("info");
                                  }}
                                  className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-50 transition-colors">
                                    <FaInfoCircle className='text-lg' />
                                  </button>
                                  <button onClick={(e) => {
                                      e.stopPropagation();
                                      setELearningId(eLearning.e_learning_id);
                                      setModal("edit");
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-50 transition-colors">
                                    <FaEdit className='text-lg' />
                                  </button>
                                  <button onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(eLearning.e_learning_id);
                                  }}
                                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors">
                                    <FaRegTrashAlt className='text-lg' />
                                  </button>
                                </div>
                            </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No e-learning records found</span>
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
    </div>
  )
}

export default ELearningList