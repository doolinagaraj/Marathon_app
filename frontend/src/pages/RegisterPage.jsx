import React, { useState } from "react";
import { Alert, InputAdornment, Link, Stack, TextField, IconButton, Typography, Button } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import AuthShell from "../components/auth/AuthShell.jsx";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    color: "#ddffee",
    background: "rgba(10,29,22,0.52)",
    "& fieldset": { borderColor: "rgba(136,255,203,0.35)" },
    "&:hover fieldset": { borderColor: "#56ffbe" },
    "&.Mui-focused fieldset": { borderColor: "#37ffae", boxShadow: "0 0 12px rgba(55,255,174,0.35)" }
  },
  "& .MuiInputLabel-root": { color: "rgba(197,255,231,0.84)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4df6b5" }
};

export default function RegisterPage() {
  const { register, login, setSession } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      const r = await register({ email, password, username });
      if (r?.challengeId) {
        setChallengeId(r.challengeId);
        setStep(2);
        setMsg("Verification code sent to your email. Enter it to continue.");
      } else {
        setMsg("Registered. You can now login.");
      }
    } catch (err) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await api.verifyEmailOtp({ challengeId, code });
      const idToUse = username || email;
      try {
        const r = await login(idToUse, password);
        setSession(r.token, r.user);
        nav(r.user.role === "admin" ? "/admin" : "/");
        return;
      } catch (lerr) {
        setMsg("Email verified. Please login to continue.");
      }
      setStep(1);
      setCode("");
      setChallengeId("");
    } catch (err) {
      setError(err?.message ?? "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      mode="register"
      title="Create Account"
      subtitle="Join thousands of runners worldwide"
      onSubmit={step === 1 ? onSubmit : verify}
      busy={busy}
      form={
        <Stack spacing={2}>
          {msg ? <Alert severity="success">{msg}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {step === 1 ? (
            <>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon sx={{ color: "#5dffc2" }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailRoundedIcon sx={{ color: "#5dffc2" }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                inputProps={{ minLength: 8 }}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#5dffc2" }} />
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
            </>
          ) : (
            <>
              <TextField label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" required sx={fieldSx} />
              <Button variant="text" onClick={() => setStep(1)} disabled={busy} sx={{ color: "#9df6d1", textTransform: "none", justifyContent: "flex-start" }}>
                Back to registration
              </Button>
            </>
          )}
        </Stack>
      }
      footer={
        <Typography sx={{ color: "rgba(218,255,238,0.92)", textAlign: "center" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" sx={{ color: "#29f0aa", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
            Login Here
          </Link>
        </Typography>
      }
    />
  );
}
