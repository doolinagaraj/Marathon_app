import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";

export default function AdminLoginPage() {
  const nav = useNavigate();
  const { logout, setSession } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      logout();
      const r = await api.adminLogin({ email, password });
      setSession(r.token, r.user);
      nav("/admin");
    } catch (err) {
      setError(err?.message ?? "Admin login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left side - Admin Hero Section */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #2d1015 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(255, 51, 102, 0.1) 0%, transparent 70%)",
              animation: "pulse 8s ease-in-out infinite",
            },
          }}
        >
          {/* Animated background elements */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(255, 51, 102, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 170, 0, 0.1) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            <AdminPanelSettingsIcon
              sx={{
                fontSize: 120,
                color: "#ff3366",
                mb: 3,
                filter: "drop-shadow(0 0 20px rgba(255, 51, 102, 0.6))",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: "3.5rem",
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(135deg, #ff3366 0%, #ff6b35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 40px rgba(255, 51, 102, 0.3)",
              }}
            >
              Admin Portal
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                mb: 4,
                fontWeight: 300,
              }}
            >
              Manage. Monitor. Excel.
            </Typography>
            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <SecurityIcon sx={{ fontSize: 40, color: "#ff3366", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Secure
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <AnalyticsIcon sx={{ fontSize: 40, color: "#ffaa00", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Analytics
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Right side - Admin Login Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : 0.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          background: isMobile
            ? "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)"
            : "linear-gradient(135deg, #1a0a0a 0%, #0a0a0a 100%)",
        }}
      >
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 460,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 51, 102, 0.2)",
            boxShadow: "0 20px 60px rgba(255, 51, 102, 0.15)",
          }}
        >
          <Stack spacing={3} component="form" onSubmit={handleLogin}>
            <Box textAlign="center">
              <AdminPanelSettingsIcon
                sx={{
                  fontSize: 48,
                  color: "#ff3366",
                  mb: 1,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Admin Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Authorized personnel only
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              required
              type="email"
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  borderColor: "#ff3366",
                  boxShadow: "0 0 20px rgba(255, 51, 102, 0.2)",
                },
              }}
            />

            <TextField
              label="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      aria-label="toggle password visibility"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  borderColor: "#ff3366",
                  boxShadow: "0 0 20px rgba(255, 51, 102, 0.2)",
                },
              }}
            />

            <Button
              variant="contained"
              type="submit"
              disabled={busy}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                background: busy
                  ? "rgba(255, 51, 102, 0.3)"
                  : "linear-gradient(135deg, #ff3366 0%, #ff6b35 100%)",
                boxShadow: "0 4px 16px rgba(255, 51, 102, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #ff5588 0%, #ff8555 100%)",
                  boxShadow: "0 6px 24px rgba(255, 51, 102, 0.5)",
                },
              }}
            >
              {busy ? "Authenticating..." : "Admin Login"}
            </Button>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Not an admin?{" "}
                <RouterLink
                  to="/login"
                  style={{
                    color: "#ff3366",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  User Login
                </RouterLink>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </Box>
  );
}
