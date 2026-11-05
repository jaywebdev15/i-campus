import { createContext, useEffect, useState } from "react";
import { API_BASE } from "../config/api";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [userCredential, setUserCredential] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserCredential = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/auth/credential.php`, {
        credentials: "include"
      });
      const data = await response.json();
      setUserCredential(data || null);
    } catch (error) {
      console.log("Error fetching credential", error);
      setUserCredential(null)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserCredential();
  }, []);

  return (
    <AuthContext.Provider value={{ userCredential, setUserCredential, loading }}>
      { children }
    </AuthContext.Provider>
  )
}

export default AuthProvider