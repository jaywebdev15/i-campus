
// =====> Complete Date and Time <====== \\
export const completeDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now - offset).toISOString().slice(0, 19).replace('T', ' ');
  return localISOTime;
}


// =====> Complete Date <====== \\
export const completeDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}


// ======> Complete Time <====== \\
export const completeTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-PH", { hour12: false });
}


// =====> Complete Full Date <===== \\
export const completeFullDate = (date) => {
  if (!date || date === "0000-00-00") return '';
  const dateName = new Date(date);
  if (isNaN(dateName.getTime())) return '';
  return dateName.toLocaleDateString("en-PH", {
    year: "numeric", 
    month: "long", 
    day: "2-digit"
  });
}


// =====> Get birthday <===== \\
export const getAge = (dob) => {
  if(!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return ''; // Handle invalid date

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}


// =====> Convert time to 12 hour <===== \\
export const convertTo12Hour = (time) => {
  const [hour, minute] = time.split(":");
  let h = parseInt(hour);

  const ampm = h >= 12 ? "pm" : "am";

  h = h % 12 || 12;

  return `${h}:${minute}${ampm}`;
}