import React from 'react'
import { BiUser, BiIdCard, BiBook, BiUserCheck, BiCertification, BiGroup, BiTimeFive, BiStar, BiFile } from 'react-icons/bi';

import { useNavigate } from 'react-router-dom';

const DashboardGrid = ({ 
  studentCount, 
  teacherCount, 
  subjectCount, 
  enrollmentCount, 
  courseCount, 
  sectionCount, 
  attendanceCount, 
  gradeCount, 
  evaluationCount 
}) => {
  const navigate = useNavigate();

  const dashboardGrid = [
    { title: "Total Students",    icon: "user",           count: studentCount,     color: "blue",   path: "/students" }, 
    { title: "Total Teachers",    icon: "id-card",        count: teacherCount,     color: "purple", path: "/teachers" }, 
    { title: "Total Subjects",    icon: "book",           count: subjectCount,     color: "orange", path: "/subjects" }, 
    { title: "Total Enrollments", icon: "user-check",     count: enrollmentCount,  color: "green",  path: "/enrollment" }, 
    { title: "Total Courses",     icon: "certification",  count: courseCount,      color: "red",    path: "/courses" }, 
    { title: "Total Sections",    icon: "group",          count: sectionCount,     color: "cyan",   path: "/sections" },
    { title: "Attendance",        icon: "time-five",      count: attendanceCount,  color: "yellow", path: "/attendance" },
    { title: "Grades",            icon: "star",           count: gradeCount,       color: "pink",   path: "/grades" },
    { title: "Evaluations",       icon: "file",           count: evaluationCount,  color: "indigo", path: "/evaluation" }
  ];

  const iconMap = {
    "user": BiUser,
    "id-card": BiIdCard,
    "book": BiBook,
    "user-check": BiUserCheck,
    "certification": BiCertification,
    "group": BiGroup,
    "time-five": BiTimeFive,
    "star": BiStar,
    "file": BiFile
  };

  return (
    <div className='flex flex-col p-5'>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardGrid.map((grid) => {
           // Map color names to tailwind classes mapping
           const colorClasses = {
              blue:   { border: "border-l-blue-500",   text: "text-blue-500" },
              purple: { border: "border-l-purple-500", text: "text-purple-500" },
              orange: { border: "border-l-orange-500", text: "text-orange-500" },
              green:  { border: "border-l-green-500",  text: "text-green-500" },
              red:    { border: "border-l-red-500",    text: "text-red-500" },
              cyan:   { border: "border-l-cyan-500",   text: "text-cyan-500" },
              yellow: { border: "border-l-yellow-500", text: "text-yellow-500" },
              pink:   { border: "border-l-pink-500",   text: "text-pink-500" },
              indigo: { border: "border-l-indigo-500", text: "text-indigo-500" },
           };
           const theme = colorClasses[grid.color];
           const IconComponent = iconMap[grid.icon] || BiBook;

          return (
            <div key={grid.title}
                  onClick={() => navigate(grid.path)}
                  className={`flex flex-row justify-between p-6 gap-4 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 ${theme.border} cursor-pointer`}>
              <div className={`flex flex-col`}>
                <div className='text-gray-500 text-sm font-medium uppercase tracking-wider'>{grid.title}</div>
                <div className='font-bold text-4xl mt-2 text-gray-800'>{grid.count || 0}</div>
              </div>
              <div className={`p-4 rounded-full bg-gray-50 flex items-center justify-center`}>
                <IconComponent className={`text-3xl ${theme.text}`} /> 
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default DashboardGrid