import React, { useContext, useState } from 'react'
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { changePassword } from '../../scripts/users';
import { AuthContext } from '../../context/AuthContext';
import { BiX, BiShow, BiHide } from "react-icons/bi";

const ChangePassword = ({ modal, setModal }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const { showFlashMessage } = useContext(FlashMessageContext);
  const { userCredential } = useContext(AuthContext);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${modal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white w-[90%] max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${modal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between">
          <h2 className='text-xl font-bold text-white tracking-wide font-serif'>Change Password</h2>
          <button onClick={() => setModal(false)} className="text-white/80 hover:text-white transition-colors">
            <BiX className="text-2xl" />
          </button>
        </div>

        {/* content */}
        <div className="p-8 flex flex-col gap-6">
           <div className="relative group">
              <input type={showOld ? "text" : "password"} 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder=" "
                      className='peer w-full border-b-2 border-gray-300 py-2 pr-8 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-transparent'/>
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Old Password</label>
              <button 
                className="absolute right-0 top-2 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <BiShow className="text-xl" /> : <BiHide className="text-xl" />}
              </button>
           </div>
           
           <div className="relative group">
              <input type={showNew ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      className='peer w-full border-b-2 border-gray-300 py-2 pr-8 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-transparent'/>
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">New Password</label>
              <button 
                className="absolute right-0 top-2 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowNew(!showNew)}
              >
                 {showNew ? <BiShow className="text-xl" /> : <BiHide className="text-xl" />}
              </button>
           </div>

           <div className="relative group">
              <input type={showConfirm ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=" "
                      className='peer w-full border-b-2 border-gray-300 py-2 pr-8 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-transparent'/>
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Confirm Password</label>
               <button 
                className="absolute right-0 top-2 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                 {showConfirm ? <BiShow className="text-xl" /> : <BiHide className="text-xl" />}
              </button>
           </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button className='px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors' 
                  onClick={() => {
                    setModal(false);
                    setOldPassword("");
                    setPassword("");
                    setConfirmPassword("");
                  }}>
            Cancel
          </button>
          
          <button className='px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform active:scale-95 transition-all' 
                  onClick={async () => {
                    if(oldPassword === "" || password === "" || confirmPassword === "") {
                      return showFlashMessage("failed", "Please fill all the fields.");
                    }
                    
                    if(password !== confirmPassword) {
                      return showFlashMessage("failed", "Password not matched.");
                    }

                    const result = await changePassword(userCredential?.login_code, oldPassword, password, confirmPassword);
                    if(result.status === "failed") {
                      return showFlashMessage(result.status, result.message);
                    } else {
                       showFlashMessage("success", "Password updated successfully.");
                       setModal(false);
                       setOldPassword("");
                       setPassword("");
                       setConfirmPassword("");
                    }
                  }}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  )
}

export default ChangePassword