import React from "react";
import { AppBar, Box, Button, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function TopBar() {
  const { user, token, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            color: "inherit",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          EVENROTH RC
        </Typography>
        <Box sx={{ flex: 1 }} />
        {token && user ? (
          <>
            {!isMobile && (
              <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
                {user.username}
              </Typography>
            )}
            <Button
              color="inherit"
              onClick={logout}
              size={isMobile ? "small" : "medium"}
              sx={{ minWidth: { xs: "auto", sm: "auto" } }}
            >
              {isMobile ? "Logout" : "Logout"}
            </Button>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? "Login" : "Login"}
            </Button>
            {!isMobile && (
              <Button color="inherit" component={RouterLink} to="/admin-login">
                Admin
              </Button>
            )}
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? "Register" : "Register"}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
