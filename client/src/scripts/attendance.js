import { API_BASE } from "../config/api";


// =====> Insert Attendance <===== \\
export const logStudentAttendance = async (attendanceData) => {
  try {
    const response = await fetch(`${API_BASE}/database/attendance.php`, {
      method: "POST", 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        action: "logAttendance", 
        ...attendanceData
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error in inserting attendance", error);
  }
}