import Pagination from '../shared/Pagination';
import { API_BASE } from '../../config/api';
import FilterAndSearch from '../shared/FilterAndSearch';
import Command from '../shared/Command';
import { useContext } from 'react';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { FaInfoCircle, FaEdit, FaRegTrashAlt } from "react-icons/fa";

const UserList = ({ users = [], setModal, setGetUserId, page, setPage, paginationInfo, loading, category, setCategory, searchTerm, setSearchTerm, categoryTypes, subCategory, setSubCategory, subOptions, fetchUsers, activeNav }) => {
  const context = useContext(FlashMessageContext);
  const showFlashMessage = context?.showFlashMessage || (() => {});
  const { total } = paginationInfo;

  const handleExport = async (format) => {
      // Assuming generic export works or needs adaptation. For now, using similar endpoint.
      const response = await fetch(`${API_BASE}/database/export.php?format=${format}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(users)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "users.csv" : "users.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFlashMessage("success", "File exported successfully");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "users"); 

    const response = await fetch(`${API_BASE}/database/import.php`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    showFlashMessage(result.status, result.message);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if(!confirm("Are you sure you want to delete this user?")) return;
    
    try {
        const response = await fetch(`${API_BASE}/database/users.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteUser", user_id: id })
        });
        const result = await response.json();
        showFlashMessage(result.status, result.message);
        fetchUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
        showFlashMessage("failed", "Error deleting user");
    }
  };


  return (
    <div className="flex flex-col h-full bg-white">
      {/* List Header: Title & Actions */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Users List ({total})</h2>
             <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage system users and roles</p>
          </div>
           <div className="flex items-center gap-2">
               <Command  handleExport={handleExport} 
                         handleImport={handleImport} 
                         setModal={setModal} 
                         activeNav={activeNav}
                         buttonText="Add User" />
           </div>
      </div>

      {/* Filter */}
      <div className="px-8 pb-4 flex flex-col gap-4">
        <FilterAndSearch category={category} 
                          setCategory={setCategory} 
                          categoryTypes={categoryTypes} 
                          searchTerm={searchTerm} 
                          setSearchTerm={setSearchTerm} 
                          subCategory={subCategory} 
                          setSubCategory={setSubCategory} 
                          subOptions={subOptions}  />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide flex flex-col px-8">
          <table className='whitespace-nowrap min-w-full text-xs text-left'>
            <thead className='sticky top-0 bg-white border-b border-gray-100 z-40'>
              <tr className="bg-white">
                <th className='sticky left-0 top-0 z-50 bg-white p-4 font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50 text-center min-w-[120px]'>Action</th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>Name</th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>User Code</th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>Email Address</th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>Role</th>
                <th className='p-4 font-bold text-gray-400 uppercase tracking-widest text-[0.65rem]'>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 border-b border-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="6" className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Loading records...</span>
                      </div>
                  </td>
                </tr>
              ) : 
                users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={index} 
                        className='group hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-50 cursor-pointer'>
                        <td className='sticky left-0 z-30 py-3 px-4 group-hover:bg-blue-50/30 border-r border-gray-50 transition-colors bg-white text-center' onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center justify-center gap-3">
                              <button className='text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform' 
                                  onClick={() => {
                                  setGetUserId(user.user_id);
                                  setModal("info");
                              }}>
                                <FaInfoCircle className="text-lg" />
                              </button>
                              <button className='text-green-500 hover:text-green-700 hover:scale-110 transition-transform' 
                                  onClick={() => {
                                    setGetUserId(user.user_id);
                                    setModal("edit");
                              }}>
                                <FaEdit className="text-lg" />
                              </button>
                              <button className='text-red-500 hover:text-red-700 hover:scale-110 transition-transform'
                                 onClick={() => deleteUser(user.user_id)}>
                                <FaRegTrashAlt className="text-lg" />
                              </button>
                           </div>
                        </td>
                        <td className='py-3 px-4 text-gray-600 font-bold text-[0.75rem] uppercase'>{user.full_name || "N/A"}</td>
                        <td className='py-3 px-4 text-gray-900 font-bold text-[0.8rem]'>{user.user_code}</td>
                        <td className='py-3 px-4 text-gray-700 font-bold text-[0.75rem]'>{user.user_email}</td>
                        <td className='py-3 px-4 text-gray-600 text-[0.75rem]'>{user.user_role}</td>
                        <td className='py-3 px-4'>
                            <span className={`px-2 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${user.user_status === 'Active' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                                {user.user_status}
                            </span>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className='p-12 text-center'>
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-3xl text-gray-200 font-black uppercase tracking-tighter">Empty</span>
                         <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">No user records found</span>
                      </div>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>

       {/* Pagination Footer */}
      <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20">
         <Pagination page={page} 
                  setPage={setPage} 
                  paginationInfo={paginationInfo} />
      </div>
    </div>
  )
}

export default UserList
