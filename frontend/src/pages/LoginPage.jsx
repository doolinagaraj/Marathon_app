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
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #0a0a2e 0%, #000000 50%, #0a1628 100%)",
          zIndex: 0,
        }}
      >
        {/* Animated Stars */}
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              backgroundColor: "#fff",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Moon */}
        <Box
          sx={{
            position: "absolute",
            top: 60,
            right: 60,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffd700 0%, #ffed4e 40%, transparent 70%)",
            boxShadow: "0 0 60px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.3)",
            animation: "moonGlow 4s ease-in-out infinite",
          }}
        />

        {/* City Skyline Silhouette */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(to top, #000 0%, transparent 100%)",
          }}
        >
          {/* Buildings */}
          <svg
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}
          >
            <path
              d="M0,200 L0,150 L50,150 L50,120 L100,120 L100,160 L150,160 L150,100 L200,100 L200,140 L250,140 L250,170 L300,170 L300,110 L350,110 L350,150 L400,150 L400,130 L450,130 L450,160 L500,160 L500,90 L550,90 L550,140 L600,140 L600,120 L650,120 L650,170 L700,170 L700,100 L750,100 L750,150 L800,150 L800,110 L850,110 L850,160 L900,160 L900,130 L950,130 L950,140 L1000,140 L1000,120 L1050,120 L1050,170 L1100,170 L1100,150 L1150,150 L1150,160 L1200,160 L1200,200 Z"
              fill="#0a0a1a"
            />
            {/* Neon Windows */}
            {[...Array(40)].map((_, i) => (
              <rect
                key={i}
                x={Math.random() * 1200}
                y={Math.random() * 100 + 50}
                width="8"
                height="12"
                fill={Math.random() > 0.5 ? "#00d4ff" : "#ff6b35"}
                opacity={Math.random() * 0.5 + 0.3}
              />
            ))}
          </svg>
        </Box>

        {/* Runner SVG Illustration */}
        <Box
          sx={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.15,
            animation: "runnerBob 2s ease-in-out infinite",
          }}
        >
          <svg width="300" height="400" viewBox="0 0 300 400">
            {/* Male Runner Silhouette */}
            <g fill="#00d4ff">
              {/* Head */}
              <circle cx="150" cy="50" r="25" />
              {/* Body */}
              <path d="M150,75 L150,180 L140,180 L140,75 Z" />
              {/* Arms */}
              <path d="M145,90 L120,130 L130,135 L150,100 Z" />
              <path d="M155,90 L180,120 L170,125 L150,100 Z" />
              {/* Legs */}
              <path d="M145,180 L120,260 L135,265 L150,190 Z" />
              <path d="M155,180 L180,250 L165,255 L150,190 Z" />
            </g>
          </svg>
        </Box>

        {/* Glowing Road */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(to top, rgba(0, 212, 255, 0.2) 0%, transparent 100%)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              background: "repeating-linear-gradient(90deg, #00d4ff 0px, #00d4ff 40px, transparent 40px, transparent 80px)",
              animation: "roadMove 2s linear infinite",
            },
          }}
        />

        {/* Floating Particles */}
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
            }}
          />
        ))}

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        />
      </Box>

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
                {[
                  { icon: <GoogleIcon />, color: "#db4437" },
                  { icon: <AppleIcon />, color: "#ffffff" },
                  { icon: <FacebookIcon />, color: "#4267B2" },
                ].map((social, idx) => (
                  <IconButton
                    key={idx}
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
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes moonGlow {
          0%, 100% { 
            boxShadow: 0 0 60px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.3);
          }
          50% { 
            boxShadow: 0 0 80px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 215, 0, 0.5);
          }
        }
        
        @keyframes runnerBob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-20px); }
        }
        
        @keyframes roadMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
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
