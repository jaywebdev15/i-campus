import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header';
import SectionList from '../../components/section/SectionList';
import SectionModal from '../../components/section/SectionModal';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const Sections = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential, loading: authLoading } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [sectionModal, setSectionModal] = useState("");
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
  const [sortBy, setSortBy] = useState("section_code");
  const [sortOrder, setSortOrder] = useState("ASC");

  const [filterOptions, setFilterOptions] = useState({
      Education_Level: [],
      Semester: [],
      Schedule: []
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none");

  const [sectionData, setSectionData] = useState({
    section_id:       "", 
    section_code:     "", 
    education_level:  "", 
    course_code:      "", 
    curriculum_id:    "", 
    year_level:       "", 
    semester:         "", 
    teacher_number:   "", 
    schedule:         "", 
    time_in:          "", 
    time_out:         "", 
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
        const [eduResponse, semResponse, schedResponse] = await Promise.all([
            fetch(`${API_BASE}/database/sections.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getEducationLevels" })
            }),
            fetch(`${API_BASE}/database/sections.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getSemesters" })
            }),
            fetch(`${API_BASE}/database/sections.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getSchedules" })
            })
        ]);

        const educationLevels = await eduResponse.json();
        const semesters = await semResponse.json();
        const schedules = await schedResponse.json();

        // Map schedules back to full names if needed for UI (Optional, but user asked for "Monday" etc)
        // DB has "M", "T". Let's provide a map for display if we want. 
        // For simplicity and "database driven" accuracy, we show what is in DB, 
        // OR we can map short codes to long names here.
        // Let's just use what's in DB for now to be safe, or map if we know the codes.
        // The user asked for "Monday - Saturday". 
        // If DB has "M", I should probably map it for display in the dropdown.
        // But FilterAndSearch just displays values. 
        // I'll stick to raw DB values for "database driven" correctness unless I want to create a map.
        // Let's use raw values. Users will see "M", "T". If they want "Monday", I'd need a map in FilterAndSearch.
        // Wait, the user prompt said "Schedule (Moday -Saturday)".
        // I will map them for the UI in filterOptions.
        
        const scheduleMap = {
            "M": "Monday",
            "T": "Tuesday",
            "W": "Wednesday",
            "Th": "Thursday",
            "F": "Friday",
            "S": "Saturday"
        };
        const mappedSchedules = schedules.map(s => scheduleMap[s] || s);

        setFilterOptions({
            Education_Level: educationLevels,
            Semester: semesters,
            Schedule: mappedSchedules
        });
    } catch (error) {
        console.error("Error fetching filter options", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);
  
  // Dynamic sub-options logic
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

  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
  }, [page, category, subCategory, searchTerm]);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/sections.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "searchSection", 
          searchTerm: searchTerm,
          category: category,
          subCategory: subCategory,
          page: page,
          sortBy: sortBy,
          sortOrder: sortOrder,
          teacher_number: userCredential?.login_role === 'Teacher' ? userCredential.login_code : null
        })
      });
      const data = await response.json();
      if(data.records) {
          setSections(data.records);
          setPaginationInfo({
              currentPage: data.current_page,
              lastPage: data.last_page,
              total: data.total
          });
      } else {
          setSections([]);
      }
    } catch (error) {
       console.error("Error fetching sections", error);
    } finally {
       setLoading(false);
    }
  }, [searchTerm, category, subCategory, page, sortBy, sortOrder, userCredential]);

  const fetchGetSection = useCallback(async () => {
    if(!sectionId) return;
    try {
      const response = await fetch(`${API_BASE}/database/sections.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getSectionInfoByID", 
          section_id: sectionId
        })
      });
      const data = await response.json();
      setSectionData(data);
    } catch (error) {
      console.error("Error fetching section data", error);
    }
  }, [sectionId]);

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this section?")) return;
      try {
          const response = await fetch(`${API_BASE}/database/sections.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
              action: "deleteSection", 
              section_id: id
            })
          });
          const result = await response.json();
          showFlashMessage(result.status, result.message);
          if(result.status === "success") {
              fetchSections();
          }
      } catch (error) {
          console.error("Error deleting section", error);
          showFlashMessage("error", "Failed to delete section");
      }
  }

  useEffect(() => {
    if(userCredential?.login_status) {
        fetchSections();
    }
  }, [fetchSections, userCredential]);

  useEffect(() => {
      fetchGetSection();
  }, [sectionId, fetchGetSection]);

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
        <section className={`flex-1 flex flex-col h-screen overflow-hidden ${sectionModal ? 'blur-sm pointer-events-none' : ''}`}>
           <Header setNavOpen={setNavOpen} 
                   activeNav={activeNav} 
                   searchTerm={searchTerm} 
                   setSearchTerm={setSearchTerm} 
                   setActiveNav={setActiveNav} />
           
           <div className="flex-1 overflow-auto p-4 lg:p-10">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
                 <SectionList 
                    sections={sections}
                    setSectionId={setSectionId}
                    loading={loading}
                    setModal={setSectionModal}
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
                    activeNav={activeNav}
                    fetchSections={fetchSections}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    selectionMode={selectionMode}
                    setSelectionMode={setSelectionMode}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    handleSort={handleSort}
                    handleDelete={handleDelete}
                 />
              </div>
           </div>
        </section>

        <SectionModal 
            sectionModal={sectionModal}
            setSectionModal={setSectionModal}
            sectionData={sectionData}
            setSectionData={setSectionData}
            fetchSections={fetchSections}
            setSectionId={setSectionId}
        />
    </main>
  )
}

export default Sections
