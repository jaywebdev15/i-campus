import React, { useContext, useState } from 'react'
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { insertStudentEvaluation } from '../../scripts/evaluation';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import Academic from './Academic';
import Behavior from './Behavior';

const TeacherEvaluationToStudent = () => {
const { userCredential } = useContext(AuthContext);
const { showFlashMessage } = useContext(FlashMessageContext);

  const [studentEvaluations, setStudentEvaluations] = useState({
    evaluation_id: 0, 
    evaluation_course_id: "", 
    evaluation_teacher_id: "", 
    evaluation_student_id: userCredential?.login_code, 
    evaluation_school_year: "", 
    evaluation_academic: {
      evaluation_demonstration: 0, 
      evaluation_participation: 0, 
      evaluation_responsible: 0, 
      evaluation_willing_to_learn: 0, 
      evaluation_problem_solving: 0, 
    }, 
    evaluation_behavior: {
      evaluation_respect: 0, 
      evaluation_reliable: 0, 
      evaluation_teamwork: 0, 
      evaluation_positive: 0, 
      evaluation_discipline: 0, 
    }, 
    evaluation_comments:	"", 
  });

  const [myStudents, setMyStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [semester, setSemester] = useState("");

  const fetchMyStudents = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/grades.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getStudentsOfTeacher",
          userCode: userCredential.login_code,
          semester: semester
        }),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setMyStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [userCredential, semester]);

  React.useEffect(() => {
    if (userCredential?.login_code) {
      fetchMyStudents();
    }
  }, [fetchMyStudents, userCredential]);

  const handleStudentChange = (e) => {
    const enrollmentId = e.target.value;
    setSelectedStudentId(enrollmentId);
    
    // enrollmentId is unique for a student-subject pair
    const selected = myStudents.find(stud => String(stud.enrollment_id) === String(enrollmentId));
    
    if (selected) {
      setStudentEvaluations(prev => ({
          ...prev,
          evaluation_course_id: selected.subject_code,
          evaluation_teacher_id: userCredential.login_code,
          evaluation_student_id: selected.student_number || selected.name,
          evaluation_school_year: selected.school_year
      }));
    }
  };

  const clearFields = () => {
    setSelectedStudentId("");
    return setStudentEvaluations({
      evaluation_id: 0, 
      evaluation_course_id: "", 
      evaluation_teacher_id: "", 
      evaluation_student_id: userCredential?.login_code, 
      evaluation_school_year: "", 
      evaluation_academic: {
        evaluation_demonstration: 0, 
        evaluation_participation: 0, 
        evaluation_responsible: 0, 
        evaluation_willing_to_learn: 0, 
        evaluation_problem_solving: 0, 
      }, 
      evaluation_behavior: {
        evaluation_respect: 0, 
        evaluation_reliable: 0, 
        evaluation_teamwork: 0, 
        evaluation_positive: 0, 
        evaluation_discipline: 0, 
      }, 
      evaluation_comments:	"", 
    });
  }

  const academic = [ "Demonstrates understanding of the subject matter", 
                    "Participates actively in class discussions", 
                    "Completes assignments and projects on time", 
                    "Shows curiosity and willingness to learn", 
                    "Applies critical thinking in problem-solving" ];
  const behavior = [ "Shows respect toward teachers and classmates", 
                    "Demonstrates responsibility and reliability", 
                    "Works well in group activities", 
                    "Maintains discipline and classroom etiquette", 
                    "Exhibits motivation and positive attitude toward learning" ];
  return (
        <section className='flex flex-col items-center p-5 pb-25 gap-5 h-full overflow-y-auto scrollbar-thin'>
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
                      setSelectedStudentId(""); // Reset student selection when semester changes
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
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Student to Evaluate</label>
               <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  value={selectedStudentId}
                  onChange={handleStudentChange}
               >
                  <option value="">-- Choose a student --</option>
                  {myStudents.map((stud, index) => (
                    <option key={index} value={stud.enrollment_id}>
                      {stud.subject_code} - {stud.name} ({stud.section_code})
                    </option>
                  ))}
               </select>
            </div>

            {/* Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div>
                 <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject Code</label>
                 <input className="w-full border-b border-gray-200 px-0 py-2 bg-transparent text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" placeholder="Subject Code" 
                         value={studentEvaluations.evaluation_course_id} 
                         readOnly
                         onChange={(e) => setStudentEvaluations({...studentEvaluations, evaluation_course_id: e.target.value})} />
              </div>
              <div>
                 <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Name / ID</label>
                 <input className="w-full border-b border-gray-200 px-0 py-2 bg-transparent text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" placeholder="Student Name" 
                         value={studentEvaluations.evaluation_student_id} 
                         readOnly
                         onChange={(e) => setStudentEvaluations({...studentEvaluations, evaluation_student_id: e.target.value})} />
              </div>
              <div>
                 <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">School Year</label>
                 <input className="w-full border-b border-gray-200 px-0 py-2 bg-transparent text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" placeholder="School Year" 
                         value={studentEvaluations.evaluation_school_year} 
                         readOnly
                         onChange={(e) => setStudentEvaluations({...studentEvaluations, evaluation_school_year: e.target.value})} />
              </div>
            </div>

            {/* Rating Legend */}
            <div className="text-xs text-blue-800 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-center font-medium">
              <span className="uppercase tracking-wide font-bold mr-2">Rating Scale:</span> 5 - Excellent | 4 - Very Good | 3 - Good | 2 - Fair | 1 - Poor
            </div>

            {/* Evaluation Table */}
            <div className="flex flex-col gap-8">
              <Academic criteria={academic} 
                        evaluations={studentEvaluations} 
                        setEvaluations={setStudentEvaluations} 
                        category="evaluation_academic" />

              <Behavior criteria={behavior} 
                        evaluations={studentEvaluations} 
                        setEvaluations={setStudentEvaluations} 
                        category="evaluation_behavior" />
            </div>

            {/* Comments */}
            <div className="mt-8">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Additional Comments
              </label>
              <textarea
                rows="4" 
                value={studentEvaluations.evaluation_comments} 
                onChange={(e) => setStudentEvaluations({...studentEvaluations, evaluation_comments: e.target.value})} 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-all resize-none"
                placeholder="Write your comments here..."
              />
            </div>

            {/* Submit */}
            <div className="text-right mt-8 pb-10">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:translate-y-[-1px] transition-all cursor-pointer" 
                      onClick={async () => {
                        const result = await insertStudentEvaluation("insertStudentEvaluation", 
                                                                selectedStudentId, // Using enrollment_id
                                                                studentEvaluations.evaluation_teacher_id, 
                                                                studentEvaluations.evaluation_academic.evaluation_demonstration, 
                                                                studentEvaluations.evaluation_academic.evaluation_participation, 
                                                                studentEvaluations.evaluation_academic.evaluation_responsible, 
                                                                studentEvaluations.evaluation_academic.evaluation_willing_to_learn, 
                                                                studentEvaluations.evaluation_academic.evaluation_problem_solving, 
                                                                studentEvaluations.evaluation_behavior.evaluation_respect, 
                                                                studentEvaluations.evaluation_behavior.evaluation_reliable, 
                                                                studentEvaluations.evaluation_behavior.evaluation_teamwork, 
                                                                studentEvaluations.evaluation_behavior.evaluation_positive, 
                                                                studentEvaluations.evaluation_behavior.evaluation_discipline, 
                                                                semester,
                                                                studentEvaluations.evaluation_comments, 
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

export default TeacherEvaluationToStudent