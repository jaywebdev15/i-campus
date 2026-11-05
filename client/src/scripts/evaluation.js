import { API_BASE } from "../config/api";

// =====> Insert Evaluation <===== \\
export const insertEvaluation = async (action, 
                                        evaluation_course_id, 
                                        evaluation_teacher_id, 
                                        evaluation_student_id, 
                                        evaluation_school_year, 
                                        evaluation_explanation, 
                                        evaluation_demonstration, 
                                        evaluation_method, 
                                        evaluation_encouragement, 
                                        evaluation_assessment, 
                                        evaluation_management, 
                                        evaluation_respect, 
                                        evaluation_communication, 
                                        evaluation_ontime, 
                                        evaluation_positive_learning, 
                                        evaluation_semester,
                                        evaluation_comments) => {
  const response = await fetch(`${API_BASE}/database/evaluations.php`, {
    method: "POST", 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({
      action, 
      evaluation_course_id, 
      evaluation_teacher_id, 
      evaluation_student_id, 
      evaluation_school_year, 
      evaluation_explanation, 
      evaluation_demonstration, 
      evaluation_method, 
      evaluation_encouragement, 
      evaluation_assessment, 
      evaluation_management, 
      evaluation_respect, 
      evaluation_communication, 
      evaluation_ontime, 
      evaluation_positive_learning, 
      evaluation_semester,
      evaluation_comments
    })
  });
  const data = response.json();
  return data;
}

// =====> Insert Student Evaluation <===== \\
export const insertStudentEvaluation = async (action, 
                                        enrollment_id, 
                                        evaluation_teacher_id, 
                                        evaluation_demonstration, 
                                        evaluation_participation, 
                                        evaluation_responsible, 
                                        evaluation_willing_to_learn, 
                                        evaluation_problem_solving, 
                                        evaluation_respect, 
                                        evaluation_reliable, 
                                        evaluation_teamwork, 
                                        evaluation_positive, 
                                        evaluation_discipline, 
                                        evaluation_semester,
                                        evaluation_comments) => {
  const response = await fetch(`${API_BASE}/database/evaluations.php`, {
    method: "POST", 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({
      action, 
      enrollment_id, 
      evaluation_teacher_id, 
      evaluation_demonstration, 
      evaluation_participation, 
      evaluation_responsible, 
      evaluation_willing_to_learn, 
      evaluation_problem_solving, 
      evaluation_respect, 
      evaluation_reliable, 
      evaluation_teamwork, 
      evaluation_positive, 
      evaluation_discipline, 
      evaluation_semester,
      evaluation_comments
    })
  });
  
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch {
    console.error("Server Error Response:", text);
    throw new Error("Server returned non-JSON response. Check console for details.");
  }
}