import { API_BASE } from "../config/api";


// =====> Insert New Enrollee <===== \\
export const insertNewEnrollee = async (action, enrolleeData) => {
  try {
    const response = await fetch(`${API_BASE}/database/enrollments.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: action, 
        ...enrolleeData
      })
    });
    const data = await response.json();
    return data
  } catch (error) {
    console.log("Error in fetching enrollments(insert)", error);
  }
} 