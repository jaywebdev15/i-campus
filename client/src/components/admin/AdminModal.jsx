import React, { useContext, useState } from 'react'
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { insertNewAdmins } from '../../scripts/admins';
import { getAge } from '../../scripts/utility'
import { BiX } from 'react-icons/bi';
import { IMAGE_BASE } from '../../config/api';

const AdminModal = ({ modal, setModal, adminData, setAdminData, fetchAdmins, setGetAdminId, clearFields }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const imageView = imagePreview 
                    ? imagePreview 
                    : (adminData?.admin_image 
                        ? `${IMAGE_BASE}/admins/${adminData.admin_image}` 
                        : `${IMAGE_BASE}/user.jpg` 
                    );

  const handleImageFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if(file) {
      if(imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      const newImagePreview = URL.createObjectURL(file);
      setImagePreview(newImagePreview);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(modal === "info") {
               clearFields();
               setModal("");
               setGetAdminId("");
             }
           }}
      />

      {/* Modal Container */}
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[95%] md:w-[85%] lg:w-[75%] xl:w-[60%] max-h-[90vh]
                      bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                      transition-all duration-300 ease-out
                      ${modal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
            {modal === "info" ? 'Admin Information' : modal === "edit" ? "Update Admin Detail" : "Add New Admin"}
          </h2>
          <button onClick={() => { clearFields(); setModal(""); setGetAdminId(""); }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className="text-3xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Image Section */}
            <div className="md:col-span-4 flex flex-col items-center gap-4">
               <div className="relative group w-40 h-40 rounded-full ring-4 ring-gray-50 overflow-hidden shadow-md">
                 <img src={imageView} alt="Admin" className='w-full h-full object-cover' />
                 {modal !== "info" && (
                    <label htmlFor="image" className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-medium text-sm">
                       Change Photo
                    </label>
                 )}
              </div>
               {modal !== "info" && (
                <div className="text-sm text-gray-500 text-center">
                   Click image to upload
                   <input type="file" id='image' hidden onChange={handleImageFileChange} className='hidden'/>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                 <input type="text" readOnly={modal === "info"} value={adminData.first_name || ""} 
                        onChange={(e) => setAdminData({...adminData, first_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                 <input type="text" readOnly={modal === "info"} value={adminData.last_name || ""} 
                        onChange={(e) => setAdminData({...adminData, last_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle Name</label>
                 <input type="text" readOnly={modal === "info"} value={adminData.middle_name || ""} 
                        onChange={(e) => setAdminData({...adminData, middle_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                 <div className="flex gap-4 items-center h-full px-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <input type="radio" name='gender' value='Male' disabled={modal === "info"} checked={adminData.gender === "Male"} onChange={(e) => setAdminData({...adminData, gender: e.target.value})} className="accent-blue-600"/> Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <input type="radio" name='gender' value='Female' disabled={modal === "info"} checked={adminData.gender === "Female"} onChange={(e) => setAdminData({...adminData, gender: e.target.value})} className="accent-pink-600"/> Female
                    </label>
                 </div>
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Civil Status</label>
                  <select disabled={modal === "info"} value={adminData.civil_status || ""} 
                        onChange={(e) => setAdminData({...adminData, civil_status: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widow">Widow</option>
                  </select>
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                 <input type="date" readOnly={modal === "info"} value={adminData.date_of_birth && adminData.date_of_birth !== "0000-00-00" ? adminData.date_of_birth : ""} 
                        onChange={(e) => setAdminData({...adminData, date_of_birth: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
               </div>
               {modal !== "info" && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
                    <input type="text" readOnly value={adminData.date_of_birth ? getAge(adminData.date_of_birth) : ''} 
                           className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"/>
                 </div>
               )}
            </div>

            {/* Contact Information */}
            <div className="md:col-span-12 border-t border-gray-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-gray-800 mb-3">Contact Information</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Contact Number</label>
                      <input type="text" readOnly={modal === "info"} value={adminData.contact_number || ""} onChange={(e) => setAdminData({...adminData, contact_number: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none disabled:bg-gray-50"/>
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                      <input type="email" readOnly={modal === "info"} value={adminData.email_address || ""} onChange={(e) => setAdminData({...adminData, email_address: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none disabled:bg-gray-50"/>
                  </div>
               </div>
            </div>

            {/* Address */}
            <div className="md:col-span-12 border-t border-gray-100 pt-4 mt-2">
               <h3 className="text-sm font-bold text-gray-800 mb-3">Address</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input placeholder="House No." readOnly={modal === "info"} value={adminData.house_number || ""} onChange={(e) => setAdminData({...adminData, house_number: e.target.value})} className="px-3 py-2 border rounded-lg text-sm outline-none disabled:bg-gray-50"/>
                  <input placeholder="Street" readOnly={modal === "info"} value={adminData.street || ""} onChange={(e) => setAdminData({...adminData, street: e.target.value})} className="px-3 py-2 border rounded-lg text-sm outline-none disabled:bg-gray-50"/>
                  <input placeholder="Barangay" readOnly={modal === "info"} value={adminData.barangay || ""} onChange={(e) => setAdminData({...adminData, barangay: e.target.value})} className="px-3 py-2 border rounded-lg text-sm outline-none disabled:bg-gray-50"/>
                  <input placeholder="Town" readOnly={modal === "info"} value={adminData.town || ""} onChange={(e) => setAdminData({...adminData, town: e.target.value})} className="px-3 py-2 border rounded-lg text-sm outline-none disabled:bg-gray-50"/>
                  <input placeholder="Province" readOnly={modal === "info"} value={adminData.province || ""} onChange={(e) => setAdminData({...adminData, province: e.target.value})} className="px-3 py-2 border rounded-lg text-sm outline-none disabled:bg-gray-50"/>
               </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => { 
                clearFields(); 
                setModal(""); 
                setGetAdminId(""); 
                setImagePreview(null);
                setImageFile(null);
              }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {modal !== "info" && (
            <button onClick={async () => {
                 if (modal === "add") {
                   if( !adminData.first_name || !adminData.last_name ) {
                     showFlashMessage("failed", "Please fill all the fields.");
                     return
                   } else {
                     const result = await insertNewAdmins("insertAdmin", adminData, imageFile);
                     showFlashMessage(result.status, result.message);
                     if(result.status !== "success") return;
                     clearFields();
                     setGetAdminId("");
                   }
                 } else {
                     const result = await insertNewAdmins("updateAdmin", adminData, imageFile);
                     showFlashMessage(result.status, result.message);
                     if(result.status !== "success") return;
                     clearFields();
                     setGetAdminId("");
                     setModal("");
                 }
                 await fetchAdmins();
                 setImagePreview(null);
                 setImageFile(null);
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {modal === "add" ? 'Save Admin' : 'Update Info'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default AdminModal
