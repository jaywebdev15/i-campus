import React, { useState, useEffect, useContext } from 'react';
import { API_BASE } from '../../config/api';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const GradeModal = ({ gradeData, setGradeData, gradeModal, setGradeModal, setGradeId, availableCriteria = [], onCriteriaUpdate }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;

  // Add Mode State
  const [eduLevel, setEduLevel] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [addCriteriaInputs, setAddCriteriaInputs] = useState({
      "Written Work": "",
      "Performance Task": "",
      "Quarterly Exam": ""
  });

  const educationLevels = [ "College", "Senior High", "TESDA" ]; 
  const collegeLevels = [ "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year" ]; 
  const seniorHighLevels = [ "Grade 11", "Grade 12" ]; 
  const tesdaLevels = [ "NC I", "NC II", "NC III", "NC IV", "Diploma Program" ]; 
  const semesters = [ "1st Semester", "2nd Semester" ];

  // Dynamic Year Levels
  const getYearLevels = () => {
      if(eduLevel === "College") return collegeLevels;
      if(eduLevel === "Senior High") return seniorHighLevels;
      if(eduLevel === "TESDA") return tesdaLevels;
      return [];
  };

  // Fetch Subjects for Add Mode
  useEffect(() => {
    const fetchSubjects = async () => {
        if(eduLevel && yearLevel && semester) {
            try {
                const response = await fetch(`${API_BASE}/database/curriculums.php`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: "getSubject",
                        education_level: eduLevel,
                        year_level: yearLevel,
                        semester: semester
                    })
                });
                const data = await response.json();
                setAvailableSubjects(data);
            } catch(e) {
                console.error(e);
            }
        } else {
            setAvailableSubjects([]);
        }
    };
    fetchSubjects();
  }, [eduLevel, yearLevel, semester]);


  // Handle criteria percentage change by name
  const handleCriteriaChange = (name, value) => {
    const currentCriterias = gradeData.criterias || [];
    const index = currentCriterias.findIndex(c => c.criteria_name === name);
    
    let newCriterias;
    if (index >= 0) {
        newCriterias = [...currentCriterias];
        newCriterias[index] = { ...newCriterias[index], criteria_percentage: value };
    } else {
        newCriterias = [...currentCriterias, { criteria_name: name, criteria_percentage: value }];
    }
    setGradeData({ ...gradeData, criterias: newCriterias });
  };


  // Helper to calculate total
  const totalPercentage = gradeData.criterias ? gradeData.criterias.reduce((acc, curr) => acc + parseFloat(curr.criteria_percentage || 0), 0) : 0;

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${gradeModal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             setGradeModal("");
             setGradeData({
                course_code:        "", 
                course_title:       "", 
                course_description: "", 
                category:           "", 
                course_status:      ""
             });
             setGradeId("");
           }}
      />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] shadow-2xl bg-white py-5 px-8 rounded-xl gap-5 z-50 
                      transition-all duration-300 border border-gray-100
                      md:w-[70%] lg:w-[50%] 
                      ${gradeModal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {(gradeModal === "criteria_edit" || gradeModal === "info") ? (
            /* =================== CRITERIA EDIT / INFO MODE =================== */
            <>
                <div className="flex flex-col gap-4 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">
                        {gradeModal === "info" ? "Course Info" : "Edit Grading Criteria"}
                    </h2>
                    
                    <div className="flex flex-col gap-3 px-2">
                        <div className="flex items-center gap-4">
                            <span className="w-32 text-gray-600 font-medium">Subject Code:</span>
                            <span className="flex-1 border-b border-gray-300 pb-1 text-blue-800 font-medium">
                                {gradeData.curriculum_id || gradeData.subject_code || "-"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="w-32 text-gray-600 font-medium">Full Name:</span>
                            <span className="flex-1 border-b border-gray-300 pb-1 text-gray-800">
                                {gradeData.subject_title || gradeData.course_title || gradeData.enrollment_id || "-"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="w-32 text-gray-600 font-medium">Category:</span>
                            <span className="flex-1 border-b border-gray-300 pb-1 text-gray-800">
                                {gradeData.category || "Select Category"} 
                            </span>
                        </div>
                    </div>
                </div>
                
                <h3 className="font-semibold text-gray-700 mt-2">Assessment Criteria</h3>
                
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
                    {availableCriteria.length > 0 ? (
                        availableCriteria.map((name) => {
                            const criteria = gradeData.criterias?.find(c => c.criteria_name === name);
                            const val = criteria ? criteria.criteria_percentage : "";
                            
                            return (
                                <div key={name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <span className="flex-1 font-medium text-gray-700">{name}</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={val}
                                            disabled={gradeModal === "info"}
                                            onChange={(e) => handleCriteriaChange(name, e.target.value)}
                                            className={`w-20 p-2 border border-gray-300 rounded text-center outline-none transition-all 
                                                ${gradeModal === "info" ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                                        />
                                        <span className="text-gray-500 font-bold">%</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-center py-5">No criteria definitions found.</p>
                    )}
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-900 mt-2">
                        <span className="font-bold">Total Percentage:</span>
                        <span className={`font-bold text-lg ${totalPercentage === 100 ? 'text-green-600' : 'text-red-500'}`}>
                            {totalPercentage}%
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button onClick={() => setGradeModal("")} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium transition-colors">Back</button>
                    {gradeModal !== "info" && (
                        <button onClick={async () => {
                            // Validation Logic
                            if(totalPercentage !== 100) {
                                showFlashMessage("failed", `Total percentage must be 100%. (Current: ${totalPercentage}%)`);
                                return;
                            }

                            try {
                                const response = await fetch(`${API_BASE}/database/criterias.php`, {
                                    method: "POST",
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({
                                        action: "updateCriteriaPercentages",
                                        curriculum_id: gradeData.curriculum_id,
                                        criterias: gradeData.criterias
                                    })
                                });
                                const result = await response.json();
                                showFlashMessage(result.status, result.message);
                                if(result.status === "success") {
                                    setGradeModal("");
                                    if(onCriteriaUpdate) onCriteriaUpdate(); // Trigger refresh without reload
                                }
                            } catch(e) {
                                console.error("Error saving criteria:", e);
                            }
                        }} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md font-medium transition-transform active:scale-95">Save Changes</button>
                    )}
                </div>
            </>
        ) : (
            /* =================== ADD CRITERIA MODE =================== */
            <>
                <div className="flex flex-col gap-1 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-800">Add Grading Criteria</h2>
                    <p className="text-sm text-gray-500">Configure criteria percentages for a subject.</p>
                </div>
                
                <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar p-1 max-h-[60vh]">
                    
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Education Level</label>
                            <select value={eduLevel} onChange={(e) => {
                                setEduLevel(e.target.value);
                                setYearLevel(""); // Reset dependent
                            }} className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none">
                                <option value="">Select Level</option>
                                {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Year Level</label>
                            <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} 
                                    disabled={!eduLevel}
                                    className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none disabled:bg-gray-100">
                                <option value="">Select Year</option>
                                {getYearLevels().map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Semester</label>
                            <select value={semester} onChange={(e) => setSemester(e.target.value)} 
                                    className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none">
                                <option value="">Select Semester</option>
                                {semesters.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Subject / Curriculum</label>
                        <select value={gradeData.curriculum_id || ""} 
                                onChange={(e) => setGradeData({...gradeData, curriculum_id: e.target.value})}
                                disabled={availableSubjects.length === 0}
                                className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none disabled:bg-gray-100">
                            <option value="">
                                {availableSubjects.length === 0 ? "Select Filters First" : "Select Subject"}
                            </option>
                            {availableSubjects.map(sub => (
                                <option key={sub.curriculum_id} value={sub.curriculum_id}>
                                    {sub.subject_code} - {sub.subject_title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Criteria Inputs */}
                    <div className="flex flex-col gap-3 border-t pt-3">
                        <h3 className="font-semibold text-gray-700">Assessment Criteria</h3>
                        {Object.keys(addCriteriaInputs).map((key) => (
                             <div key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span className="flex-1 font-medium text-gray-700">{key}</span>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        value={addCriteriaInputs[key]}
                                        onChange={(e) => setAddCriteriaInputs({...addCriteriaInputs, [key]: e.target.value})}
                                        className="w-20 p-2 border border-gray-300 rounded text-center focus:border-blue-500 outline-none"
                                    />
                                    <span className="text-gray-500 font-bold">%</span>
                                </div>
                            </div>
                        ))}

                         <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-900 mt-2">
                            <span className="font-bold">Total Percentage:</span>
                            <span className={`font-bold text-lg ${
                                (Object.values(addCriteriaInputs).reduce((a, b) => a + parseFloat(b || 0), 0) === 100) 
                                ? 'text-green-600' : 'text-red-500'
                            }`}>
                                {Object.values(addCriteriaInputs).reduce((a, b) => a + parseFloat(b || 0), 0)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                     <button onClick={() => setGradeModal("")} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                     <button onClick={async () => {
                        const total = Object.values(addCriteriaInputs).reduce((a, b) => a + parseFloat(b || 0), 0);
                        if(total !== 100) {
                             showFlashMessage("failed", `Total percentage must be 100%. (Current: ${total}%)`);
                             return;
                        }
                        if(!gradeData.curriculum_id) {
                            showFlashMessage("failed", "Please select a subject.");
                            return;
                        }

                        // Construct Criterias Array
                        const criteriasPayload = Object.keys(addCriteriaInputs).map(key => ({
                            criteria_name: key,
                            criteria_percentage: addCriteriaInputs[key]
                        }));

                        try {
                            const response = await fetch(`${API_BASE}/database/criterias.php`, {
                                method: "POST",
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    action: "updateCriteriaPercentages",
                                    curriculum_id: gradeData.curriculum_id,
                                    criterias: criteriasPayload
                                })
                            });
                             const result = await response.json();
                            showFlashMessage(result.status, result.message);
                            if(result.status === "success") {
                                setGradeModal("");
                                if(onCriteriaUpdate) onCriteriaUpdate();
                                // Reset Inputs
                                setEduLevel("");
                                setYearLevel("");
                                setSemester("");
                                setAddCriteriaInputs({
                                      "Written Work": "",
                                      "Performance Task": "",
                                      "Quarterly Exam": ""
                                });
                            }
                        } catch(e) {
                             console.error("Error saving criteria:", e);
                        }

                     }} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md font-medium transition-transform active:scale-95">Save</button>
                </div>
            </>
        )}

      </div>
    </>
  )
}

export default GradeModal