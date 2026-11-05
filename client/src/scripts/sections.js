import { API_BASE } from "../config/api";


// ===== > Insert / Update Section <===== \\
export const insertOrUpdateSection = async (action, sectionData) => {
  try {
    const response = await fetch(`${API_BASE}/database/sections.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: action, 
        ...sectionData
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error in returning insert/update section", error);
  }
}