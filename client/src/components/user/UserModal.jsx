import React, { useContext } from 'react'
import { BiX } from 'react-icons/bi';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertNewUsers } from '../../scripts/users';

const UserModal = ({ modal, setModal, userData, setUserData, fetchUsers, setGetUserId, clearFields }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(modal === "info") {
               clearFields();
               setModal("");
               setGetUserId("");
             }
           }}
      />

      {/* Modal Container */}
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[95%] md:w-[60%] lg:w-[40%] 
                      bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                      transition-all duration-300 ease-out
                      ${modal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
            {modal === "info" ? 'User Information' : modal === "edit" ? "Update User Detail" : "Add New User"}
          </h2>
          <button onClick={() => { clearFields(); setModal(""); setGetUserId(""); }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className="text-3xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <div className="flex flex-col gap-4">
                
                {/* User Code - Read Only */}
                {modal !== "add" && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User Code</label>
                        <input type="text" readOnly value={userData.user_code || ""} 
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"/>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                 <input type="email" readOnly={modal === "info"} value={userData.email || userData.user_email || ""} 
                        onChange={(e) => setUserData({...userData, email: e.target.value, user_email: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>

               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                 <select disabled={modal === "info"} value={userData.user_role || ""} 
                        onChange={(e) => setUserData({...userData, user_role: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50">
                    <option value="" disabled>Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Student">Student</option>
                 </select>
               </div>

               {modal !== "add" && (
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                     <select disabled={modal === "info"} value={userData.user_status || ""} 
                            onChange={(e) => setUserData({...userData, user_status: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50">
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                   </div>
               )}

               {modal === "add" && (
                   <>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                        <input type="password" value={userData.password || ""} 
                                onChange={(e) => setUserData({...userData, password: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"/>
                    </div>
                   </>
               )}

            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => { 
                clearFields(); 
                setModal(""); 
                setGetUserId(""); 
              }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {modal !== "info" && (
            <button onClick={async () => {
                 if (modal === "add") {
                   if( !userData.email || !userData.user_role || !userData.password ) {
                     showFlashMessage("failed", "Please fill all fields.");
                     return
                   }
                   const result = await insertNewUsers("insertUser", userData);
                   showFlashMessage(result.status, result.message);
                   if(result.status !== "success") return;
                   
                 } else {
                    // Update
                     const result = await insertNewUsers("updateUser", { 
                         user_id: userData.user_id,
                         email: userData.user_email,
                         user_role: userData.user_role,
                         user_status: userData.user_status
                     });
                     showFlashMessage(result.status, result.message);
                     if(result.status !== "success") return;
                 }
                 await fetchUsers();
                 clearFields();
                 setGetUserId("");
                 setModal("");
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {modal === "add" ? 'Save User' : 'Update User'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default UserModal
