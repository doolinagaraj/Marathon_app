import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import TimelineIcon from "@mui/icons-material/Timeline";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await register({ email, password, username });
      setMsg("Registration successful! Redirecting to login...");
      setTimeout(() => {
        nav("/login");
      }, 2000);
    } catch (err) {
      setError(err?.message ?? "Registration failed");
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
      {/* Left side - Registration Hero Section */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #0a0a0a 0%, #0a1a0a 50%, #0f2d1a 100%)",
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
              background: "radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)",
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
                "radial-gradient(circle at 25% 60%, rgba(0, 255, 136, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(156, 39, 176, 0.15) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            <EmojiEventsIcon
              sx={{
                fontSize: 120,
                color: "#00ff88",
                mb: 3,
                filter: "drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: "3.5rem",
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(135deg, #00ff88 0%, #9c27b0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 40px rgba(0, 255, 136, 0.3)",
              }}
            >
              Join the Race
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                mb: 4,
                fontWeight: 300,
              }}
            >
              Start Your Journey Today
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
                <PeopleIcon sx={{ fontSize: 40, color: "#00ff88", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Community
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
                <TimelineIcon sx={{ fontSize: 40, color: "#9c27b0", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Right side - Registration Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : 0.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          background: isMobile
            ? "linear-gradient(135deg, #0a0a0a 0%, #0a1a0a 100%)"
            : "linear-gradient(135deg, #0a1a0a 0%, #0a0a0a 100%)",
        }}
      >
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 460,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 255, 136, 0.2)",
            boxShadow: "0 20px 60px rgba(0, 255, 136, 0.15)",
          }}
        >
          <Stack spacing={3} component="form" onSubmit={onSubmit}>
            <Box textAlign="center">
              <EmojiEventsIcon
                sx={{
                  fontSize: 48,
                  color: "#00ff88",
                  mb: 1,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join thousands of runners worldwide
              </Typography>
            </Box>

            {msg && <Alert severity="success" sx={{ borderRadius: 2 }}>{msg}</Alert>}
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  borderColor: "#00ff88",
                  boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
                },
              }}
            />

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  borderColor: "#00ff88",
                  boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
                },
              }}
            />

            <TextField
              label="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              inputProps={{ minLength: 8 }}
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
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  borderColor: "#00ff88",
                  boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
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
                  ? "rgba(0, 255, 136, 0.3)"
                  : "linear-gradient(135deg, #00ff88 0%, #9c27b0 100%)",
                boxShadow: "0 4px 16px rgba(0, 255, 136, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #33ff99 0%, #ba68c8 100%)",
                  boxShadow: "0 6px 24px rgba(0, 255, 136, 0.5)",
                },
              }}
            >
              {busy ? "Creating Account..." : "Create Account"}
            </Button>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <RouterLink
                  to="/login"
                  style={{
                    color: "#00ff88",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Login Here
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
