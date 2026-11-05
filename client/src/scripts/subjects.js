import { API_BASE } from "../config/api";

// =====> Insert New Subject <===== \\
export const insertNewSubject = async (action, subjectData) => {
  try {
    const response = await fetch(`${API_BASE}/database/subjects.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: action, 
        ...subjectData
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error inserting subject", error);
  }
}