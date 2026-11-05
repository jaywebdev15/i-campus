import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { BiMenu, BiChevronRight } from 'react-icons/bi';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE } from '../../config/api';

const Header = ({ setNavOpen, activeNav, setActiveNav }) => {
  const navigate = useNavigate();
  const { userCredential } = useContext(AuthContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <header className='sticky top-0 flex h-16 items-center justify-between py-3 px-6 gap-4 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100'>
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
        <span className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
        <BiChevronRight className="text-gray-300 text-lg" />
        <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
           {activeNav}
        </div>
      </div>

      <div className="flex-1 flex gap-6 justify-end items-center">
        
        {/* Real-time Clock */}
        <div className="hidden sm:flex flex-col items-end border-r border-gray-100 pr-6 mr-2">
           <span className="text-[0.75rem] font-black text-gray-900 leading-tight tracking-tight uppercase">{formatTime(time)}</span>
           <span className="text-[0.55rem] text-gray-400 font-bold uppercase tracking-widest leading-none">{formatDate(time)}</span>
        </div>

        {/* Profile User */}
        <div className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                navigate('/profile');
                setActiveNav("Profile");
              }}>
          <div className="flex flex-col items-end">
            <p className="text-[0.65rem] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{userCredential?.first_name} {userCredential?.last_name}</p>
            <p className="text-[0.55rem] text-gray-400 font-medium">@{userCredential?.login_role.toLowerCase()}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:ring-4 ring-blue-50 transition-all overflow-hidden shadow-sm">
             {userCredential?.user_image ? (
                <img src={`${IMAGE_BASE}/users/${userCredential.user_image}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-xs">{userCredential?.first_name?.charAt(0)}</span>
              )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex justify-center items-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer lg:hidden transition-colors"
              onClick={() => setNavOpen(true)}>
          <BiMenu className="text-2xl" />
        </div>
      </div>
    </header>
  )
}

export default Header