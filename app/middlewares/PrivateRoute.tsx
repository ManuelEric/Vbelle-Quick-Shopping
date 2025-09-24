import { Navigate } from "react-router";

const PrivateRoute = ({ children }: {children: any}) => {
  const isAuthenticated = localStorage.getItem('adminToken') !== null;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;