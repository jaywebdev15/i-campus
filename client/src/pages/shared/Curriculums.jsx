import React, { useCallback, useContext, useEffect, useState } from 'react'
import Nav from '../../components/shared/Nav'
import { API_BASE } from '../../config/api'
import Header from '../../components/shared/Header'
import CurriculumList from '../../components/curriculum/CurriculumList';
import CurriculumModal from '../../components/curriculum/CurriculumModal';
import { AuthContext } from '../../context/AuthContext';
import StudentCurriculum from '../../components/curriculum/StudentCurriculum';

const Curriculums = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential } = useContext(AuthContext);
  const [curriculumModal, setCurriculumModal] = useState("");
  const [curriculums, setCurriculums] = useState([]);
  const [curriculumId, setCurriculumId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1, 
    lastPage: "", 
    total: "", 
  });
  
  // Category filter state
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  /* 
    State to hold dynamic filter options (raw data from DB)
    Structure: { units: [] }
  */
  const [filterOptions, setFilterOptions] = useState({
    units: []
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "getFilterOptions" })
      });
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.log("Error fetching filter options", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Construct categoryTypes for FilterAndSearch component
  // We use hardcoded values as requested, except for Units which is dynamic
  const [categoryTypes, setCategoryTypes] = useState({
    Education_Level: ["College", "Senior High", "TESDA"],
    Year_Level: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
    Semester: ["1st Semester", "2nd Semester"],
    Status: ["Available", "Unavailable"],
    Units: [], // Dynamic
  });

  useEffect(() => {
    setCategoryTypes(prev => ({
      ...prev,
      Units: filterOptions.units || [],
    }));
  }, [filterOptions]);
  
  // Logic to determine subOptions based on selected Category
  // Note: FilterAndSearch should handle this correctly
  let subOptions = [];
  if (category && categoryTypes[category]) {
    subOptions = categoryTypes[category];
  }
  
  const [curriculumData, setCurriculumData] = useState({
    curriculum_id:        "", 
    course_code:          "", 
    education_level:      "", 
    year_level:           "", 
    semester:             "", 
    subject_code:         "", 
    subject_title:        "", 
    subject_description:  "", 
    units:                "", 
    category:             "", 
    price:                "", 
    status:               "" 
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Clear selection when changing page or filters
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
  }, [page, category, subCategory, searchTerm]);

  // Sorting State
  const [sortBy, setSortBy] = useState("curriculum_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const fetchCurriculums = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "searchCurriculum", 
          category: category,
          subCategory: subCategory,
          searchTerm: searchTerm,
          page: page,
          sortBy: sortBy,
          sortOrder: sortOrder
        })
      });
      const data = await response.json();
      setCurriculums(data.records || data);
      if (data.current_page) {
        setPaginationInfo({
          currentPage: data.current_page, 
          lastPage: data.last_page, 
          total: data.total
        });
      } else {
        setPaginationInfo({
          currentPage: 1, 
          lastPage: 1, 
          total: Array.isArray(data) ? data.length : (data.records?.length || 0)
        });
      }
    } catch (error) {
      console.log("Error fetching curriculums", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, subCategory, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchCurriculums();
  }, [fetchCurriculums]);

  const fetchCurriculumInfoById = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getCurriculumInfoById", 
          curriculum_id: curriculumId
        })
      });
      const data = await response.json();
      setCurriculumData({
        ...data,
        status: data.curriculum_status // Map backend status to frontend state
      });
    } catch (error) {
      console.log("Error fetching curriculum info by id", error);
    }
  }, [curriculumId]);

  useEffect(() => {
    if(curriculumId) {
      fetchCurriculumInfoById();
    }
  }, [curriculumId, fetchCurriculumInfoById]);

  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden lg:flex-row'>
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-screen overflow-hidden
                          ${curriculumModal !== "" 
                            ? 'blur-md pointer-events-none' 
                            : 'pointer-events-auto' 
                          }`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                setActiveNav={setActiveNav} />
        
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
            {userCredential?.login_role === "Admin" || userCredential?.login_role === "Teacher" 
              ? (
                <CurriculumList curriculums={curriculums} 
                                setCurriculumModal={setCurriculumModal} 
                                setCurriculumId={setCurriculumId} 
                                loading={loading}
                                categoryTypes={categoryTypes}
                                category={category}
                                setCategory={setCategory}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                subCategory={subCategory}
                                setSubCategory={setSubCategory}
                                subOptions={subOptions}
                                page={page}
                                setPage={setPage}
                                paginationInfo={paginationInfo}
                                activeNav={activeNav}
                                fetchCurriculums={fetchCurriculums}
                                selectedIds={selectedIds}
                                setSelectedIds={setSelectedIds}
                                selectionMode={selectionMode}
                                setSelectionMode={setSelectionMode}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                handleSort={handleSort} />
              ) : (
                <StudentCurriculum />
              )}
          </div>
        </div>
      </section>
      <CurriculumModal curriculumModal={curriculumModal} 
                    setCurriculumModal={setCurriculumModal} 
                    curriculumData={curriculumData} 
                    setCurriculumData={setCurriculumData} 
                    fetchCurriculums={fetchCurriculums} 
                    setCurriculumId={setCurriculumId} 
                    filterOptions={filterOptions} 
                    fetchFilterOptions={fetchFilterOptions} />
    </main>
  )
}

export default Curriculums