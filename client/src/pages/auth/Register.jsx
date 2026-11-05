import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { API_BASE, IMAGE_BASE } from '../../config/api';
import { insertNewUser } from '../../scripts/users';
import { BiChevronDown, BiShow, BiHide, BiUserPlus } from "react-icons/bi";

const Register = () => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const roles = [ "Admin", "Registrar", "Teacher", "Student" ];

  const [userData, setUserData] = useState({
    userRole:         "", 
    email:            "",
    password:         "",
    confirmPassword:  "",
  });


  return (
    <div className="min-h-dvh flex justify-center items-center p-4 relative overflow-hidden font-sans"
          style={{
            backgroundImage: "url('/atec_bg.avif')", 
            backgroundRepeat: 'no-repeat', 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="z-10 w-full max-w-5xl flex flex-col md:flex-row-reverse rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Right Side: Welcome Message (Glass Effect) - Reversed for visual interest */}
        <div className="w-full md:w-5/12 p-10 flex flex-col justify-center items-center text-center bg-gradient-to-bl from-purple-900/60 to-blue-900/60 backdrop-blur-md text-white relative">
          <div className={`absolute top-0 left-0 w-full h-full bg-center bg-no-repeat opacity-10 blur-sm transform scale-150 pointer-events-none`} style={{ backgroundImage: `url('${IMAGE_BASE}/logo/i-campus.png')` }}></div>
          
          <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="i-Campus Logo" className="w-24 h-24 mb-6 object-contain drop-shadow-lg relative z-10" />
          
          <h1 className="text-3xl md:text-3xl font-bold mb-4 drop-shadow-md relative z-10">
            Join i-Campus
          </h1>
          <p className="text-lg font-light opacity-90 relative z-10 mb-8">
            Create your account to start managing your academic journey.
          </p>

          <div className="relative z-10 text-sm opacity-80 border-t border-white/20 pt-6 w-full">
            <p>Already a member?</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-3 px-6 py-2 rounded-full border border-white/40 hover:bg-white/10 transition-colors duration-300"
            >
              Sign In Instead
            </button>
          </div>
        </div>

        {/* Left Side: Register Form (Clean White/Glass) */}
        <div className="w-full md:w-7/12 bg-white/95 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center">
          
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-500">Please fill in the details below.</p>
          </div>

          <form className="flex flex-col gap-5">

            {/* Role Select */}
            <div className="relative group">
              <select 
                id='userRole' 
                value={userData.userRole || ""} 
                onChange={(e) => setUserData({...userData, userRole: e.target.value})} 
                className="peer w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 appearance-none cursor-pointer"
              >
                <option value="" disabled className="text-gray-400">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <label 
                htmlFor="userRole" 
                className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-blue-600 transition-all duration-300"
              >
                User Role
              </label>
              <BiChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <input 
                type="text" 
                id="email" 
                value={userData.email || ""} 
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                placeholder=" "
                className="peer w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-transparent text-gray-700"
              />
              <label 
                htmlFor="email" 
                className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all duration-300 
                          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                          peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white"
              >
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="relative group w-full">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={userData.password || ""} 
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  placeholder=" "
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-transparent text-gray-700"
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all duration-300 
                            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white"
                >
                  Password
                </label>
                <div 
                  className="absolute right-4 top-3.5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors z-20"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <BiShow /> : <BiHide />}
                </div>
              </div>

              <div className="relative group w-full">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  id="confirmPassword" 
                  value={userData.confirmPassword || ""} 
                  onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                  placeholder=" "
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-transparent text-gray-700"
                />
                <label 
                  htmlFor="confirmPassword" 
                  className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all duration-300 
                            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white"
                >
                  Confirm Password
                </label>
                <div 
                  className="absolute right-4 top-3.5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors z-20"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <BiShow /> : <BiHide />}
                </div>
              </div>
            </div>

            <button 
              className="w-full mt-4 py-3.5 rounded-lg text-white font-semibold text-lg bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2 group"
              onClick={async (e) => {
                e.preventDefault();
                if (!userData.userRole || !userData.email || !userData.password || !userData.confirmPassword) {
                  showFlashMessage("failed", "Please fill in all fields.");
                  return;
                } else if(userData.password !== userData.confirmPassword) {
                  showFlashMessage("failed", "Passwords do not match.");
                  return;
                }

                const result = await insertNewUser(userData);
                showFlashMessage(result.status, result.message);

                if (result.status === "failed") return;

                setUserData({
                  userRole:         "", 
                  email:            "", 
                  password:         "", 
                  confirmPassword:  "", 
                })
              }}
            >
              <span>Create Account</span>
              <BiUserPlus className="text-xl group-hover:scale-110 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm md:hidden">
            <p className="text-gray-500">Have an account already?</p>
            <span 
              className="mt-1 font-semibold text-blue-600 cursor-pointer" 
              onClick={() => navigate('/login')}>Sign In</span>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Register
