import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
      // If backend returned a challengeId, move to verification step
      if (r?.challengeId) {
        setChallengeId(r.challengeId);
        setStep(2);
        // Show debug OTP if available (when SMTP is not configured)
        if (r.debugOtp) {
          setMsg(`Verification code: ${r.debugOtp} (Email delivery skipped)`);
        } else {
          setMsg("Verification code sent to your email. Enter it to continue.");
        }
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
      // Attempt auto-login using username (fallback to email)
      const idToUse = username ? username : email;
      try {
        const r = await login(idToUse, password);
        setSession(r.token, r.user);
        nav(r.user.role === "admin" ? "/admin" : "/");
        return;
      } catch (lerr) {
        // auto-login failed; fall back to prompt
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
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 460 }}>
        <Stack spacing={2} component="form" onSubmit={step === 1 ? onSubmit : verify}>
          <Typography variant="h5">Register</Typography>
          {msg ? <Alert severity="success">{msg}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {step === 1 ? (
            <>
              <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              <TextField
                label="Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                inputProps={{ minLength: 8 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="toggle password visibility">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button variant="contained" type="submit" disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </Button>
              <Typography variant="body2">
                Already have an account? <RouterLink to="/login">Login</RouterLink>
              </Typography>
            </>
          ) : (
            <>
              <TextField label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" required />
              <Button variant="contained" type="submit" disabled={busy}>
                {busy ? "Verifying..." : "Verify Email"}
              </Button>
              <Button variant="text" onClick={() => setStep(1)} disabled={busy}>
                Back
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

