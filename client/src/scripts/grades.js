import { API_BASE } from "../config/api";

// =====> General Gradding Call Actions <===== \\
export const handleGradingTable = async (action, gradingData) => {
    try {
        const response = await fetch(`${API_BASE}/database/grading.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
                action: action, 
                ...gradingData
            })
        });
        const data = await response.json();
        return data; 
    } catch (error) {
        console.log("Error handling grading table", error);
    }
}

// ==========> Upsert Grade <========== \\
export const upsertGrade = async (curriculumId, enrollmentId, criteriaId, assessment, items, gradingTerm, date, score, teacherCode, schoolYear, gradeId) => {
  try {
    console.log("Upserting Grade Payload:", { curriculumId, enrollmentId, criteriaId, assessment, items, gradingTerm, date, score, teacherCode, schoolYear, gradeId });

    const response = await fetch(`${API_BASE}/database/grades.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: "upsertGrade", 
        grade_id: gradeId,
        curriculumId: curriculumId, 
        enrollment_id: enrollmentId, 
        criteria_id: criteriaId, 
        assessment: assessment, 
        items: items, 
        grading_term: gradingTerm, 
        date: date, 
        score: score, 
        userCode: teacherCode, 
        schoolYear: schoolYear
      })
    });
    
    // Debug: Read text first to catch non-JSON errors (HTML stacks)
    const textResponse = await response.text();
    console.log("Upsert Grade Raw Response:", textResponse);

    try {
        const data = JSON.parse(textResponse);
        return data;
    } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError);
        console.error("Received raw response:", textResponse);
        return { status: "failed", message: "Server Error: Invalid JSON response." };
    }

  } catch (error) {
    console.log("Error in upserting grade", error);
    return { status: "failed", message: "Network or Script Error" };
  }
}