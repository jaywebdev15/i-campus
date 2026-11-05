import React, { useCallback, useEffect, useState, useContext } from 'react'
import StudentsList from '../../components/student/StudentsList'
import { API_BASE } from '../../config/api'
import TeacherStudentList from '../../components/student/TeacherStudentList'
import StudentModal from '../../components/student/StudentModal'
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header'
import { AuthContext } from '../../context/AuthContext'
import { FlashMessageContext } from '../../context/FlashMessageContext'

const Students = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? { showFlashMessage: () => {} };
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1, 
    lastPage: "", 
    total: "", 
  });
  const [getStudentId, setGetStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Clear selection when changing page or filters
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
  }, [page, category, subCategory, searchTerm]);

  // Sorting State
  const [sortBy, setSortBy] = useState("student_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const [studentData, setStudentData] = useState({
    student_id:       "", 
    student_image:    "", 
    first_name:       "", 
    middle_name:      "", 
    last_name:        "", 
    gender:           "", 
    date_of_birth:    "", 
    contact_number:   "", 
    email_address:    "", 
    guardian_name:    "", 
    guardian_number:  "", 
    house_number:     "", 
    street_purok:     "", 
    barangay:         "", 
    town:             "", 
    province:         "", 
    education_level:  "", 
    course_code:      "", 
    year_level:       "", 
    semester:         "", 
    school_year:      "", 
    section_code:     "" 
  });

  const clearFields = () => {
    return setStudentData({
    student_id:       "", 
    student_image:    "", 
    first_name:       "", 
    middle_name:      "", 
    last_name:        "", 
    gender:           "", 
    date_of_birth:    "", 
    contact_number:   "", 
    email_address:    "", 
    guardian_name:    "", 
    guardian_number:  "", 
    house_number:     "", 
    street_purok:     "", 
    barangay:         "", 
    town:             "", 
    province:         "", 
    education_level:  "", 
    course_code:      "", 
    year_level:       "", 
    semester:         "", 
    school_year:      "", 
    section_code:     "" 
  });
  }

  const categoryTypes = {
    Gender:           [ "Male", "Female" ], 
    Education_Level:  [ "College", "Senior High", "TESDA" ], 
    College:          [ "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year" ], 
    Senior_High:      [ "Grade 11", "Grade 12" ], 
    TESDA:            [ "NC I", "NC II", "NC III", "NC IV", "Diploma Program" ], 
    Semester:         [ "1st Semester", "2nd Semester" ], 
    School_Year:      [ "2024-2025", "2025-2026" ], 
    Status:           [ "Active", "Inactive" ]
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


  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const  response = await fetch(`${API_BASE}/database/students.php`, {
          method: "POST", 
          credentials: "include", 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            action: "searchStudent", 
            category: category, 
            subCategory: subCategory, 
            searchTerm: searchTerm, 
            page: page, 
            sortBy: sortBy,
            sortOrder: sortOrder,
            teacher_number: userCredential?.login_role === 'Teacher' ? userCredential?.login_code : null
          })
        });
      const data = await response.json()
      setStudents(data.records);
      setPaginationInfo({
        currentPage: data.current_page, 
        lastPage: data.last_page, 
        total: data.total, 
      });
    } catch (error) {
      console.log("Error in fetching students", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, category, subCategory, searchTerm, page, sortBy, sortOrder, userCredential]);

  useEffect(() => { 
      fetchStudents();
  }, [fetchStudents]);

  const fetchGetStudent = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/students.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getStudent", 
          student_id: getStudentId
        })
      });
      const data = await response.json();
      setStudentData(data);
    } catch (error) {
      console.log("Error in getting student", error);
    }
  }, [getStudentId])

  useEffect(() => {
    if(getStudentId) {
      fetchGetStudent();
    }
  }, [getStudentId, fetchGetStudent]);

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(`${API_BASE}/database/students.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "deleteStudent", 
          student_id: id
        })
      });
      const result = await response.json();
      showFlashMessage(result.status, result.message);
      if(result.status === "success") {
        fetchStudents();
      }
    } catch (error) {
      console.error("Error deleting student", error);
      showFlashMessage("error", "Failed to delete student");
    }
  }

  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden lg:flex-row'>
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-screen overflow-hidden
                          ${modal !== "" 
                            ? 'blur-md pointer-events-none' 
                            : 'pointer-events-auto' 
                          }`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                setActiveNav={setActiveNav} />
        
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
            {userCredential?.login_role === 'Teacher' ? (
              <TeacherStudentList students={students} 
                          setModal={setModal} 
                          setGetStudentId={setGetStudentId} 
                          page={page} 
                          setPage={setPage} 
                          paginationInfo={paginationInfo} 
                          loading={loading} 
                          searchTerm={searchTerm} 
                          category={category} 
                          setCategory={setCategory} 
                          setSearchTerm={setSearchTerm} 
                          categoryTypes={categoryTypes} 
                          subCategory={subCategory} 
                          setSubCategory={setSubCategory} 
                          subOptions={subOptions} 
                          fetchStudents={fetchStudents} 
                          activeNav={activeNav} 
                          selectedIds={selectedIds}
                          setSelectedIds={setSelectedIds}
                          selectionMode={selectionMode}
                          setSelectionMode={setSelectionMode}
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          handleSort={handleSort}
                          handleDelete={handleDelete} />
            ) : (
              <StudentsList students={students} 
                          setModal={setModal} 
                          setGetStudentId={setGetStudentId} 
                          page={page} 
                          setPage={setPage} 
                          paginationInfo={paginationInfo} 
                          loading={loading} 
                          searchTerm={searchTerm} 
                          category={category} 
                          setCategory={setCategory} 
                          setSearchTerm={setSearchTerm} 
                          categoryTypes={categoryTypes} 
                          subCategory={subCategory} 
                          setSubCategory={setSubCategory} 
                          subOptions={subOptions} 
                          fetchStudents={fetchStudents} 
                          activeNav={activeNav} 
                          selectedIds={selectedIds}
                          setSelectedIds={setSelectedIds}
                          selectionMode={selectionMode}
                          setSelectionMode={setSelectionMode}
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          handleSort={handleSort}
                          handleDelete={handleDelete} />
            )}
          </div>
        </div>
      </section>
      <StudentModal modal={modal} 
                    setModal={setModal} 
                    studentData={studentData} 
                    setStudentData={setStudentData} 
                    fetchStudents={fetchStudents} 
                    setGetStudentId={setGetStudentId} 
                    clearFields={clearFields} />
    </main>
  )
}

export default Students