import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import DashboardLayout from "./pages/Dashboard";
import MainDashboard from "./pages/MainDashboard";
import Maintenance from "./pages/Maintenance";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import SafetyMonitoring from "./pages/SafetyMonitoring";

import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= PRIVATE ROUTES ================= */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="maindashboard" replace />} />
            <Route path="maindashboard" element={<MainDashboard />} />
            <Route path="safety-monitoring" element={<SafetyMonitoring />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}









