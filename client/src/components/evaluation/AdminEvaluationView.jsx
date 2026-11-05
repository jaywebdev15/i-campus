import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiShow, BiListCheck, BiWorld, BiX, BiChevronDown } from 'react-icons/bi';
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import FilterAndSearch from '../shared/FilterAndSearch';
import Command from '../shared/Command';
import Pagination from '../shared/Pagination';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import EvaluationModal from './EvaluationModal';

const AdminEvaluationView = ({ 
  evaluations, 
  loading,
  categoryTypes,
  category,
  setCategory,
  searchTerm,
  setSearchTerm,
  subCategory,
  setSubCategory,
  subOptions,
  activeNav,
  fetchEvaluations,
  page,
  setPage,
  paginationInfo,
  activeTab,
  setActiveTab,
  sortBy, 
  sortOrder, 
  handleSort,
  selectedIds, 
  setSelectedIds, 
  selectionMode, 
  setSelectionMode
}) => {
  const { showFlashMessage } = useContext(FlashMessageContext);
  const setModal = () => {};
  const { total } = paginationInfo || { total: evaluations.length };
  
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Toggle selection for a single row
  const toggleSelectId = (id) => {
    if (selectionMode === 'all') {
      setSelectionMode('manual');
      // If we deselect one in 'all' mode, we switch to manual mode.
      // Ideally we would want to select all EXCEPT this one, but since we don't have all IDs loaded,
      // we can't easily do that without fetching all IDs or handling exclusion logic.
      // For simplicity matching TeachersList logic (which seemed to handle it by just clearing or something simple):
      // Actually TeachersList logic was: 
      // if (selectionMode === 'all') { setSelectionMode('manual'); setSelectedIds(selectedIds.filter...); }
      // But selectedIds in 'all' only had the current page ids usually? 
      // Let's stick to the simple logic:
      setSelectionMode('manual');
      const allPageIds = evaluations.map(e => e.evaluation_id);
      const newSelected = allPageIds.filter(pid => pid !== id);
      setSelectedIds(newSelected);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        if (selectionMode === 'page') setSelectionMode('manual');
      } else {
        const newSelected = [...selectedIds, id];
        setSelectedIds(newSelected);
        if (newSelected.length === evaluations.length) {
          setSelectionMode('page');
        }
      }
    }
  };

  const handleSelectAllPage = () => {
    if (selectionMode === 'page' || (selectedIds.length === evaluations.length && evaluations.length > 0)) {
      setSelectedIds([]);
      setSelectionMode('none');
    } else {
      setSelectedIds(evaluations.map(e => e.evaluation_id));
      setSelectionMode('page');
    }
  };

  const handleSelectAllGlobal = () => {
    setSelectionMode('all');
    setSelectedIds(evaluations.map(e => e.evaluation_id)); // Visually select current page
  };

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
          try {
             const action = activeTab === "Teacher" ? "searchEvaluation" : "searchStudentEvaluation";
             const response = await fetch(`${API_BASE}/database/evaluations.php` , {
                method: "POST", 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                  action: action, 
                  categories: category, 
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
          if (selectedIds.length === 0) {
            showFlashMessage("error", "Please select items to export.");
            return;
          }
          dataToExport = evaluations.filter(e => selectedIds.includes(e.evaluation_id));
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
      a.download = format === "csv" ? "evaluations.csv" : "evaluations.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "evaluations");

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchEvaluations && fetchEvaluations();
  };

  const handleRowClick = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* List Header: Title & Actions */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Evaluation List ({total})</h2>
             <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage teacher and student evaluations</p>
          </div>
           <div className="flex items-center gap-2">
               <Command  handleExport={handleExport} 
                          handleImport={handleImport} 
                          setModal={setModal} 
                          activeNav={activeNav}
                          buttonText="Add Evaluation" />
           </div>
      </div>

      {/* Filter and Tabs */}
      <div className="px-8 pb-0 flex flex-col gap-4">
        <FilterAndSearch  category={category} 
                          setCategory={setCategory} 
                          categoryTypes={categoryTypes || {}} 
                          searchTerm={searchTerm} 
                          setSearchTerm={setSearchTerm} 
                          subCategory={subCategory} 
                          setSubCategory={setSubCategory} 
                          subOptions={subOptions || []} />
        
        <div className="flex gap-1 border-b border-gray-100">
          <button 
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wide transition-all duration-200 relative ${activeTab === 'Teacher' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Teacher')}>
            Teacher Evaluation
            {activeTab === 'Teacher' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
          </button>
          <button 
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wide transition-all duration-200 relative ${activeTab === 'Student' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Student')}>
            Student Evaluation
            {activeTab === 'Student' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
          <table className='whitespace-nowrap min-w-full text-xs text-left'>
            <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
              <tr className="bg-white">
                <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 text-center flex items-center justify-center gap-2 min-w-[60px]'>
                  <div className="flex items-center gap-2 relative">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                      checked={selectionMode === 'page' || (evaluations.length > 0 && selectedIds.length === evaluations.length)}
                      onChange={handleSelectAllPage}
                    />
                    <BiChevronDown className="text-lg text-gray-400 hover:text-blue-500 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
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

                {activeTab === 'Teacher' ? (
                  <>
                    {[
                      { id: 'evaluation_id', label: 'ID' },
                      { id: 'evaluation_course_id', label: 'Course' },
                      { id: 'evaluation_teacher_id', label: 'Teacher' },
                      { id: 'evaluation_student_id', label: 'Student' },
                      { id: 'evaluation_school_year', label: 'SY' },
                      { id: 'evaluation_explanation', label: 'Explanation' },
                      { id: 'evaluation_demonstration', label: 'Demo' },
                      { id: 'evaluation_method', label: 'Method' },
                      { id: 'evaluation_encouragement', label: 'Encouragement' },
                      { id: 'evaluation_assessment', label: 'Assessment' },
                      { id: 'evaluation_management', label: 'Management' },
                      { id: 'evaluation_respect', label: 'Respect' },
                      { id: 'evaluation_communication', label: 'Communication' },
                      { id: 'evaluation_ontime', label: 'On Time' },
                      { id: 'evaluation_positive_learning', label: 'Positive Learning' },
                      { id: 'evaluation_comments', label: 'Comments' }
                    ].map((col) => (
                      <th 
                        key={col.id}
                        className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]'
                        onClick={() => handleSort(col.id)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortBy === col.id ? (
                            sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />
                          ) : (
                            <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { id: 'evaluation_id', label: 'ID' },
                      { id: 'evaluation_course_id', label: 'Course' },
                      { id: 'evaluation_student_id', label: 'Student' },
                      { id: 'evaluation_teacher_id', label: 'Teacher' },
                      { id: 'evaluation_school_year', label: 'SY' },
                      { id: 'evaluation_demonstration', label: 'Demo' },
                      { id: 'evaluation_participation', label: 'Participation' },
                      { id: 'evaluation_responsible', label: 'Responsible' },
                      { id: 'evaluation_willing_to_learn', label: 'Willing' },
                      { id: 'evaluation_problem_solving', label: 'Problem Solving' },
                      { id: 'evaluation_respect', label: 'Respect' },
                      { id: 'evaluation_reliable', label: 'Reliable' },
                      { id: 'evaluation_teamwork', label: 'Teamwork' },
                      { id: 'evaluation_positive', label: 'Positive' },
                      { id: 'evaluation_discipline', label: 'Discipline' },
                      { id: 'evaluation_comments', label: 'Comments' }
                    ].map((col) => (
                      <th 
                        key={col.id}
                        className='p-4 font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none text-[0.65rem]'
                        onClick={() => handleSort(col.id)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortBy === col.id ? (
                            sortOrder === 'ASC' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />
                          ) : (
                            <FaSort className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                    ))}
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 border-b border-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'Teacher' ? "17" : "16"} className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                      </div>
                  </td>
                </tr>
              ) : 
                evaluations.length > 0 ? (
                  evaluations.map((evaluation, index) => {
                    const isSelected = selectedIds.includes(evaluation.evaluation_id);
                    return (
                    <tr key={index} 
                        onClick={() => handleRowClick(evaluation)}
                        className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 cursor-pointer'>
                        <td className={`sticky left-0 z-30 py-3 px-4 group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors text-center ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              checked={isSelected}
                              onChange={() => toggleSelectId(evaluation.evaluation_id)}
                            />
                          </div>
                        </td>

                        {activeTab === 'Teacher' ? (
                          <>
                            <td className='py-3 px-4 text-gray-900 font-bold text-[0.8rem]'>{evaluation.evaluation_id}</td>
                            <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{evaluation.evaluation_course_id}</td>
                            <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{evaluation.evaluation_teacher_id}</td>
                            <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{evaluation.evaluation_student_id}</td>
                            <td className='py-3 px-4 text-gray-500 text-[0.75rem]'>{evaluation.evaluation_school_year}</td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_explanation}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_demonstration}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_method}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_encouragement}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_assessment}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_management}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_respect}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_communication}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_ontime}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_positive_learning}</span></td>
                            <td className='py-3 px-4 text-gray-500 text-[0.75rem] max-w-xs truncate' title={evaluation.evaluation_comments}>{evaluation.evaluation_comments}</td>
                          </>
                        ) : (
                          <>
                            <td className='py-3 px-4 text-gray-900 font-bold text-[0.8rem]'>{evaluation.evaluation_id}</td>
                            <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{evaluation.evaluation_course_id}</td>
                            <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem]'>{evaluation.evaluation_student_id}</td>
                            <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{evaluation.evaluation_teacher_id}</td>
                            <td className='py-3 px-4 text-gray-500 text-[0.75rem]'>{evaluation.evaluation_school_year}</td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_demonstration}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_participation}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_responsible}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_willing_to_learn}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_problem_solving}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_respect}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_reliable}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_teamwork}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_positive}</span></td>
                            <td className='py-3 px-4 text-center'><span className="inline-block w-8 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[0.7rem]">{evaluation.evaluation_discipline}</span></td>
                            <td className='py-3 px-4 text-gray-500 text-[0.75rem] max-w-xs truncate' title={evaluation.evaluation_comments}>{evaluation.evaluation_comments}</td>
                          </>
                        )}
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'Teacher' ? "17" : "16"} className='p-12 text-center'>
                        <div className="flex flex-col items-center gap-2">
                           <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                           <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No evaluation records found</span>
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
                  paginationInfo={paginationInfo || { currentPage: 1, lastPage: 1, total: evaluations.length }} />
      </div>

      <EvaluationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        evaluation={selectedEvaluation} 
        activeTab={activeTab}
      />
    </div>
  )
}

export default AdminEvaluationView