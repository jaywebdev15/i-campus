import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import NotFound from "../../pages/shared/NotFound";

const ProtectedRoute = ({ children, allowed }) => {
  const { userCredential, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!userCredential || !userCredential?.login_status) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  if (allowed && !allowed.includes(userCredential?.login_role)) {
    return <NotFound />;
  }

  return children;
};

export default ProtectedRoute;
