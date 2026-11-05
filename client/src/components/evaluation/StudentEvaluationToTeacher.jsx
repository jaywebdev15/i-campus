import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import TeachingEffectiveness from './TeachingEffectiveness';
import Professionalism from './Professionalism';
import { insertEvaluation } from '../../scripts/evaluation';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const StudentEvaluationToTeacher = () => {
const { userCredential } = useContext(AuthContext);
const { showFlashMessage } = useContext(FlashMessageContext);

  const [evaluations, setEvaluations] = useState({
    evaluation_id: 0, 
    evaluation_course_id: "", 
    evaluation_teacher_id: "", 
    evaluation_student_id: userCredential?.login_code, 
    evaluation_school_year: "", 
    evaluation_teaching: {
      evaluation_explanation: 0, 
      evaluation_demonstration: 0, 
      evaluation_method: 0, 
      evaluation_encouragement: 0, 
      evaluation_assessment: 0, 
    }, 
    evaluation_professionalism: {
      evaluation_management: 0, 
      evaluation_respect: 0, 
      evaluation_communication: 0, 
      evaluation_ontime: 0, 
      evaluation_positive_learning: 0, 
    }, 
    evaluation_comments:	"", 
  });

  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [semester, setSemester] = useState("");

  const fetchEnrolledSubjects = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getStudentEnrolledSubjects",
          userCode: userCredential.login_code,
          semester: semester
        }),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setEnrolledSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching enrolled subjects:", error);
    }
  }, [userCredential, semester]);

  React.useEffect(() => {
    if (userCredential?.login_code) {
      fetchEnrolledSubjects();
    }
  }, [fetchEnrolledSubjects, userCredential]);

  const handleSubjectChange = (e) => {
    const enrollmentId = e.target.value;
    setSelectedEnrollment(enrollmentId);
    
    const selected = enrolledSubjects.find(sub => String(sub.enrollment_id) === String(enrollmentId));
    if (selected) {
      setEvaluations(prev => ({
        ...prev,
        evaluation_course_id: selected.curriculum_id,
        evaluation_teacher_id: selected.teacher_number, // Using teacher_number as per request, displayed name is different
        evaluation_school_year: selected.school_year
      }));
    }
  };

  const clearFields = () => {
    setSelectedEnrollment("");
    return setEvaluations({
      evaluation_id: 0, 
      evaluation_course_id: "", 
      evaluation_teacher_id: "", 
      evaluation_school_year: "", 
      evaluation_teaching: {
        evaluation_explanation: 0, 
        evaluation_demonstration: 0, 
        evaluation_method: 0, 
        evaluation_encouragement: 0, 
        evaluation_assessment: 0, 
      }, 
      evaluation_professionalism: {
        evaluation_management: 0, 
        evaluation_respect: 0, 
        evaluation_communication: 0, 
        evaluation_ontime: 0, 
        evaluation_positive_learning: 0, 
      }, 
      evaluation_comments:	"", 
    });
  }

  const teachingEffectiveness = [ "Explains lessons clearly", 
                                  "Demonstrates mastery of the subject", 
                                  "Uses effective teaching methods", 
                                  "Encourages student participation", 
                                  "Provides fair and helpful assessments" ];
  const professionalism = [ "Manages the class effectively", 
                            "Treats students with respect", 
                            "Communicates clearly", 
                            "Comes to class prepared and on time", 
                            "Maintains a positive learning environment" ];
  return (
        <section className='flex flex-col items-center p-5 gap-5 h-full overflow-y-auto scrollbar-thin'>
          <div className="max-w-6xl mx-auto w-full p-4">

            {/* Title */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                Teacher Evaluation Form
              </h1>
              <p className="text-sm text-gray-500 text-center max-w-2xl font-medium">
                This evaluation assesses teaching effectiveness to support professional growth
                and improve the quality of instruction.
              </p>
            </div>

            {/* Semester Select */}
            <div className="mb-6">
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Semester</label>
               <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  value={semester}
                  onChange={(e) => {
                      setSemester(e.target.value);
                      setSelectedEnrollment(""); // Reset selection
                  }}
               >
                  <option value="">All Semesters</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
               </select>
            </div>

            {/* Autofill Select */}
            <div className="mb-8">
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Subject to Evaluate</label>
               <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  value={selectedEnrollment}
                  onChange={handleSubjectChange}
               >
                  <option value="">-- Choose a subject --</option>
                  {enrolledSubjects.map((sub, index) => (
                    <option key={index} value={sub.enrollment_id}>
                      {sub.subject_code} - {sub.subject_title} ({sub.teacher_firstname} {sub.teacher_lastname})
                    </option>
                  ))}
               </select>
            </div>

            {/* Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject Code</label>
                <input className="w-full border-b border-gray-200 px-0 py-2 bg-transparent text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" placeholder="Subject Code" 
                        value={enrolledSubjects.find(sub => String(sub.curriculum_id) === String(evaluations.evaluation_course_id))?.subject_code || ""} 
                        readOnly />
              </div>
              <div>
                 <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Professor ID / Name</label>
                 <input className="w-full border-b border-gray-200 px-0 py-2 bg-transparent text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" placeholder="Professor Name" 
                        value={evaluations.evaluation_teacher_id} 
                        readOnly
                        onChange={(e) => setEvaluations({...evaluations, evaluation_teacher_id: e.target.value})} />
              </div>
              <div>
                 <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">School Year</label>
                 <input className="w-full border-b border-gray-200 px-0 py-2 bg-transparent text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" placeholder="School Year" 
                        value={evaluations.evaluation_school_year} 
                        readOnly
                        onChange={(e) => setEvaluations({...evaluations, evaluation_school_year: e.target.value})} />
              </div>
            </div>

            {/* Rating Legend */}
            <div className="text-xs text-blue-800 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-center font-medium">
              <span className="uppercase tracking-wide font-bold mr-2">Rating Scale:</span> 5 - Excellent | 4 - Very Good | 3 - Good | 2 - Fair | 1 - Poor
            </div>

            {/* Evaluation Table */}
            <div className="flex flex-col gap-8">
              <TeachingEffectiveness teachingEffectiveness={teachingEffectiveness} 
                                      evaluations={evaluations} 
                                      setEvaluations={setEvaluations} />

              <Professionalism professionalism={professionalism} 
                                evaluations={evaluations} 
                                setEvaluations={setEvaluations} />
            </div>

            {/* Comments */}
            <div className="mt-8">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Additional Comments
              </label>
              <textarea
                rows="4" 
                value={evaluations.evaluation_comments} 
                onChange={(e) => setEvaluations({...evaluations, evaluation_comments: e.target.value})} 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-all resize-none"
                placeholder="Write your comments here..."
              />
            </div>

            {/* Submit */}
            <div className="text-right mt-8 pb-10">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:translate-y-[-1px] transition-all cursor-pointer" 
                      onClick={async () => {
                        const result = await insertEvaluation("insertEvaluation", 
                                                                evaluations.evaluation_course_id, 
                                                                evaluations.evaluation_teacher_id, 
                                                                evaluations.evaluation_student_id, 
                                                                evaluations.evaluation_school_year, 
                                                                evaluations.evaluation_teaching.evaluation_explanation, 
                                                                evaluations.evaluation_teaching.evaluation_demonstration, 
                                                                evaluations.evaluation_teaching.evaluation_method, 
                                                                evaluations.evaluation_teaching.evaluation_encouragement, 
                                                                evaluations.evaluation_teaching.evaluation_assessment, 
                                                                evaluations.evaluation_professionalism.evaluation_management, 
                                                                evaluations.evaluation_professionalism.evaluation_respect, 
                                                                evaluations.evaluation_professionalism.evaluation_communication, 
                                                                evaluations.evaluation_professionalism.evaluation_ontime, 
                                                                evaluations.evaluation_professionalism.evaluation_positive_learning, 
                                                                semester,
                                                                evaluations.evaluation_comments, 
                                                              );
                        if(result.status === "failed") return showFlashMessage(result.status, result.message);
                        showFlashMessage(result.status, result.message);
                        clearFields();
                      }}>
                Submit Evaluation
              </button>
            </div>

          </div>

        </section>
  )
}

export default StudentEvaluationToTeacher