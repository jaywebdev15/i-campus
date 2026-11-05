import { API_BASE } from "../config/api";

// =====> Inserting New Students <===== \\
export const insertNewStudents = async (action, studentData, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append("action", action);

    Object.keys(studentData).forEach(key => {
      formData.append(key, studentData[key] ?? "");
    });

    if(imageFile) {
      formData.append("photo", imageFile);
    }

    const response = await fetch(`${API_BASE}/database/students.php`, {
      method: "POST", 
      body: formData, 
    });
    return await response.json();
  } catch (error) {
    console.log("Error inserting student", error);
  }
}