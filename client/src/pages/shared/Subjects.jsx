import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header';
import SubjectList from '../../components/subject/SubjectList';
import SubjectModal from '../../components/subject/SubjectModal';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const Subjects = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential, loading: authLoading } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [subjectModal, setSubjectModal] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
      currentPage: 1,
      lastPage: 1,
      total: 0
  });

  // Filters
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sortBy, setSortBy] = useState("subject_code");
  const [sortOrder, setSortOrder] = useState("ASC");



  const [subjectData, setSubjectData] = useState({
    subject_id: "",
    subject_code: "",
    subject_title: "",
    subject_description: "",
    units: "",
    price: "",
    category: "",
    subject_status: "Active"
  });

  const [filterOptions, setFilterOptions] = useState({
      Category: [],
      Status: [],
      Units: []
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
        const [categoryResponse, statusResponse, unitsResponse] = await Promise.all([
            fetch(`${API_BASE}/database/subjects.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getCategory" })
            }),
            fetch(`${API_BASE}/database/subjects.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getStatus" })
            }),
            fetch(`${API_BASE}/database/subjects.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getUnits" })
            })
        ]);

        const categories = await categoryResponse.json();
        const statuses = await statusResponse.json();
        const units = await unitsResponse.json();

        setFilterOptions({
            Category: categories,
            Status: statuses,
            Units: units
        });
    } catch (error) {
        console.error("Error fetching filter options", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);
  
  // Dynamic sub-options
  let subOptions = [];
  if (category && filterOptions[category]) {
     subOptions = filterOptions[category];
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };



  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/subjects.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "searchSubject", 
          searchTerm: searchTerm,
          category: category,
          subCategory: subCategory,
          page: page,
          sortBy: sortBy,
          sortOrder: sortOrder
        })
      });
      const data = await response.json();
      if(data.records) {
          setSubjects(data.records);
          setPaginationInfo({
              currentPage: data.current_page,
              lastPage: data.last_page,
              total: data.total
          });
      } else {
          setSubjects([]);
      }
    } catch (error) {
       console.error("Error fetching subjects", error);
    } finally {
       setLoading(false);
    }
  }, [searchTerm, category, subCategory, page, sortBy, sortOrder]);

  const fetchGetSubject = useCallback(async () => {
    if(!subjectId) return;
    try {
      const response = await fetch(`${API_BASE}/database/subjects.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getSubjectInfoByID", 
          subject_id: subjectId
        })
      });
      const data = await response.json();
      setSubjectData(data);
    } catch (error) {
      console.error("Error fetching subject data", error);
    }
  }, [subjectId]);



  useEffect(() => {
    if(userCredential?.login_status) {
        fetchSubjects();
    }
  }, [fetchSubjects, userCredential]);

  useEffect(() => {
      fetchGetSubject();
  }, [subjectId, fetchGetSubject]);

  // Auth Guard
  useEffect(() => {
    if(!authLoading && (!userCredential || !userCredential.login_status)) {
       navigate("/login");
    }
  }, [userCredential, authLoading, navigate]);

  if(authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (!userCredential) return null;

  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden lg:flex-row'>
      <Nav  navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
        <section className={`flex-1 flex flex-col h-screen overflow-hidden ${subjectModal ? 'blur-sm pointer-events-none' : ''}`}>
           <Header setNavOpen={setNavOpen} 
                   activeNav={activeNav} 
                   searchTerm={searchTerm} 
                   setSearchTerm={setSearchTerm} 
                   setActiveNav={setActiveNav} />
           
           <div className="flex-1 overflow-auto p-4 lg:p-10">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
                 <SubjectList 
                    subjects={subjects}
                    setSubjectId={setSubjectId}
                    loading={loading}
                    setModal={setSubjectModal}
                    categoryTypes={filterOptions}
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
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    handleSort={handleSort}
                 />
              </div>
           </div>
        </section>

        <SubjectModal 
            subjectModal={subjectModal}
            setSubjectModal={setSubjectModal}
            subjectData={subjectData}
            setSubjectData={setSubjectData}
            fetchSubjects={fetchSubjects}
            setSubjectId={setSubjectId}
        />
    </main>
  )
}

export default Subjects
