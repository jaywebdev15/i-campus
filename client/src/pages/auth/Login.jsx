import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { loginUser } from '../../scripts/users';
import { AuthContext } from '../../context/AuthContext';
import { BiEnvelope, BiShow, BiHide, BiRightArrowAlt } from "react-icons/bi";
import { IMAGE_BASE } from '../../config/api';

const Login = () => {
  const { userCredential, setUserCredential } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (userCredential && userCredential.login_status) {
      navigate('/profile');
    }
  }, [userCredential, navigate]);

  return (
    <div className="min-h-dvh flex justify-center items-center p-4 relative overflow-hidden font-sans"
          style={{
            backgroundImage: "url('/atec_bg.avif')", 
            backgroundRepeat: 'no-repeat', 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
      
      {/* Dark Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="z-10 w-full max-w-4xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Left Side: Welcome Message & Branding (Glass Effect) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-md text-white relative">
          <div className={`absolute top-0 left-0 w-full h-full bg-center bg-no-repeat opacity-10 blur-sm transform scale-150 pointer-events-none`} style={{ backgroundImage: `url('${IMAGE_BASE}/logo/i-campus.png')` }}></div>
          
          <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="i-Campus Logo" className="w-24 h-24 mb-6 object-contain drop-shadow-lg relative z-10" />
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md relative z-10">
            Welcome Back!
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90 relative z-10">
            Access your i-Campus Student Portal
          </p>
        </div>

        {/* Right Side: Login Form (Clean White/Glass) */}
        <div className="w-full md:w-1/2 bg-white/95 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
            <p className="text-gray-500">Enter your details to sign in to your account.</p>
          </div>

          <form className="flex flex-col gap-6">

            <div className="relative group">
              <input 
                type="text" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <BiEnvelope className="absolute right-4 top-3.5 text-gray-400 peer-focus:text-blue-600 transition-colors" />
            </div>

            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex justify-end">
              <span className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200">
                Forgot Password?
              </span>
            </div>

            <button 
              className="w-full py-3.5 rounded-lg text-white font-semibold text-lg bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2 group"
              onClick={async (e) => {
                e.preventDefault();
                if (!email || !password) {
                  showFlashMessage("failed", "Please enter both email and password.");
                  return;
                }

                const result = await loginUser(email, password);
                showFlashMessage(result.status, result.message);

                if (result.status === "failed") return;
                
                setUserCredential({
                  ...result.data,
                  login_status: true
                });

              }}
            >
              <span>Sign In</span>
              <BiRightArrowAlt className="text-xl group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Don't have an account yet?</p>
            <span 
              className="mt-1 inline-block font-semibold text-blue-600 hover:text-blue-800 cursor-pointer border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              onClick={() => navigate('/register')}
            >
              Create an Account
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login;
