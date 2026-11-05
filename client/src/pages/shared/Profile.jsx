import React, { useContext, useEffect, useState } from 'react'
import Header from '../../components/shared/Header'
import Nav from '../../components/shared/Nav'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import TeacherProfileInfo from '../../components/profile/TeacherProfileInfo'
import StudentProfileInfo from '../../components/profile/StudentProfileInfo'
import AdminProfileInfo from '../../components/profile/AdminProfileInfo'

const Profile = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => { 
  const { userCredential } = useContext(AuthContext);
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  
  useEffect(() => {
    if(!userCredential || !userCredential?.login_status) {
      navigate("/login");
    }
  }, [userCredential, navigate]);

  return (
    <main className='h-screen flex bg-gray-200 overflow-hidden'>
      <Nav  navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className='flex flex-col w-full 
                          lg:flex-1 min-h-0 overflow-hidden'>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                setActiveNav={setActiveNav} />
        {userCredential.login_role === "Admin" 
          ? (
            <AdminProfileInfo modal={modal} 
                              setModal={setModal} />
          ) : userCredential?.login_role === "Teacher" 
            ? (
              <TeacherProfileInfo modal={modal} 
                                setModal={setModal} />
            ) : (
              <StudentProfileInfo modal={modal} 
                                setModal={setModal} />
            )
        }
      </section>
    </main>
  )
}

export default Profile