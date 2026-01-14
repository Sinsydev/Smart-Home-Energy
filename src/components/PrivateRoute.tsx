import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);
  const location = useLocation();

  // Debug: log auth state on route evaluation
  console.log("[PrivateRoute] auth:", { isAuthenticated, token, path: location.pathname });

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

