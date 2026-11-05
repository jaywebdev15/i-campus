import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { API_BASE } from '../../config/api';
import { BiLoaderAlt, BiInfoCircle } from "react-icons/bi";
import FilterAndSearch from '../shared/FilterAndSearch';
import Pagination from '../shared/Pagination';
import { AuthContext } from '../../context/AuthContext';
import TranscriptModal from './TranscriptModal';

const AdminAllGrades = () => {
    const { userCredential } = useContext(AuthContext);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, lastPage: 1, total: 0 });

    // Modal state
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categoryTypes = {
        course_code: "Course",
        section_code: "Section",
        semester: "Semester",
        school_year: "School Year"
    };

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, category, subCategory]);

    const fetchGrades = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/database/grades.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: "getAllGradesForAdmin",
                    page: page,
                    limit: 10,
                    searchTerm: searchTerm,
                    category: category,
                    subCategory: subCategory,
                    // If logged in as teacher, filter by their sections
                    teacherId: userCredential?.login_role === 'Teacher' ? userCredential?.login_code : null
                })
            });
            const data = await response.json();
            
            if (data.records) {
                setGrades(data.records);
                setPaginationInfo({
                    currentPage: parseInt(data.page),
                    lastPage: Math.ceil(data.total / data.limit),
                    total: parseInt(data.total)
                });
            } else if (Array.isArray(data)) {
                // Fallback for old API response (should not happen if backend updated)
                setGrades(data);
                setPaginationInfo({ currentPage: 1, lastPage: 1, total: data.length });
            } else {
                console.error("Failed to fetch all grades:", data);
                setGrades([]);
            }
        } catch (error) {
            console.error("Error fetching all grades:", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, category, subCategory, userCredential]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGrades();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, searchTerm, category, subCategory, fetchGrades]);


    // Calculate dynamic sub-options based on available data 
    // Note: Ideally with server-side pagination, this should fail to show all options if we only have current page data.
    // However, fixing this properly requires a separate endpoint for distinct values.
    // For now, based on the current context, we rely on the fact that UniqueValues calculation MIGHT be limited to current page
    // BUT since we haven't implemented a unique-values endpoint, this is a known limitation we accepted in planning.
    // To mitigate, users can still search freely.
    const subOptions = useMemo(() => {
        if (!category) return [];
        // Limitation: This only shows options available in the CURRENT PAGE of results.
        // Ideally we need a separate API call to get distinct values for 'category'.
        const uniqueValues = new Set(grades.map(g => g[category]).filter(Boolean));
        return Array.from(uniqueValues).sort();
    }, [grades, category]);

    // Client-side filtering is NO LONGER needed since backend does it
    const filteredGrades = grades; 

    // Selection states (added to match SectionList pattern)
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState("none");
    const [showSelectionDropdown, setShowSelectionDropdown] = useState(false);

    // Toggle selection for a single row
    const toggleSelectId = (id) => {
        if (selectionMode === 'all') {
            setSelectionMode('manual');
            const allPageIds = grades.map(g => g.enrollment_id);
            const newSelected = allPageIds.filter(pid => pid !== id);
            setSelectedIds(newSelected);
        } else {
            if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
                if (selectionMode === 'page') setSelectionMode('manual');
            } else {
                const newSelected = [...selectedIds, id];
                setSelectedIds(newSelected);
                if (newSelected.length === grades.length) {
                    setSelectionMode('page');
                }
            }
        }
    };

    const handleSelectAllPage = () => {
        if (selectionMode === 'page' || (selectedIds.length === grades.length && grades.length > 0)) {
            setSelectedIds([]);
            setSelectionMode('none');
        } else {
            setSelectedIds(grades.map(g => g.enrollment_id));
            setSelectionMode('page');
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white animate-fade-in">
            {/* Header / Controls */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Student Grades Overview</h2>
                  <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Overview of all student enrollments across all sections</p>
               </div>
               {/* Optional: Add command button if needed, but keeping it simple for overview for now */}
            </div>
            
            <div className="px-8 pb-4">
                <FilterAndSearch
                  category={category}
                  setCategory={setCategory}
                  categoryTypes={categoryTypes}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  subCategory={subCategory}
                  setSubCategory={setSubCategory}
                  subOptions={subOptions}
                />
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
                    <table className="whitespace-nowrap min-w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 bg-white border-b border-gray-100 z-40">
                            <tr className="bg-white">
                                <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 text-center flex items-center justify-center gap-2 min-w-[120px]'>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" 
                                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                            checked={grades.length > 0 && selectedIds.length === grades.length}
                                            onChange={handleSelectAllPage} />
                                        <span className="ml-4">Action</span>
                                    </div>
                                </th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Picture</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Student No.</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Student Name</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Subject</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Section</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Semester</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-xs">School Year</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : grades.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                                            <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No records available</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                grades.map((grade, index) => (
                                    <tr 
                                        key={index} 
                                        className="group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 bg-white"
                                    >
                                        <td className='sticky left-0 z-30 py-3 px-4 bg-white group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors text-center'>
                                            <div className="flex items-center justify-center gap-2">
                                                <input type="checkbox" 
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedIds.includes(grade.enrollment_id)}
                                                    onChange={() => toggleSelectId(grade.enrollment_id)} />
                                                
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button className='p-1.5 text-sky-400 hover:bg-sky-50 rounded-lg transition-all group/btn' 
                                                            title="View Transcript"
                                                            onClick={() => {
                                                                setSelectedStudent({
                                                                    studentNumber: grade.student_number,
                                                                    studentName: grade.student_name
                                                                });
                                                                setIsModalOpen(true);
                                                            }}>
                                                        <BiInfoCircle style={{fontSize: '1.25rem'}} className='group-active/btn:scale-90 transition-transform' />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                                                <img 
                                                    src={grade.student_image ? `${API_BASE}/images/students/${grade.student_image}` : `${API_BASE}/images/students/default.jpg`} 
                                                    alt="Student" 
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {e.target.src = `${API_BASE}/images/students/default.jpg`}}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">{grade.student_number}</td>
                                        <td className="p-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {grade.student_name}
                                        </td>
                                        <td className="p-4 text-gray-700">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[0.75rem]">{grade.subject_code}</span>
                                                <span className="text-[0.65rem] text-gray-400 truncate max-w-[200px]">{grade.subject_title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-[0.7rem] font-bold text-gray-600 border border-gray-200">
                                                {grade.section_code}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-[0.7rem]">{grade.semester}</td>
                                        <td className="p-4 text-gray-500 text-[0.7rem]">{grade.school_year}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination Design matching Sections */}
            <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
                <Pagination 
                    page={page} 
                    setPage={setPage} 
                    paginationInfo={paginationInfo} 
                />
            </div>

            {/* Transcript Modal */}
            <TranscriptModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedStudent(null);
                }}
                studentNumber={selectedStudent?.studentNumber}
                studentName={selectedStudent?.studentName}
            />
        </div>
    );
};

export default AdminAllGrades;
