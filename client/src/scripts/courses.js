import { API_BASE } from "../config/api";

// =====> Insert New Course <===== \\
export const insertNewCourse = async (action, courseData) => {
  try {
    const response = await fetch(`${API_BASE}/database/courses.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: action, 
        ...courseData
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error in inserting course", error);
  }
}