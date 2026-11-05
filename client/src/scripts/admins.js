import { API_BASE } from "../config/api";

// =====> Inserting New Admins <===== \\
export const insertNewAdmins = async (action, adminData, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append("action", action);

    Object.keys(adminData).forEach(key => {
      formData.append(key, adminData[key] ?? "");
    });

    if(imageFile) {
      formData.append("photo", imageFile);
    }

    const response = await fetch(`${API_BASE}/database/admins.php`, {
      method: "POST", 
      body: formData, 
    });
    return await response.json();
  } catch (error) {
    console.log("Error inserting admin", error);
    return { status: "error", message: error.message };
  }
}
