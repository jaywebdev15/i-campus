import React, { useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api'
import Header from '../../components/shared/Header'
import DashboardGrid from '../../components/dashboard/DashboardGrid'
import Nav from '../../components/shared/Nav'
import NewsFeed from '../../components/dashboard/NewsFeed'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import StudentChart from '../../components/dashboard/StudentChart'
import EnrollmentChart from '../../components/dashboard/EnrollmentChart'
import GradeChart from '../../components/dashboard/GradeChart'

const Dashboard = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => { 
  const { userCredential } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Counts
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    enrollees: 0,
    subjects: 0,
    sections: 0,
    attendance: 0, // Using enrollment count as proxy or need separate fetch? Using fetch.
    grades: 0,
    evaluations: 0
  });
  
  
  useEffect(() => {
    if(!userCredential || !userCredential?.login_status) {
      navigate("/login");
    }
  }, [userCredential, navigate]);

  const fetchCounts = async () => {
      try {
          const endpoints = [
              { key: 'students',    url: `${API_BASE}/database/students.php` },
              { key: 'teachers',    url: `${API_BASE}/database/teachers.php` },
              { key: 'courses',     url: `${API_BASE}/database/courses.php` },
              { key: 'enrollees',   url: `${API_BASE}/database/enrollments.php` }, // Returns array
              { key: 'subjects',    url: `${API_BASE}/database/subjects.php` },
              { key: 'sections',    url: `${API_BASE}/database/sections.php` },
              { key: 'attendance',  url: `${API_BASE}/database/attendance.php` },
              { key: 'evaluations', url: `${API_BASE}/database/evaluations.php` },
              // For grades, we used a specific action to get stats, but for TOTAL COUNT, we can check grades.php
              // grades.php default returns array of enrollments? Check again. 
              // grades.php line 43 returns `SELECT ... FROM enrollments`...
              // Actually we want "Grades" count. A better count might be rows in `grades` table.
              // I didn't add getTotalGrades. I'll use the getGradeStats I made to count passed+fair+bad as total
          ];

          const results = await Promise.all(endpoints.map(async (ep) => {
              const res = await fetch(ep.url);
              const data = await res.json();
              return { key: ep.key, count: Array.isArray(data) ? data.length : 0 };
          }));

          // Fetch grade stats for total count
          const gradeRes = await fetch(`${API_BASE}/database/grades.php`, {
             method: "POST", 
             headers: { 'Content-Type': 'application/json' }, 
             body: JSON.stringify({ action: "getGradeStats" })
          });
          const gradeData = await gradeRes.json();
          const totalGrades = Number(gradeData.passed || 0) + Number(gradeData.fair || 0) + Number(gradeData.bad || 0);

          const newCounts = results.reduce((acc, curr) => ({...acc, [curr.key]: curr.count}), {});
          newCounts.grades = totalGrades;

          setCounts(newCounts);
      } catch (error) {
          console.error("Error fetching dashboard counts", error);
      }
  }

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <main className='min-h-dvh flex bg-gray-200'>
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className='flex flex-col w-full lg:flex-1 h-screen overflow-hidden relative'>
        {/* Fixed Header */}
        <div className="shrink-0 z-20">
          <Header setNavOpen={setNavOpen} 
                  activeNav={activeNav} 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  setActiveNav={setActiveNav} />
        </div>
        
        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent p-5 pb-0 flex flex-col gap-6">
          <DashboardGrid 
              studentCount={counts.students}
              teacherCount={counts.teachers}
              subjectCount={counts.subjects}
              enrollmentCount={counts.enrollees}
              courseCount={counts.courses}
              sectionCount={counts.sections}
              attendanceCount={counts.attendance}
              gradeCount={counts.grades}
              evaluationCount={counts.evaluations}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full shrink-0">
              <StudentChart />
              <EnrollmentChart />
              <GradeChart />
          </div>
        </div>
        
        {/* Fixed Bottom NewsFeed */}
        <div className="shrink-0 w-full z-10 bg-gray-200 pt-2">
          <NewsFeed />
        </div>
      </section>
    </main>
  )
}

export default Dashboard