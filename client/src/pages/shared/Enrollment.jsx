import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api'
import Header from '../../components/shared/Header'
import Nav from '../../components/shared/Nav'
import EnrollmentList from '../../components/enrollment/EnrollmentList'
import EnrolleeModal from '../../components/enrollment/EnrolleeModal'
import { completeDateTime } from '../../scripts/utility'
import EnrollmentModalInfo from '../../components/enrollment/EnrollmentModalInfo'
import EnrolleeCardID from '../../components/enrollment/EnrolleeCardID'

const Enrollment = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => { 
  const [enrollees, setEnrollees] = useState([]);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currenPage: 1, 
    lastPage: "", 
    total: "", 
  });
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [modal, setModal] = useState("");
  const [enrolleeId, setEnrolleeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrollmentModalInfo, setEnrollmentModalInfo] = useState(false);
  const [enrolleeCardModal, setEnrolleeCardModal] = useState(false);
  const [enrolleeData, setEnrolleeData] = useState({
    enrollment_id:    "", 
    student_number:   "", 
    education_level:  "", 
    course_code:      "", 
    year_level:       "", 
    semester:         "", 
    school_year:      "", 
    section_code:     "", 
    date_enrolled:    "", 
    enrollee_status:  "", 
    payment_status:   "", 
    remarks:          "", 
    created_at:       completeDateTime(),  
    updated_at:       completeDateTime() 
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
  const [sortBy, setSortBy] = useState("enrollment_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };


  const categoryTypes = {
    Gender:           [ "Male", "Female" ], 
    Education_Level:  [ "College", "Senior High", "TESDA" ], 
    College:          [ "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year" ], 
    Senior_High:      [ "Grade 11", "Grade 12" ], 
    TESDA:            [ "NC I", "NC II", "NC III", "NC IV", "Diploma Program" ], 
    Semester:         [ "1st Semester", "2nd Semester" ], 
    School_Year:      [ "2024-2025", "2025-2026" ], 
    Enrollee_Status:  [ "Enrolled", "Pending", "Drop", "Completed" ], 
    Payment_Status:   [ "Paid", "Unpaid", "Partial" ], 
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


  // ==========> Fetch Enrollees <========== \\
  const fetchEnrollees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`, {
          method: "POST", 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            action: "searchEnrollees", 
            category: category, 
            subCategory: subCategory, 
            searchTerm: searchTerm, 
            page: page, 
            sortBy: sortBy,
            sortOrder: sortOrder
          })
        });
      const data = await response.json();
      setEnrollees(data.records);
      setPaginationInfo({
        currentPage: data.current_page, 
        lastPage: data.last_page, 
        total: data.total, 
      });
    } catch (error) {
      console.log("Error fetching enrollees", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, category, subCategory, searchTerm, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchEnrollees();
  }, [fetchEnrollees]);
  // ==========> Fetch Enrollees <========== \\



  // ==========> Fetch Enrollee Data by ID <========== \\
  const getEnrolleeData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getEnrolleeInfoById", 
          enrollment_id: enrolleeId
        })
      });
      const data = await response.json();
      setEnrolleeData(data);
    } catch (error) {
      console.log("Error in geting enrollee data", error);
    }
  }, [enrolleeId]);

  useEffect(() => {
    if(enrolleeId) {
      getEnrolleeData();
    }
  }, [enrolleeId, getEnrolleeData]);
  // ==========> Fetch Enrollee Data by ID <========== \\



  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden lg:flex-row'>
      <Nav  navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-screen overflow-hidden
                          ${modal !== "" || enrollmentModalInfo || enrolleeCardModal
                            ? 'blur-md pointer-events-none' 
                            : 'pointer-events-auto' 
                          }`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                setActiveNav={setActiveNav} />
        
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
            <EnrollmentList enrollees={enrollees} 
                            setModal={setModal} 
                            setEnrolleeId={setEnrolleeId} 
                            loading={loading} 
                            setEnrollmentModalInfo={setEnrollmentModalInfo} 
                            setEnrolleeCardModal={setEnrolleeCardModal} 
                            categoryTypes={categoryTypes} 
                            category={category} 
                            setCategory={setCategory} 
                            subCategory={subCategory} 
                            setSubCategory={setSubCategory} 
                            fetchEnrollees={fetchEnrollees} 
                            activeNav={activeNav} 
                            searchTerm={searchTerm} 
                            setSearchTerm={setSearchTerm} 
                            paginationInfo={paginationInfo} 
                            page={page} 
                            setPage={setPage} 
                            subOptions={subOptions}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            selectionMode={selectionMode}
                            setSelectionMode={setSelectionMode}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            handleSort={handleSort} />
          </div>
        </div>
      </section>
      <EnrolleeModal  enrolleeData={enrolleeData} 
                      setEnrolleeData={setEnrolleeData} 
                      modal={modal} 
                      setModal={setModal} 
                      fetchEnrollees={fetchEnrollees} 
                      setEnrolleeId={setEnrolleeId}  />
      <EnrollmentModalInfo  enrollmentModalInfo={enrollmentModalInfo} 
                            setEnrollmentModalInfo={setEnrollmentModalInfo} 
                            enrolleeId={enrolleeId} 
                            setEnrolleeId={setEnrolleeId}  />
      <EnrolleeCardID  enrolleeCardModal={enrolleeCardModal} 
                        setEnrolleeCardModal={setEnrolleeCardModal} 
                        enrolleeId={enrolleeId} 
                        setEnrolleeId={setEnrolleeId}  />
    </main>
  )
}

export default Enrollment