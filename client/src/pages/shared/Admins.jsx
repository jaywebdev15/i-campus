import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api'
import AdminsList from '../../components/admin/AdminsList'
import AdminModal from '../../components/admin/AdminModal'
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header'
// import { AuthContext } from '../../context/AuthContext'

const Admins = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  // const { userCredential } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1, 
    lastPage: "", 
    total: "", 
  });
  const [getAdminId, setGetAdminId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Clear selection when changing page or filters
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
  }, [page, category, subCategory, searchTerm]);

  // Sorting State
  const [sortBy, setSortBy] = useState("admin_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const [adminData, setAdminData] = useState({
    admin_id:             "", 
    admin_image:          "", 
    first_name:           "", 
    middle_name:          "", 
    last_name:            "", 
    gender:               "", 
    civil_status:         "",
    date_of_birth:        "", 
    contact_number:       "", 
    email_address:        "", 
    house_number:         "", 
    street:               "", 
    barangay:             "", 
    town:                 "", 
    province:             "", 
  });

  const clearFields = () => {
    return setAdminData({
    admin_id:             "", 
    admin_image:          "", 
    first_name:           "", 
    middle_name:          "", 
    last_name:            "", 
    gender:               "", 
    civil_status:         "",
    date_of_birth:        "", 
    contact_number:       "", 
    email_address:        "", 
    house_number:         "", 
    street:               "", 
    barangay:             "", 
    town:                 "", 
    province:             "", 
  });
  }

  const categoryTypes = {
    Gender:           [ "Male", "Female" ], 
    Civil_Status:     [ "Single", "Married", "Widow" ]
  };  
  
  let subOptions = [];
  if (category) {
    const selected = categoryTypes[category];
    if (Array.isArray(selected)) {
      subOptions = selected;
    } else if (typeof selected === "object") {
      subOptions = Object.keys(selected);
    }
  }


  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const  response = await fetch(`${API_BASE}/database/admins.php`, {
          method: "POST", 
          credentials: "include", 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            action: "searchAdmin", 
            category: category, 
            subCategory: subCategory, 
            searchTerm: searchTerm, 
            page: page, 
            sortBy: sortBy,
            sortOrder: sortOrder
          })
        });
      const data = await response.json()
      setAdmins(data.records);
      setPaginationInfo({
        currentPage: data.current_page, 
        lastPage: data.last_page, 
        total: data.total, 
      });
    } catch (error) {
      console.log("Error in fetching admins", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, category, subCategory, searchTerm, page, sortBy, sortOrder]);

  useEffect(() => { 
      fetchAdmins();
  }, [fetchAdmins]);

  const fetchGetAdmin = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/admins.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getAdmin", 
          admin_id: getAdminId
        })
      });
      const data = await response.json();
      // Map backend fields to frontend state if needed, or just use as is if names match keys
      // Backend returns admin_firstname, frontend state is first_name. I should map them.
      setAdminData({
        admin_id:           data.admin_id,
        admin_image:        data.admin_image,
        first_name:         data.admin_firstname,
        middle_name:        data.admin_middlename,
        last_name:          data.admin_lastname,
        gender:             data.admin_gender,
        civil_status:       data.admin_civil_status,
        date_of_birth:      data.admin_date_of_birth,
        contact_number:     data.admin_contact_number,
        email_address:      data.admin_email_address,
        house_number:       data.admin_house_number,
        street:             data.admin_street,
        barangay:           data.admin_barangay,
        town:               data.admin_town,
        province:           data.admin_province,
        admin_number:       data.admin_number,
        admin_user_code:    data.admin_user_code
      });
    } catch (error) {
      console.log("Error in getting admin", error);
    }
  }, [getAdminId])

  useEffect(() => {
    if(getAdminId) {
      fetchGetAdmin();
    }
  }, [getAdminId, fetchGetAdmin]);

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
                setActiveNav={setActiveNav} />
        
        <div className="flex-1 overflow-hidden p-4 lg:p-10">
          <div className="w-full h-full bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 relative flex flex-col">
            <AdminsList admins={admins} 
                        setModal={setModal} 
                        setGetAdminId={setGetAdminId} 
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
                        fetchAdmins={fetchAdmins} 
                        activeNav={activeNav} 
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        selectionMode={selectionMode}
                        setSelectionMode={setSelectionMode}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        handleSort={handleSort} />
          </div>
        </div>
      </section>
      <AdminModal modal={modal} 
                    setModal={setModal} 
                    adminData={adminData} 
                    setAdminData={setAdminData} 
                    fetchAdmins={fetchAdmins} 
                    setGetAdminId={setGetAdminId} 
                    clearFields={clearFields} />
    </main>
  )
}

export default Admins
