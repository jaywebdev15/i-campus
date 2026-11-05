import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { publicApi } from '../../scripts/public_api';
import { BiLayer, BiBookOpen, BiCalendar, BiCheckCircle, BiSend, BiHome } from "react-icons/bi";

const OnlineEnrollment = () => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? { showFlashMessage: () => {} }
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);

  const [formData, setFormData] = useState({
    student_number: location.state?.student_number || "",
    education_level: "",
    course_code: "",
    year_level: "",
    semester: "",
    school_year: "2025-2026" // Defaulting to next SY
  });

  useEffect(() => {
    const fetchData = async () => {
      const result = await publicApi("getDropdownData");
      if (result.status === "success") {
        setCourses(result.courses);
        setEducationLevels(result.levels);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Reset course when education level changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, course_code: "" }));
  }, [formData.education_level]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await publicApi("enrollStudent", formData);
    showFlashMessage(result.status, result.message);

    if (result.status === "success") {
      // Clear data or redirect
      setTimeout(() => navigate('/'), 3000);
    }
  };

  const filteredCourses = courses.filter(c => c.category === formData.education_level);

  const getYearLevels = () => {
    if (formData.education_level === "College") return ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    if (formData.education_level === "Senior High") return ["Grade 11", "Grade 12"];
    if (formData.education_level === "TESDA") return ["NC I", "NC II", "NC III", "NC IV"];
    return [];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans"
         style={{ backgroundImage: "radial-gradient(at 100% 100%, hsla(210,100%,92%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(240,100%,92%,1) 0, transparent 50%)" }}>
      
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 animate-fade-in-up">
        
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
                <BiLayer />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800">Online Enrollment</h2>
                <p className="text-slate-500">Secure your spot for the upcoming semester.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="text-blue-600 mt-1"><BiCheckCircle className="text-xl" /></div>
            <div>
              <p className="text-blue-900 font-bold">Registration Step Completed</p>
              <p className="text-blue-700 text-sm opacity-80">Your student number: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">{formData.student_number || "Awaiting registration"}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <DropdownField 
              id="education_level" 
              label="Education Level" 
              value={formData.education_level} 
              onChange={handleChange} 
              options={educationLevels} 
              icon={<BiLayer />}
              required
            />

            <DropdownField 
              id="course_code" 
              label="Course / Program" 
              value={formData.course_code} 
              onChange={handleChange} 
              options={filteredCourses.map(c => ({ value: c.course_code, label: c.course_title }))} 
              icon={<BiBookOpen />}
              disabled={!formData.education_level}
              required
            />

            <DropdownField 
              id="year_level" 
              label="Year Level" 
              value={formData.year_level} 
              onChange={handleChange} 
              options={getYearLevels()} 
              icon={<BiLayer />}
              disabled={!formData.education_level}
              required
            />

            <DropdownField 
              id="semester" 
              label="Semester" 
              value={formData.semester} 
              onChange={handleChange} 
              options={["1st Semester", "2nd Semester"]} 
              icon={<BiCalendar />}
              required
            />

            <InputField 
                id="school_year" 
                label="School Year" 
                value={formData.school_year} 
                onChange={handleChange} 
                required 
            />

            <InputField 
                id="student_number" 
                label="Student Number (Verification)" 
                value={formData.student_number} 
                onChange={handleChange} 
                required 
            />

          </div>

          <div className="pt-6 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-600 hover:shadow-blue-300 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Confirm Enrollment <BiSend />
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <BiHome /> Skip for Now
            </button>
            <p className="text-center text-slate-400 text-sm mt-4">By clicking confirm, you agree to our terms of academic enrollment.</p>
          </div>

        </form>
      </div>
    </div>
  );
};

const InputField = ({ id, label, type = "text", value, onChange, required = false, readOnly = false }) => (
  <div className="relative group">
    <input 
      type={type} 
      id={id} 
      value={value} 
      onChange={onChange}
      placeholder=" "
      required={required}
      readOnly={readOnly}
      className={`peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-transparent text-gray-700 ${readOnly ? 'bg-slate-100 cursor-not-allowed' : ''}`}
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

const DropdownField = ({ id, label, value, onChange, options, icon, disabled = false, required = false }) => (
    <div className="relative">
      <select 
        id={id} 
        value={value} 
        onChange={onChange} 
        disabled={disabled}
        required={required}
        className={`peer w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="" disabled>Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      <div className="absolute left-4 top-3.5 text-gray-400 pointer-events-none text-xl">
        {icon}
      </div>
      <label className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-blue-600 transition-all duration-300 peer-placeholder-shown:text-gray-500">
        {label}
      </label>
    </div>
);

export default OnlineEnrollment;
