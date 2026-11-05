import React, { useCallback, useEffect, useState } from 'react'
import UserList from '../../components/user/UserList'
import { API_BASE } from '../../config/api'
import UserModal from '../../components/user/UserModal'
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header'

const Users = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1, 
    lastPage: 1, 
    total: 0, 
  });
  const [getUserId, setGetUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [userData, setUserData] = useState({
    user_id:        "", 
    user_code:      "", 
    user_email:     "", 
    user_role:      "", 
    user_status:    "",
    password:       "" // For add/change
  });

  const clearFields = () => {
    return setUserData({
        user_id:        "", 
        user_code:      "", 
        user_email:     "", 
        user_role:      "", 
        user_status:    "",
        password:       ""
  });
  }

  const categoryTypes = {
    Role:           [ "Admin", "Registrar", "Teacher", "Student" ], 
    Status:         [ "Pending", "Active", "Inactive" ]
  };  
  
  let subOptions = [];
  if (category) {
    const selected = categoryTypes[category];
    if (Array.isArray(selected)) {
      subOptions = selected;
    }
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const  response = await fetch(`${API_BASE}/database/users.php`, {
          method: "POST", 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            action: "searchUser", 
            category: category, 
            subCategory: subCategory, 
            searchTerm: searchTerm, 
            page: page, 
          })
        });
      const data = await response.json()
      setUsers(data.records || []);
      setPaginationInfo({
        currentPage: data.current_page || 1, 
        lastPage: data.last_page || 1, 
        total: data.total || 0, 
      });
    } catch (error) {
      console.log("Error in fetching users", error);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, searchTerm, page]);

  useEffect(() => { 
      fetchUsers();
  }, [fetchUsers]);

  const fetchGetUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/users.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getUser", 
          userId: getUserId
        })
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.log("Error in getting user", error);
    }
  }, [getUserId])

  useEffect(() => {
    setActiveNav("Users");
    if(getUserId) {
      fetchGetUser();
    }
  }, [getUserId, fetchGetUser, setActiveNav]);

  return (
    <main className='h-dvh flex flex-col bg-slate-50 overflow-hidden 
                    lg:flex-row'>
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-full relative overflow-hidden
                          ${modal !== "" 
                            ? 'blur-md pointer-events-none' 
                            : 'pointer-events-auto' 
                          }`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} />
        
        <div className="flex-1 overflow-hidden p-4 lg:p-10">
          <div className="w-full h-full bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 relative flex flex-col">
            <UserList     users={users} 
                          setModal={setModal} 
                          setGetUserId={setGetUserId} 
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
                          fetchUsers={fetchUsers} 
                          activeNav={activeNav} />
          </div>
        </div>
      </section>
      <UserModal    modal={modal} 
                    setModal={setModal} 
                    userData={userData} 
                    setUserData={setUserData} 
                    fetchUsers={fetchUsers} 
                    setGetUserId={setGetUserId} 
                    clearFields={clearFields} />
    </main>
  )
}

export default Users
