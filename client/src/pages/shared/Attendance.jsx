import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header';
import AttendanceList from '../../components/attendance/AttendanceList';
import StudentAttendanceList from '../../components/attendance/StudentAttendanceList';
import AttendanceModal from '../../components/attendance/AttendanceModal';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { completeDate } from '../../scripts/utility';

const Attendance = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential, loading: authLoading } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [modal, setModal] = useState(false);
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [attendanceData, setAttendanceData] = useState({
      attendance_id:      "",
      student_number:     "", 
      subject_code:       "", 
      teacher_id:         userCredential?.login_code || "", 
      attendance_date:    completeDate(), 
      time_in:            "", 
      time_out:           "",  
      attendance_status:  "Present", 
      recorded_by:        userCredential?.login_code || "",
  });

  const categoryTypes = {
      Status: ["Present", "Absent", "Late", "Excused"],
      Date_From_To: []
  };

  let subOptions = [];
  if (category && categoryTypes[category]) {
      subOptions = categoryTypes[category];
  }

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const isStudent = userCredential?.login_role === "Student";
      // Use getAllAttendance for admins/teachers to get paginated filtered list
      // For students, use getStudentAttendance (which we might need to update to support pagination/filters if not already)
      // The backend 'getStudentAttendance' handles date range but not pagination in the code I saw? 
      // Wait, 'getStudentAttendance' in backend returns all.
      // 'getStudentAttendanceByTeacher' is for teachers?? 
      // The UI uses AttendanceList for non-students.
      
      const action = isStudent ? "getStudentAttendance" : "getAllAttendance"; 
      
      const payload = {
          action: action,
          page: page,
          searchTerm: searchTerm,
          // Map "Status" to "Remarks" for backend compatibility if that's what it expects
          category: category === "Status" ? "Remarks" : category, 
          subCategory: subCategory,
          fromDate: dateFrom,
          toDate: dateTo
      };

      if (isStudent) {
          payload.userCode = userCredential?.login_code; // Backend expects user_code for student
      }

      const response = await fetch(`${API_BASE}/database/attendance.php`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if(data.records) {
          setAttendance(data.records);
          setPaginationInfo({
              currentPage: data.current_page,
              lastPage: data.last_page,
              total: data.total
          });
      } else if (Array.isArray(data)) {
          // Handle flat array response (e.g. for students currently)
          setAttendance(data);
           setPaginationInfo({
              currentPage: 1,
              lastPage: 1,
              total: data.length
          });
      } else {
          setAttendance([]);
          setPaginationInfo({ currentPage: 1, lastPage: 1, total: 0 });
      }
    } catch (error) {
       console.error("Error fetching attendance", error);
    } finally {
       setLoading(false);
    }
  }, [searchTerm, category, subCategory, dateFrom, dateTo, page, userCredential]);

  useEffect(() => {
    if(userCredential?.login_status) {
        fetchAttendance();
    }
  }, [fetchAttendance, userCredential]);

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
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
        <section className={`flex-1 flex flex-col h-screen overflow-hidden ${modal ? 'blur-sm pointer-events-none' : ''}`}>
           <Header setNavOpen={setNavOpen} 
                   activeNav={activeNav} 
                   searchTerm={searchTerm} 
                   setSearchTerm={setSearchTerm} 
                   setActiveNav={setActiveNav} />
           
           <div className="flex-1 overflow-auto p-4 lg:p-10">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
                 {userCredential.login_role === "Student" ? (
                     <StudentAttendanceList 
                        attendance={attendance}
                        loading={loading}
                        paginationInfo={paginationInfo}
                        page={page}
                        setPage={setPage}
                     />
                 ) : (
                     <AttendanceList 
                        attendance={attendance}
                        loading={loading}
                        setModal={setModal}
                        categoryTypes={categoryTypes}
                        category={category}
                        setCategory={setCategory}
                        subCategory={subCategory}
                        setSubCategory={setSubCategory}
                        subOptions={subOptions}
                        dateFrom={dateFrom}
                        setDateFrom={setDateFrom}
                        dateTo={dateTo}
                        setDateTo={setDateTo}
                        page={page}
                        setPage={setPage}
                        paginationInfo={paginationInfo}
                        activeNav={activeNav}
                        fetchAttendance={fetchAttendance}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                     />
                 )}
              </div>
           </div>
        </section>

        <AttendanceModal 
            modal={modal}
            setModal={setModal}
            attendanceData={attendanceData}
            setAttendanceData={setAttendanceData}
            fetchAttendance={fetchAttendance}
        />
    </main>
  )
}

export default Attendance
