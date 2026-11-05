import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logoutUser } from '../../scripts/users';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { IMAGE_BASE } from '../../config/api';
import { FaUser, FaBookOpenReader, FaUserGraduate, FaUserCheck, FaGraduationCap, FaBookBookmark, FaSchool, FaCalendarDays, FaUsers, FaUserSecret } from "react-icons/fa6";
import { BiSolidDashboard, BiCalendar } from "react-icons/bi";
import { GiTeacher } from "react-icons/gi";
import { IoBook, IoTv, IoLogOut } from "react-icons/io5";
import { GrScorecard } from "react-icons/gr";
import { BsPencilSquare } from "react-icons/bs";


const Nav = ({ navOpen, setNavOpen, setActiveNav, setSearchTerm }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const { userCredential, setUserCredential } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const navs = [
    { title: "Profile",       icon: <FaUser />,             path: '/profile',       allowed: [ "Admin", "Teacher", "Registrar", "Student" ]}, 
    { title: "Dashboard",     icon: <BiSolidDashboard />,   path: '/dashboard',     allowed: [ "Admin" ]}, 
    { title: "Admins",        icon: <FaUserSecret />,       path: '/admins',        allowed: [ "Admin" ]}, 
    { title: "Teachers",      icon: <GiTeacher />,          path: '/teachers',      allowed: [ "Admin", "Registrar" ]}, 
    { title: "Students",      icon: <FaUserGraduate />,     path: '/students',      allowed: [ "Admin", "Registrar", "Teacher" ]}, 
    { title: "Curriculum",    icon: <IoBook />,             path: '/curriculums',   allowed: [ "Admin", "Registrar" ]}, 
    { title: "Enrollment",    icon: <FaUserCheck  />,       path: '/enrollment',    allowed: [ "Admin", "Registrar" ]}, 
    { title: "Payments",      icon: <FaUser />,             path: '/payments',      allowed: [ "Admin", "Registrar" ]},
    { title: "Courses",       icon: <FaGraduationCap />,    path: '/courses',       allowed: [ "Admin", "Registrar", "Student" ]}, 
    { title: "Subjects",      icon: <FaBookBookmark />,     path: '/subjects',      allowed: [ "Admin", "Teacher", "Registrar" ]}, 
    { title: "Sections",      icon: <FaSchool />,           path: '/sections',      allowed: [ "Admin", "Teacher", "Registrar" ]}, 
    { title: "Attendance",    icon: <FaCalendarDays />,     path: '/attendance',    allowed: [ "Admin", "Teacher", "Student" ]}, 
    { title: "Grades",        icon: <GrScorecard />,        path: '/grades',        allowed: [ "Admin", "Teacher", "Student" ]}, 
    { title: "E-Learning",    icon: <IoTv />,               path: '/e-learning',    allowed: [ "Admin", "Teacher", "Registrar" ]}, 
    { title: "School Calendar", icon: <BiCalendar />,       path: '/school-calendar', allowed: [ "Admin", "Teacher", "Student" ]},
    { title: "Handbook",      icon: <FaBookOpenReader />,   path: "/handbook",      allowed: [ "Admin", "Teacher", "Student" ]}, 
    { title: "Evaluation",    icon: <BsPencilSquare />,     path: "/evaluation",    allowed: [ "Admin", "Teacher", "Student" ]}, 
    { title: "Users",         icon: <FaUsers />,            path: "/users",         allowed: [ "Admin" ]}, 
  ];

  // Dynamic Theme Classes
  const navBg = theme === 'light' 
    ? 'bg-white border-r border-gray-100 text-gray-800' 
    : theme === 'dark' 
      ? 'bg-black text-white border-r border-gray-800' 
      : 'bg-white border-r border-gray-100 text-gray-800'; // Match light/clean look

  return (
    <nav className={`fixed top-0 max-h-screen min-h-screen h-screen w-full z-50 
                    flex flex-col p-4 gap-4 shadow-sm
                    transition-all duration-300 ease-in-out 
                    lg:sticky lg:w-64 lg:left-0 lg:text-base 
                    ${navBg}
                    ${navOpen ? 'left-0' : '-left-full'}`} 
          onClick={() => setNavOpen(false)}>
      
      {/* Brand Section */}
      <div className="flex flex-col items-center gap-3 px-2 py-4 mb-2">
           <img src={theme === "light" 
                        ? `${IMAGE_BASE}/logo/i-campus.png` 
                        : `${IMAGE_BASE}/logo/i-campus2.png`} alt="Logo" 
                className='h-10 object-contain hover:scale-105 transition-transform duration-300' />
           <div>
             {/* <h1 className="text-lg font-black tracking-tight text-blue-600 leading-tight">iCampus</h1> */}
             <p className="text-[0.6rem] text-gray-400 font-bold uppercase tracking-widest">School System</p>
           </div>
      </div>

      {/* Navigation Links */}
      <ul className='flex-1 list-none flex flex-col gap-1 overflow-y-auto p-1 scrollbar-hide'>
        {navs
          .filter(nav => nav.allowed.includes(userCredential?.login_role))
          .map((nav, index) => (
            <NavLink key={index} 
                    to={nav.path} 
                    className={({ isActive }) => `flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-xl
                              transition-all duration-200 group
                              ${isActive 
                                  ? 'bg-blue-50 text-blue-600 font-bold' 
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'}`} 
                    onClick={() => {
                        setActiveNav(nav.title);
                        if (setSearchTerm) setSearchTerm("");
                    }}>
              {({ isActive }) => (
                <>
                  <span className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'} transition-colors duration-200`}>
                      {nav.icon}
                  </span>
                  <span className="tracking-wide text-xs">{nav.title}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </ul>

      {/* Footer / User Profile & Logout */}
      <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-100 uppercase overflow-hidden">
              {userCredential?.user_image ? (
                <img src={`${IMAGE_BASE}/users/${userCredential.user_image}`} alt="" className="w-full h-full object-cover" />
              ) : (
                userCredential?.first_name?.charAt(0) || 'U'
              )}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-[0.7rem] font-bold text-gray-900 truncate">{userCredential?.first_name} {userCredential?.last_name}</p>
             <p className="text-[0.6rem] text-gray-500 font-medium truncate">@{userCredential?.login_role.toLowerCase()}</p>
           </div>
           <button 
             className="p-2 text-gray-400 hover:text-red-500 transition-colors"
             onClick={async () => {
               const result = await logoutUser();
               setUserCredential(null);
               showFlashMessage(result.status, result.message);
               if(result.status === "success") return navigate('/login');
             }}
             title="Logout"
           >
             <IoLogOut className="text-xl" />
           </button>
        </div>

        {/* Theme select hidden for clean look, but toggleable if needed */}
        <select className="hidden" value={theme} onChange={(e) => setTheme(e.target.value)}>
           <option value="light">Light</option>
        </select>
      </div>
    </nav>
  )
}

export default Nav