import { API_BASE } from "../config/api";

// =====> Inserting New Teachers <===== \\
export const upsertTeacher = async (action, teacherData, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append("action", action);

    Object.keys(teacherData).forEach(key => {
      formData.append(key, teacherData[key] ?? "");
    });

    if(imageFile) {
      formData.append("photo", imageFile);
    }

    const response = await fetch(`${API_BASE}/database/teachers.php`, {
      method: "POST", 
      body: formData, 
    });
    return await response.json();
  } catch (error) {
    console.log("Error inserting teacher", error);
    throw error;
  }
}