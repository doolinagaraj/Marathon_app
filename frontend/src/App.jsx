import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Container } from "@mui/material";
import TopBar from "./components/TopBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";

export default function App() {
  const location = useLocation();
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!isAuthRoute ? <TopBar /> : null}
      <Container maxWidth={isAuthRoute ? false : "lg"} disableGutters={isAuthRoute} sx={{ py: isAuthRoute ? 0 : 3 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/forgot-password" element={<ChangePasswordPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}
