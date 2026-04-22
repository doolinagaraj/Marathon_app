import React from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function TopBar() {
  const { user, token, logout } = useAuth();
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ color: "inherit", textDecoration: "none" }}>
          Marathon Manager
        </Typography>
        <Box sx={{ flex: 1 }} />
        {token && user ? (
          <>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.username} ({user.role})
            </Typography>
            <Button color="inherit" component={RouterLink} to="/change-password">
              Change Password
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/admin-login">
              Admin Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
