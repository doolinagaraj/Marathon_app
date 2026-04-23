import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        height: "100%",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
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
          background: "linear-gradient(135deg, #0a1a0a 0%, #000000 50%, #0a2818 100%)",
          zIndex: 0,
        }}
      >
        {/* Stars */}
        {[...Array(25)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              backgroundColor: "#fff",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Neon Moon */}
        <Box
          sx={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "radial-gradient(circle, #00ff88 0%, #9c27b0 40%, transparent 70%)",
            boxShadow: "0 0 80px rgba(0, 255, 136, 0.6), 0 0 120px rgba(156, 39, 176, 0.4)",
            animation: "moonGlow 4s ease-in-out infinite",
          }}
        />

        {/* Mountain Silhouettes */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 300,
          }}
        >
          <svg
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}
          >
            {/* Mountains */}
            <path
              d="M0,300 L0,200 L100,150 L200,180 L300,100 L400,160 L500,120 L600,170 L700,90 L800,150 L900,110 L1000,180 L1100,130 L1200,200 L1200,300 Z"
              fill="#0a1a0a"
              opacity="0.8"
            />
            <path
              d="M0,300 L0,250 L150,220 L300,240 L450,200 L600,230 L750,210 L900,240 L1050,220 L1200,250 L1200,300 Z"
              fill="#051005"
            />
          </svg>
        </Box>

        {/* Female Runner SVG */}
        <Box
          sx={{
            position: "absolute",
            bottom: 120,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.15,
            animation: "runnerBob 2s ease-in-out infinite",
          }}
        >
          <svg width="280" height="380" viewBox="0 0 280 380">
            {/* Female Runner Silhouette */}
            <g fill="#00ff88">
              {/* Head with ponytail */}
              <circle cx="140" cy="50" r="25" />
              <path d="M140,25 L130,10 L145,15 Z" />
              {/* Body */}
              <path d="M140,75 L140,170 L130,170 L130,75 Z" />
              {/* Arms */}
              <path d="M135,85 L110,125 L120,130 L140,95 Z" />
              <path d="M145,85 L170,115 L160,120 L140,95 Z" />
              {/* Legs */}
              <path d="M135,170 L110,250 L125,255 L140,180 Z" />
              <path d="M145,170 L170,240 L155,245 L140,180 Z" />
            </g>
          </svg>
        </Box>

        {/* Crowd Silhouettes */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to top, #000 0%, transparent 100%)",
          }}
        >
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                bottom: 0,
                left: `${i * 5 + Math.random() * 3}%`,
                width: 20,
                height: 40 + Math.random() * 20,
                backgroundColor: "#0a0a1a",
                borderRadius: "50% 50% 0 0",
                opacity: 0.6,
              }}
            />
          ))}
        </Box>

        {/* Glowing Trail */}
        <Box
          sx={{
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to top, rgba(0, 255, 136, 0.2) 0%, transparent 100%)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              background: "repeating-linear-gradient(90deg, #00ff88 0px, #00ff88 40px, transparent 40px, transparent 80px)",
              animation: "roadMove 2s linear infinite",
            },
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              background: `linear-gradient(135deg, #00ff88, #9c27b0)`,
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Fog Effect */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 150,
            background: "linear-gradient(to top, rgba(0, 255, 136, 0.1) 0%, transparent 100%)",
            animation: "fogMove 8s ease-in-out infinite",
          }}
        />

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

      {/* Content Container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexDirection: { xs: "column", md: "row-reverse" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 4, md: 8 },
          mt: { xs: 8, md: 0 },
        }}
      >
        {/* Title Section */}
        <Box
          sx={{
            textAlign: { xs: "right", md: "right" },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-end", md: "flex-end" },
            justifyContent: "center",
            width: "100%",
            animation: "cardSlideUp 0.6s ease-out",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontStyle: "italic",
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "0.05em",
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
            }}
          >
            RUN
            <br />
            BELIEVE
            <br />
            <Box component="span" sx={{ color: "#00ff88", textShadow: "0 0 20px rgba(0,255,136,0.5)" }}>
              ACHIEVE
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.8)",
              mt: 2,
              fontWeight: 400,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Your marathon starts here
          </Typography>
        </Box>

        {/* Glass Card */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            animation: "cardSlideUp 0.6s ease-out 0.2s both",
            mb: { xs: 4, md: 0 },
          }}
        >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            borderRadius: 4,
            border: "1px solid rgba(0, 255, 136, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 255, 136, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
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
                  background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(156, 39, 176, 0.2))",
                  mb: 2,
                  animation: "iconPulse 2s ease-in-out infinite",
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 48, color: "#00ff88" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join the running community
              </Typography>
            </Box>

            {msg && <Alert severity="success" sx={{ borderRadius: 2 }}>{msg}</Alert>}
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            {/* Username Input */}
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 30px rgba(0, 255, 136, 0.5)",
                    borderColor: "#00ff88",
                  },
                },
              }}
            />

            {/* Email Input */}
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 30px rgba(0, 255, 136, 0.5)",
                    borderColor: "#00ff88",
                  },
                },
              }}
            />

            {/* Password Input */}
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
                    boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 30px rgba(0, 255, 136, 0.5)",
                    borderColor: "#00ff88",
                  },
                },
              }}
            />

            {/* Register Button */}
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
                boxShadow: "0 4px 20px rgba(0, 255, 136, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 30px rgba(0, 255, 136, 0.6)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {busy ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Social Login */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Or sign up with
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

            {/* Login Link */}
            <Box textAlign="center" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <RouterLink
                  to="/login"
                  style={{
                    color: "#00ff88",
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                >
                  Login Here
                </RouterLink>
              </Typography>
            </Box>
          </Stack>
        </Box>
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
            boxShadow: 0 0 80px rgba(0, 255, 136, 0.6), 0 0 120px rgba(156, 39, 176, 0.4);
          }
          50% { 
            boxShadow: 0 0 100px rgba(0, 255, 136, 0.8), 0 0 150px rgba(156, 39, 176, 0.6);
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
        
        @keyframes fogMove {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Box>
  );
}
