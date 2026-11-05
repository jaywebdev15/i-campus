import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header'
import { API_BASE } from '../../config/api'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import StudentEvaluationToTeacher from '../../components/evaluation/StudentEvaluationToTeacher'
import TeacherEvaluationToStudent from '../../components/evaluation/TeacherEvaluationToStudent'
import AdminEvaluationView from '../../components/evaluation/AdminEvaluationView'

import { useNavigate } from 'react-router-dom';

const Evaluation = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [evaluations, setEvaluations] = useState([]);
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
  
  const categoryTypes = {
    School_Year: ["2024-2025", "2025-2026", "2026-2027"],
  };
  
  let subOptions = [];
  if (category) {
    const selected = categoryTypes[category];
    if (Array.isArray(selected)) {
      subOptions = selected;
    } else if (typeof selected === "object") {
      subOptions = Object.keys(selected);
    }
  }

  // Tab State
  const [activeTab, setActiveTab] = useState("Teacher"); // "Teacher" or "Student"

  // Sorting State
  const [sortBy, setSortBy] = useState("evaluation_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Clear selection and sort when changing filters or tabs
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
    setSortBy("evaluation_id");
    setSortOrder("DESC");
  }, [activeTab, searchTerm, category, subCategory]);

  // Auth Protection
  useEffect(() => {
    if(!authLoading && (!userCredential || !userCredential?.login_status)) {
       navigate("/login");
    }
  }, [userCredential, authLoading, navigate]);

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      const action = activeTab === "Teacher" ? "searchEvaluation" : "searchStudentEvaluation";
      
      const response = await fetch(`${API_BASE}/database/evaluations.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          searchTerm: searchTerm,
          categories: category,
          subCategory: subCategory,
          page: page,
          sortBy: sortBy,
          sortOrder: sortOrder
        })
      });
      const data = await response.json();
      setEvaluations(data.records || data);
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
      console.log("Error in backend", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, subCategory, page, activeTab, sortBy, sortOrder]);

  useEffect(() => {
    if(userCredential?.login_status) {
        fetchEvaluations();
    }
  }, [fetchEvaluations, userCredential]);
  
  if(authLoading) return <div className="min-h-screen bg-gray-200 flex items-center justify-center">Loading...</div>;

  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden 
                    sm:h-dvh 
                    lg:flex-row'>
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-full relative overflow-hidden`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                setActiveNav={setActiveNav} />
        
        {/* Main Content Card */}
        <div className="flex-1 overflow-hidden p-4 lg:p-10">
          <div className="w-full h-full bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 relative flex flex-col">
            {userCredential?.login_role === "Student" ? (
                <StudentEvaluationToTeacher />
              ) : userCredential?.login_role === "Teacher" ? (
                <TeacherEvaluationToStudent />
              ) : (
                <AdminEvaluationView evaluations={evaluations} 
                                      loading={loading}
                                      categoryTypes={categoryTypes}
                                      category={category}
                                      setCategory={setCategory}
                                      searchTerm={searchTerm}
                                      setSearchTerm={setSearchTerm}
                                      subCategory={subCategory}
                                      setSubCategory={setSubCategory}
                                      subOptions={subOptions}
                                      activeNav={activeNav}
                                      fetchEvaluations={fetchEvaluations}
                                      page={page}
                                      setPage={setPage}
                                      paginationInfo={paginationInfo}
                                      activeTab={activeTab}
                                      setActiveTab={setActiveTab}
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                      handleSort={handleSort}
                                      selectedIds={selectedIds}
                                      setSelectedIds={setSelectedIds}
                                      selectionMode={selectionMode}
                                      setSelectionMode={setSelectionMode} />
              )
            }
          </div>
        </div>
      </section>
    </main>
  )
}

export default Evaluation