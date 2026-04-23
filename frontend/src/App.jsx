import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Container, Box } from "@mui/material";
import TopBar from "./components/TopBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar transparent={isAuthPage} />
      {isAuthPage ? (
        <Box sx={{ flex: 1, position: "relative" }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      ) : (
        <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
          <Routes>
            <Route path="/admin-login" element={<AdminLoginPage />} />
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
      )}
    </Box>
  );
}
