import React, { useState } from "react";
import { Alert, InputAdornment, Link, Stack, TextField, IconButton, Typography } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AuthShell from "../components/auth/AuthShell.jsx";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    color: "#e7f5ff",
    background: "rgba(11,20,42,0.55)",
    "& fieldset": { borderColor: "rgba(130,180,224,0.4)" },
    "&:hover fieldset": { borderColor: "#49cbff" },
    "&.Mui-focused fieldset": { borderColor: "#35c8ff", boxShadow: "0 0 12px rgba(53,200,255,0.45)" }
  },
  "& .MuiInputLabel-root": { color: "rgba(207,236,255,0.82)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#64d7ff" }
};

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await login(email, password, needOtp ? otp : undefined);
      nav(r.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const msg = err?.message ?? "Login failed";
      if (msg === "OTP required") {
        setNeedOtp(true);
        setError("OTP required. Check your email for the code and enter it below.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Welcome Back"
      subtitle="Sign in to continue your journey"
      onSubmit={onSubmit}
      busy={busy}
      remember={remember}
      setRemember={setRemember}
      forgotHref="/forgot-password"
      form={
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            required
            type="text"
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon sx={{ color: "#4fd3ff" }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            required
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#4fd3ff" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="toggle password visibility" sx={{ color: "#fff" }}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {needOtp ? <TextField label="Admin OTP" value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" required sx={fieldSx} /> : null}
        </Stack>
      }
      footer={
        <Typography sx={{ color: "rgba(209,232,255,0.92)", textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link component={RouterLink} to="/register" sx={{ color: "#20d1ff", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
            Register Now
          </Link>
        </Typography>
      }
    />
  );
}
