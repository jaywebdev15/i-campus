import { API_BASE } from "../config/api";

// =====> Insert New Curriculum <===== \\
export const insertNewcurriculum = async (action, curriculumData) => {
  try {
    const response = await fetch(`${API_BASE}/database/curriculums.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: action, 
        ...curriculumData
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error in inserting or updating curriculum", error);
  }
}