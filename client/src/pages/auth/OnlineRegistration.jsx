import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { publicApi } from '../../scripts/public_api';
import { BiChevronRight, BiChevronLeft, BiSend, BiUser, BiMapPin, BiGroup, BiCheckCircle } from "react-icons/bi";
import { IMAGE_BASE } from '../../config/api';

const OnlineRegistration = () => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? { showFlashMessage: () => {} }
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [studentNum, setStudentNum] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    contact_number: "",
    email_address: "",
    guardian_name: "",
    guardian_number: "",
    house_number: "",
    street_purok: "",
    barangay: "",
    town: "",
    province: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await publicApi("registerStudent", formData);
    showFlashMessage(result.status, result.message);

    if (result.status === "success") {
      setStudentNum(result.student_number);
      setRegistered(true);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="animate-fade-in-up space-y-8 py-4">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Welcome to Registration</h3>
              <p className="text-slate-500">Please select your current status to continue.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-3xl group-hover:scale-110 transition-transform">
                  <BiUser />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">I am a New Student</h4>
                  <p className="text-slate-500 text-sm">Create a new student record and get your ID.</p>
                </div>
                <BiChevronRight className="ml-auto text-2xl text-slate-300 group-hover:text-blue-500" />
              </button>

              <button 
                type="button"
                onClick={() => navigate('/online-enrollment')}
                className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all text-left flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-3xl group-hover:scale-110 transition-transform">
                  <BiGroup />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">I already have a Student ID</h4>
                  <p className="text-slate-500 text-sm">Proceed directly to secure your enrollment.</p>
                </div>
                <BiChevronRight className="ml-auto text-2xl text-slate-300 group-hover:text-green-500" />
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <div className="p-2 bg-blue-100 rounded-lg"><BiUser className="text-2xl" /></div>
              <h3 className="text-xl font-bold">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField id="first_name" label="First Name" value={formData.first_name} onChange={handleChange} required />
              <InputField id="middle_name" label="Middle Name (Optional)" value={formData.middle_name} onChange={handleChange} />
              <InputField id="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} required />
              
              <div className="relative group">
                <select 
                  id='gender' 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <label className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-gray-500">Gender</label>
              </div>
              
              <InputField id="date_of_birth" label="Date of Birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
            </div>
            
            <div className="flex justify-between pt-4">
              <button 
                type="button" 
                onClick={prevStep}
                className="px-8 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <BiChevronLeft className="text-xl" /> Previous
              </button>
              <button 
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Next Step <BiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <div className="p-2 bg-blue-100 rounded-lg"><BiMapPin className="text-2xl" /></div>
              <h3 className="text-xl font-bold">Contact & Address</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField id="email_address" label="Email Address" type="email" value={formData.email_address} onChange={handleChange} required />
              <InputField id="contact_number" label="Phone Number" value={formData.contact_number} onChange={handleChange} required />
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField id="house_number" label="House #" value={formData.house_number} onChange={handleChange} />
                <InputField id="street_purok" label="Street / Purok" value={formData.street_purok} onChange={handleChange} required />
                <InputField id="barangay" label="Barangay" value={formData.barangay} onChange={handleChange} required />
              </div>
              
              <InputField id="town" label="Town / City" value={formData.town} onChange={handleChange} required />
              <InputField id="province" label="Province" value={formData.province} onChange={handleChange} required />
            </div>

            <div className="flex justify-between pt-4">
              <button 
                type="button" 
                onClick={prevStep}
                className="px-8 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <BiChevronLeft className="text-xl" /> Previous
              </button>
              <button 
                type="button" 
                onClick={nextStep}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Next Step <BiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <div className="p-2 bg-blue-100 rounded-lg"><BiGroup className="text-2xl" /></div>
              <h3 className="text-xl font-bold">Guardian Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField id="guardian_name" label="Guardian Name" value={formData.guardian_name} onChange={handleChange} required />
              <InputField id="guardian_number" label="Guardian Phone #" value={formData.guardian_number} onChange={handleChange} required />
            </div>

            <div className="flex justify-between pt-4">
              <button 
                type="button" 
                onClick={prevStep}
                className="px-8 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <BiChevronLeft className="text-xl" /> Previous
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Submit Registration <BiSend className="text-xl" />
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans"
         style={{ backgroundImage: "radial-gradient(at 0% 0%, hsla(210,100%,95%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,100%,95%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(240,100%,95%,1) 0, transparent 50%)" }}>
      
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Progress Sidebar */}
        <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col">
          <div className="mb-12 flex items-center gap-3">
             <img src={`${IMAGE_BASE}/logo/i-campus.png`} alt="Logo" className="h-10 w-auto" />
             <span className="text-xl font-bold">i-Campus</span>
          </div>

          <div className="space-y-8 flex-grow">
            <StepIndicator currentStep={step} stepNumber={1} title="Personal Info" description="Basic details about you" />
            <StepIndicator currentStep={step} stepNumber={2} title="Contact Info" description="How we can reach you" />
            <StepIndicator currentStep={step} stepNumber={3} title="Guardian Info" description="Emergency contact" />
          </div>

          <div className="mt-auto pt-10 border-t border-slate-800 opacity-60 text-sm">
             <p>Needs help? Contact admissions@icampus.edu</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-grow p-8 md:p-12">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800">Student Registration</h2>
            <p className="text-slate-500 mt-2">Fill in your information to join our academic community.</p>
          </div>

          {registered ? (
            <div className="animate-fade-in-up space-y-8 py-10 text-center">
               <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-4xl shadow-lg shadow-green-100">
                    <BiCheckCircle />
                  </div>
               </div>
               <h3 className="text-2xl font-bold text-slate-800">Registration Successful!</h3>
               <p className="text-slate-500 px-6">
                  Thank you for registering. Your student number is <span className="font-mono bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-lg">{studentNum}</span>. 
                  A copy of your registration details has been sent to your email.
               </p>
               
               <div className="flex flex-col gap-4 mt-10">
                  <button 
                    onClick={() => navigate('/online-enrollment', { state: { student_number: studentNum } })}
                    className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-600 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Enrollment <BiChevronRight className="text-2xl" />
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
                  >
                    Go Back Home
                  </button>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {renderStep()}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ id, label, type = "text", value, onChange, required = false }) => (
  <div className="relative group">
    <input 
      type={type} 
      id={id} 
      value={value} 
      onChange={onChange}
      placeholder=" "
      required={required}
      className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-transparent text-gray-700"
    />
    <label 
      htmlFor={id} 
      className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all duration-300 
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500 peer-focus:bg-white"
    >
      {label}
    </label>
  </div>
);

const StepIndicator = ({ currentStep, stepNumber, title, description }) => {
  const isActive = currentStep === stepNumber;
  const isCompleted = currentStep > stepNumber;

  return (
    <div className={`flex gap-4 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 
                      ${isActive ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 
                        isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-700 text-slate-500'}`}>
        {isCompleted ? "✓" : stepNumber}
      </div>
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export default OnlineRegistration;
