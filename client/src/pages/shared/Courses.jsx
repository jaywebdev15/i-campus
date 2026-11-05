import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header';
import CourseList from '../../components/course/CourseList';
import CourseModal from '../../components/course/CourseModal';
import CourseModalInfo from '../../components/course/CourseModalInfo';
import StudentCourseView from '../../components/course/StudentCourseView';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const Courses = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential, loading: authLoading } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseCode, setCourseCode] = useState("");
  
  // Modal States
  const [courseModal, setCourseModal] = useState(""); // "" | "add" | "edit"
  const [courseModalInfo, setCourseModalInfo] = useState(false);
  
  // Delete & Undo State
  const [deleteTimer, setDeleteTimer] = useState(null);
  const [deletedCourse, setDeletedCourse] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [countdown, setCountdown] = useState(12);

  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
      currentPage: 1,
      lastPage: 1,
      total: 0
  });

  // Filtering
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Sorting State
  const [sortBy, setSortBy] = useState("course_code");
  const [sortOrder, setSortOrder] = useState("ASC");

  const [courseData, setCourseData] = useState({
    course_id: "",
    course_code: "",
    course_title: "",
    course_description: "",
    category: "",
    total_units: "",
    course_status: "Active"
  });

  const [categoryTypes, setCategoryTypes] = useState({
      Category: [],
      Status: []
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
        const [categoryResponse, statusResponse] = await Promise.all([
            fetch(`${API_BASE}/database/courses.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getCategory" })
            }),
            fetch(`${API_BASE}/database/courses.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getStatus" })
            })
        ]);

        const categories = await categoryResponse.json();
        const statuses = await statusResponse.json();

        setCategoryTypes({
            Category: categories,
            Status: statuses
        });
    } catch (error) {
        console.error("Error fetching filter options", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  let subOptions = [];
  if (category && categoryTypes[category]) {
    subOptions = categoryTypes[category];
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
  }, [page, category, subCategory, searchTerm]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "searchCourse", 
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
          setCourses(data.records);
          setPaginationInfo({
              currentPage: data.current_page,
              lastPage: data.last_page,
              total: data.total
          });
      } else {
          setCourses([]); 
      }
    } catch (error) {
      console.error("Error fetching courses", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, subCategory, page, sortBy, sortOrder]);

  const fetchGetCourse = useCallback(async () => {
    if(!courseId) return;
    try {
      const response = await fetch(`${API_BASE}/database/courses.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "fetchCourseInfoById", 
          course_id: courseId
        })
      });
      const data = await response.json();
      setCourseData(data);
    } catch (error) {
      console.error("Error fetching course data", error);
    }
  }, [courseId]);

  // Delete Functionality
  const handleDeleteRequest = (course) => {
    // 1. Confirm Dialog
    if(window.confirm("Are you sure you want to delete this course?")) {
        confirmDelete(course);
    }
  };

  const confirmDelete = (course) => {
      // 2. Optimistic UI Update
      setCourses(current => current.filter(c => c.course_id !== course.course_id));
      setDeletedCourse(course);
      setShowUndoToast(true);
      setCountdown(12);

      // 3. Start Timer
      const timer = setInterval(() => {
          setCountdown(prev => {
              if (prev <= 1) {
                  clearInterval(timer);
                  finalizeDelete(course);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
      setDeleteTimer(timer);
  };

  const finalizeDelete = async (course) => {
      setShowUndoToast(false);
      setDeletedCourse(null);
      setDeleteTimer(null);

      // 4. Backend Delete
      try {
          const response = await fetch(`${API_BASE}/database/courses.php`, {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: "deleteCourse",
                  course_id: course.course_id
              })
          });
          const result = await response.json();
          if(result.status !== 'success') {
              // Revert if failed (optional, but good practice)
              showFlashMessage("error", "Failed to delete course. Restoring...");
              fetchCourses(); 
          }
      } catch (error) {
          console.error("Error deleting course", error);
      }
  };

  const restoreCourse = () => {
      if(deleteTimer) clearInterval(deleteTimer);
      if(deletedCourse) {
          setCourses(prev => [...prev, deletedCourse]); // Simple restore, re-fetch ensures sort order later
          setDeletedCourse(null);
          setShowUndoToast(false);
          setDeleteTimer(null);
          showFlashMessage("success", "Course restored.");
      }
  };

  useEffect(() => {
    if(userCredential?.login_status) {
        fetchCourses();
    }
  }, [fetchCourses, userCredential]);

  useEffect(() => {
      fetchGetCourse();
  }, [courseId, fetchGetCourse]);

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
        <section className={`flex-1 flex flex-col h-screen overflow-hidden ${courseModal || courseModalInfo ? 'blur-sm pointer-events-none' : ''}`}>
           <Header setNavOpen={setNavOpen} 
                   activeNav={activeNav} 
                   searchTerm={searchTerm} 
                   setSearchTerm={setSearchTerm} 
                   setActiveNav={setActiveNav} />
           
           <div className="flex-1 overflow-auto p-4 lg:p-10">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
                { userCredential.login_role === "Student" ? (
                    <StudentCourseView />
                ) : (
                    <CourseList 
                        courses={courses}
                        setCourseId={setCourseId}
                        loading={loading}
                        setCourseModal={setCourseModal}
                        setCourseModalInfo={setCourseModalInfo}
                        setCourseCode={setCourseCode}
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
                        fetchCourses={fetchCourses}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        selectionMode={selectionMode}
                        setSelectionMode={setSelectionMode}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        handleSort={handleSort}
                        handleDeleteRequest={handleDeleteRequest}
                    />
                )}
              </div>
           </div>
        </section>

        {/* Undo Toast */}
        {showUndoToast && (
            <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-[60] animate-slide-in-right">
                <div className="flex flex-col">
                    <span className="font-bold text-sm">Course Deleted</span>
                    <span className="text-xs text-gray-400">Permanently deleting in {countdown}s</span>
                </div>
                <button onClick={restoreCourse} className="text-blue-400 font-bold text-sm hover:underline hover:text-blue-300">
                    UNDO
                </button>
            </div>
        )}

        {/* Modals */}
        <CourseModal 
            courseModal={courseModal}
            setCourseModal={setCourseModal}
            courseData={courseData}
            setCourseData={setCourseData}
            fetchCourses={fetchCourses}
            setCourseId={setCourseId} // To reset ID on close
        />

        { courseModalInfo && (
            <CourseModalInfo 
                courseModalInfo={courseModalInfo}
                setCourseModalInfo={setCourseModalInfo}
                courseCode={courseCode}
                courseId={courseId}
                courseData={courseData}
            />
        )}
    </main>
  )
}

export default Courses
