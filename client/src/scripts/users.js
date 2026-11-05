import { API_BASE } from "../config/api";

// =====> Inserting New Users <===== \\
// =====> Inserting New Users / Generic Action <===== \\
export const insertNewUsers = async (action, userData) => {
  try {
    const response = await fetch(`${API_BASE}/database/users.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          action: action,
          ...userData
      }), 
    });
    return await response.json();
  } catch (error) {
    console.log("Error inserting user", error);
    return { status: "failed", message: error.message };
  }
}

// =====> Register New User (Alias for Register.jsx) <===== \\
export const insertNewUser = async (userData) => {
    return await insertNewUsers("insertUser", userData);
}

// =====> Logout User <===== \\
export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_BASE}/database/users.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "logoutUser"
            }), 
        });
        return await response.json();
    } catch (error) {
        console.log("Error logging out", error);
        return { status: "failed", message: error.message };
    }
}

// =====> User Login <===== \\
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE}/database/auth/login.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email, 
                password: password
            }), 
        });
        const result = await response.json();
        return result; 
    } catch (error) {
        console.log("Error logging in", error);
        return { status: "failed", message: error.message };
    }
}

// =====> Change Password <===== \\
export const changePassword = async (userCode, oldPassword, password, confirmPassword) => {
    try {
        const response = await fetch(`${API_BASE}/database/users.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "changePassword",
                userCode: userCode,
                oldPassword: oldPassword,
                password: password,
                confirmPassword: confirmPassword
            }), 
        });
        return await response.json();
    } catch (error) {
        console.log("Error changing password", error);
        return { status: "failed", message: error.message };
    }
}