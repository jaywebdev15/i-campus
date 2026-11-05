import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Students from './pages/shared/Students'
import Attendance from './pages/shared/Attendance'
import Courses from './pages/shared/Courses'
import Teachers from './pages/shared/Teachers'
import Admins from './pages/shared/Admins'
import Subjects from './pages/shared/Subjects'
import Dashboard from './pages/shared/Dashboard'
import Enrollment from './pages/shared/Enrollment'
import Curriculums from './pages/shared/Curriculums'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Profile from './pages/shared/Profile'
import Sections from './pages/shared/Sections'
import Grades from './pages/shared/Grades'
import ELearning from './pages/shared/ELearning'
import HandBook from './pages/shared/HandBook'
import Evaluation from './pages/shared/Evaluation'
import Users from './pages/shared/Users'
import SchoolCalendar from './pages/shared/SchoolCalendar'
import Payments from './pages/shared/Payments';
import NotFound from './pages/shared/NotFound';

import Index from './pages/shared/Index'
import OnlineRegistration from './pages/auth/OnlineRegistration'
import OnlineEnrollment from './pages/auth/OnlineEnrollment'

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Router basename={import.meta.env.PROD ? "/projects/school-management" : "/"}>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/online-registration" element={<OnlineRegistration />} />
        <Route path="/online-enrollment" element={<OnlineEnrollment />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowed={["Admin"]}>
            <Dashboard
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/teachers" element={
          <ProtectedRoute allowed={["Admin"]}>
            <Teachers
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/admins" element={
          <ProtectedRoute allowed={["Admin"]}>
            <Admins
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/students" element={
          <ProtectedRoute allowed={["Admin", "Teacher"]}>
            <Students
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <Attendance
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/enrollment" element={
          <ProtectedRoute allowed={["Admin", "Registrar"]}>
            <Enrollment
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/curriculums" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <Curriculums
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/courses" element={
          <ProtectedRoute allowed={["Admin", "Student"]}>
            <Courses
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/subjects" element={
          <ProtectedRoute allowed={["Admin", "Teacher"]}>
            <Subjects
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/sections" element={
          <ProtectedRoute allowed={["Admin", "Teacher"]}>
            <Sections
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/grades" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <Grades 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/e-learning" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <ELearning  
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <Profile 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/handbook" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <HandBook 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/evaluation" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <Evaluation 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/school-calendar" element={
          <ProtectedRoute allowed={["Admin", "Teacher", "Student"]}>
            <SchoolCalendar 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute allowed={["Admin", "Registrar"]}>
            <Payments 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowed={["Admin"]}>
            <Users 
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
