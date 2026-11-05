import React, { useRef } from 'react';
import { FaEdit, FaRegTrashAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BiPlus, BiImport, BiExport } from "react-icons/bi";
import Pagination from '../shared/Pagination';
import { exportToCSV, parseCSV } from '../../scripts/csvHelper';
import { API_BASE } from '../../config/api';

const QuestionList = ({ 
    questions, 
    setQuestionId, 
    setModal, 
    loading, 
    onRefresh,
    selectedIds,
    setSelectedIds,
    selectionMode,
    setSelectionMode,
    sortBy,
    sortOrder,
    handleSort,
    handleDelete,
    page,
    setPage,
    paginationInfo
}) => {
  const fileInputRef = useRef(null);


  // Toggle selection
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      const allIds = questions.map(s => s.question_id);
      const newSelected = allIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === questions.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  // Select all
  const handleSelectAll = () => {
    if (selectionMode === 'page' || (selectedIds.length === questions.length && questions.length > 0)) {
       setSelectedIds([]);
       setSelectionMode('none');
    } else {
       setSelectedIds(questions.map(s => s.question_id));
       setSelectionMode('page');
    }
  };

  const handleExport = () => {
      let dataToExport = [];
      if (selectedIds.length > 0) {
           dataToExport = questions.filter(item => selectedIds.includes(item.question_id));
      } else {
           dataToExport = questions;
      }
      
      if (dataToExport.length === 0) {
        alert("No data to export");
        return;
      }
      
      const csvData = dataToExport.map(item => ({
          'Quiz Title': item.quiz_title,
          Question: item.question_text,
          Type: item.question_type,
          Points: item.question_points,
          Options: item.question_options,
          Answer: item.question_answer
      }));
      exportToCSV(csvData, "questions.csv");
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
               body: JSON.stringify({ action: "importQuestions", data: data })
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
          e.target.value = ""; 
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Questions List</h2>
          <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage quiz questions</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setModal("add_question")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-blue-600/30">
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
      {/* (Filter was missing in original but layout implies it might be needed, leaving consistent for now) */}
      <div className="px-8 pb-4 flex flex-col sm:flex-row gap-3">
         {/* Placeholder for potential filters if needed, or spacing */}
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
                            checked={questions.length > 0 && selectedIds.length === questions.length}
                            onChange={handleSelectAll} />
                     </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('quiz_title')}>
                    <div className="flex items-center gap-1">
                       Quiz
                      {sortBy === 'quiz_title' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('question_text')}>
                    <div className="flex items-center gap-1">
                       Question
                      {sortBy === 'question_text' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('question_type')}>
                    <div className="flex items-center gap-1">
                       Type
                      {sortBy === 'question_type' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500' onClick={() => handleSort('question_points')}>
                    <div className="flex items-center gap-1">
                       Points
                      {sortBy === 'question_points' 
                        ? (sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />) 
                        : <FaSort className="text-gray-200" />}
                    </div>
                  </th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest'>Options</th>
                  <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                {loading 
                  ? (
                     <tr>
                         <td colSpan="6" className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                            </div>
                        </td>
                    </tr>
                  ) : (
                    questions.length > 0 ? (
                      questions.map(item => (
                          <tr key={item.question_id} 
                              className={`group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 ${selectedIds.includes(item.question_id) ? 'bg-blue-50/30' : ''}`}
                              onClick={() => toggleSelectId(item.question_id)}>
                              <td className='sticky left-0 z-30 py-3 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors' 
                                  onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-3">
                                  <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={selectedIds.includes(item.question_id)}
                                      onChange={() => toggleSelectId(item.question_id)}
                                  />
                                </div>
                              </td>
                              <td className='py-3 px-4 text-gray-700 font-medium'>{item.quiz_title}</td>
                              <td className='py-3 px-4 font-bold text-gray-800 max-w-xs truncate' title={item.question_text}>{item.question_text}</td>
                              <td className='py-3 px-4'>
                                  <span className={`px-2 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider 
                                      ${item.question_type === 'Multiple Choice' ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-600'}`}>
                                      {item.question_type}
                                  </span>
                              </td>
                              {/* Display Options cleanly */}
                              <td className='py-3 px-4 text-gray-500 text-xs max-w-xs truncate'>
                                {(() => {
                                    try {
                                        const opts = JSON.parse(item.question_options);
                                        return Array.isArray(opts) ? opts.join(', ') : item.question_options;
                                    } catch { return item.question_options }
                                })()}
                              </td>
                              <td className='py-3 px-4 text-gray-600 font-bold'>{item.question_points}</td>
                              <td className='py-3 px-4 text-center'>
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setQuestionId(item.question_id);
                                        setModal("edit_question");
                                    }}
                                    className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-50 transition-colors">
                                      <FaEdit className='text-lg' />
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.question_id);
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
                        <td colSpan="6" className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No question records found</span>
                            </div>
                        </td>
                      </tr>
                    )
                  )
                }
              </tbody>
            </table>
         </div>
         {/* List Footer: Pagination */}
         <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
            <Pagination page={page} setPage={setPage} paginationInfo={paginationInfo} />
         </div>
      </div>
    </div>
  )
}

export default QuestionList
