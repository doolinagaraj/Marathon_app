import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await login(email, password);
      nav(r.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err?.message ?? "Login failed");
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
      {/* Left side - Hero Section (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
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
              background: "radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)",
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
                "radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            <DirectionsRunIcon
              sx={{
                fontSize: 120,
                color: "primary.main",
                mb: 3,
                filter: "drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: "3.5rem",
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 40px rgba(0, 212, 255, 0.3)",
              }}
            >
              Run Your Limits
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                mb: 4,
                fontWeight: 300,
              }}
            >
              Track. Compet. Conquer.
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
                <EmojiEventsIcon sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Events
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
                <DirectionsRunIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Runs
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Right side - Login Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : 0.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          background: isMobile
            ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)"
            : "linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)",
        }}
      >
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 460,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Stack spacing={3} component="form" onSubmit={onSubmit}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue your journey
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              required
              type="text"
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
              }}
            />

            <TextField
              label="Password"
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
                background: busy ? "rgba(0, 212, 255, 0.3)" : undefined,
              }}
            >
              {busy ? "Signing in..." : "Sign In"}
            </Button>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <RouterLink
                  to="/register"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Register Now
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
