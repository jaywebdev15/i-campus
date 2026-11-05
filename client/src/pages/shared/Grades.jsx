import React, { useCallback, useEffect, useState, useContext } from 'react' // Added useContext
import { AuthContext } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';
// Added AuthContext
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header';
import GradeList from '../../components/grade/GradeList';
import GradeModal from '../../components/grade/gradeModal';
import Criteria from '../../components/grade/Criteria';
import Percentage from '../../components/grade/Percentage';
import Average from '../../components/grade/Average';
import StudentGrades from '../../components/grade/StudentGrades'; // Added StudentGrades
import AdminAllGrades from '../../components/grade/AdminAllGrades';
import GradingTable from '../../components/grade/GradingTable';
// import CourseModalInfo from '../../components/course/CourseModalInfo';

const Grades = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential } = useContext(AuthContext); // Moved up
  
  const [grades, setGrades] = useState([]);
  const [gradeModal, setGradeModal] = useState("");
  const [loading, setLoading] = useState(false);
  const [gradeId, setGradeId] = useState("");
  const [selectedTab, setSelectedTab] = useState("Criteria"); 
  const [gradeData, setGradeData] = useState({
    curriculum_id:  "", 
    enrollment_id:  "", 
    criteria_id:    "", 
    assessment:     "", 
    grading_term:   "", 
    date:           "", 
    grade:          "" 
  });

  const [availableCriteria, setAvailableCriteria] = useState([]); 
  const [criteriaRefreshKey, setCriteriaRefreshKey] = useState(0); // For triggering refresh without reload

  // Conditionally define categories based on role
  // Teachers get a "Grading" tab; Admins see Criteria, Percentage, Overview
  const isTeacher = userCredential?.login_role === 'Teacher';
  const isReadOnly = userCredential?.login_role === 'Admin' || userCredential?.user_type === 'Admin';

  const categories = isTeacher 
    ? [ "Grading", "Criteria", "Percentage", "Overview" ]
    : [ "Criteria", "Percentage", "Overview" ];

  // Default tab: Grading for teachers, Criteria for admins
  const [defaultSet, setDefaultSet] = useState(false);
  useEffect(() => {
    if (!defaultSet && userCredential) {
      setSelectedTab(isTeacher ? "Grading" : "Criteria");
      setDefaultSet(true);
    }
  }, [userCredential, isTeacher, defaultSet]);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if(!searchTerm) {
        response = await fetch(`${API_BASE}/database/grades.php`);
      } else {
        response = await fetch(`${API_BASE}/database/grades.php`, {
          method: "POST", 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            action: "searchGrade", 
            searchTerm: searchTerm
          })
        });
      }
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.log("Error in fetching grade", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const fetchGetGradeId = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/grades.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "fetchGradeInfoById", 
          grade_id: gradeId
        })
      });
      const data = await response.json();
      setGradeData(data);
    } catch (error) {
      console.log("Error fetching grade id", error);
    }
  }, [gradeId]);

  useEffect(() => {
    if(gradeId) {
      fetchGetGradeId();
    }
  }, [gradeId, fetchGetGradeId]);

  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden 
                    sm:h-dvh 
                    lg:flex-row'>
      <Nav  navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav}
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-screen overflow-hidden
                          ${gradeModal ? 'blur-md pointer-events-none' : 'pointer-events-auto'}`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                setActiveNav={setActiveNav} />

        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">

          {/* CHECK ROLE */}
          {userCredential?.login_role === 'Student' ? (
             <StudentGrades searchTerm={searchTerm} />
          ) : (
            <>
              {/* TAB HEADERS */}
              <div className="flex items-center gap-8 border-b border-gray-100 px-8 pt-6 pb-0 w-full shrink-0">
                {categories.map(category => (
                  <button 
                    key={category}
                    onClick={() => setSelectedTab(category)}
                    className={`pb-4 text-xs font-bold transition-all duration-200 uppercase tracking-widest relative
                      ${selectedTab === category 
                        ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Content */}
              {selectedTab === "Overview" ? (
                  <AdminAllGrades />
              ) : selectedTab === "Grading" ? (
                <div className="flex-1 overflow-auto p-4">
                    <GradingTable 
                        selectedTab={selectedTab} 
                        setLoading={setLoading} 
                        readOnly={isReadOnly} />
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                    <Criteria selectedTab={selectedTab} />

                    <Percentage selectedTab={selectedTab} 
                                setGradeId={setGradeId}
                                setGradeModal={setGradeModal}
                                setGradeData={setGradeData}
                                setAvailableCriteria={setAvailableCriteria}
                                refreshKey={criteriaRefreshKey}
                                loading={loading} />

                    <Average 
                        setLoading={setLoading} 
                        selectedTab={selectedTab} />
                </div>
              )}
            </>
          )}

          </div>
        </div>
      </section>
      <GradeModal gradeData={gradeData} 
                    setGradeData={setGradeData} 
                    gradeModal={gradeModal} 
                    setGradeModal={setGradeModal} 
                    fetchGrades={fetchGrades} 
                    setGradeId={setGradeId}
                    availableCriteria={availableCriteria}
                    onCriteriaUpdate={() => setCriteriaRefreshKey(prev => prev + 1)} /> {/* Pass update callback */}
      {/* <CourseModalInfo  courseModalInfo={courseModalInfo} 
                        setCourseModalInfo={setCourseModalInfo} 
                        courseCode={courseCode}  /> */}
    </main>
  )
}

export default Grades