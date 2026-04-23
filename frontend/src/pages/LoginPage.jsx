import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography, useMediaQuery, useTheme, Checkbox, FormControlLabel } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [socialError, setSocialError] = useState("");
  const [busy, setBusy] = useState(false);
  const socialProviders = [
    { key: "google", icon: <GoogleIcon />, color: "#db4437", label: "Google", url: import.meta.env.VITE_GOOGLE_AUTH_URL },
    { key: "apple", icon: <AppleIcon />, color: "#ffffff", label: "Apple", url: import.meta.env.VITE_APPLE_AUTH_URL },
    { key: "facebook", icon: <FacebookIcon />, color: "#4267B2", label: "Facebook", url: import.meta.env.VITE_FACEBOOK_AUTH_URL },
  ];

  function handleSocialLogin(provider) {
    setSocialError("");
    if (!provider.url) {
      setSocialError(`${provider.label} sign-in is not configured yet. Please contact support.`);
      return;
    }
    window.location.assign(provider.url);
  }

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
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Blurred Image Background with Animation */}
      <Box
        sx={{
          position: "absolute",
          top: "-5%",
          left: "-5%",
          right: "-5%",
          bottom: "-5%",
          backgroundImage: "url('/login-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(12px)",
          zIndex: 0,
          animation: "bgPan 20s ease-in-out infinite alternate",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)",
          }
        }}
      />

      {/* Floating Particles for extra animation */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            background: `linear-gradient(135deg, #00d4ff, #00ff88)`,
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.6,
            zIndex: 0,
          }}
        />
      ))}

      {/* Glass Card */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          animation: "cardSlideUp 0.6s ease-out",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            borderRadius: 4,
            border: "1px solid rgba(0, 212, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 212, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <Stack spacing={3} component="form" onSubmit={onSubmit}>
            {/* Header */}
            <Box textAlign="center">
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 255, 136, 0.2))",
                  mb: 2,
                  animation: "iconPulse 2s ease-in-out infinite",
                }}
              >
                <DirectionsRunIcon sx={{ fontSize: 48, color: "#00d4ff" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Continue your running journey
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            {socialError && <Alert severity="warning" sx={{ borderRadius: 2 }}>{socialError}</Alert>}

            {/* Email Input */}
            <TextField
              label="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)",
                    borderColor: "#00d4ff",
                  },
                },
              }}
            />

            {/* Password Input */}
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
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)",
                    borderColor: "#00d4ff",
                  },
                },
              }}
            />

            {/* Remember Me & Forgot Password */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: "text.secondary",
                      "&.Mui-checked": {
                        color: "#00d4ff",
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <RouterLink
                to="/forgot-password"
                style={{
                  color: "#00d4ff",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease",
                }}
              >
                Forgot Password?
              </RouterLink>
            </Box>

            {/* Login Button */}
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
                  ? "rgba(0, 212, 255, 0.3)"
                  : "linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)",
                boxShadow: "0 4px 20px rgba(0, 212, 255, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 30px rgba(0, 212, 255, 0.6)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {busy ? "Signing in..." : "Sign In"}
            </Button>

            {/* Social Login */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Or continue with
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                {socialProviders.map((social) => (
                  <IconButton
                    key={social.key}
                    onClick={() => handleSocialLogin(social)}
                    aria-label={`Continue with ${social.label}`}
                    sx={{
                      p: 1.5,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      color: social.color,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: `0 0 20px ${social.color}40`,
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>

            {/* Register Link */}
            <Box textAlign="center" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <RouterLink
                  to="/register"
                  style={{
                    color: "#00d4ff",
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                >
                  Register Now
                </RouterLink>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* CSS Animations */}
      <style>{`
        @keyframes bgPan {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes cardSlideUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
}
