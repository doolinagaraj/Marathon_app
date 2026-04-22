import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function AdminLoginPage() {
  const nav = useNavigate();
  const { logout, setSession } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function start(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      // ensure any existing session is cleared
      logout();
      const r = await api.adminLoginStart({ email, password });
      setChallengeId(r.challengeId);
      setStep(2);
      setMsg("OTP sent to your email. Enter it to continue.");
    } catch (err) {
      setError(err?.message ?? "Admin login failed");
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
      const r = await api.adminLoginVerify({ challengeId, code });
      setSession(r.token, r.user);
      nav("/admin");
    } catch (err) {
      setError(err?.message ?? "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 520 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Admin Login</Typography>
          {msg ? <Alert severity="info">{msg}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {step === 1 ? (
            <Stack spacing={2} component="form" onSubmit={start}>
              <TextField label="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              <TextField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
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
                {busy ? "Sending OTP..." : "Send OTP"}
              </Button>
              <Typography variant="body2">
                <Link component={RouterLink} to="/forgot-password?from=admin">
                  Forgot or change password?
                </Link>
              </Typography>
              <Typography variant="body2">
                Not an admin? <RouterLink to="/login">User Login</RouterLink>
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} component="form" onSubmit={verify}>
              <TextField label="OTP Code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" required />
              <Button variant="contained" type="submit" disabled={busy}>
                {busy ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button variant="text" onClick={() => setStep(1)} disabled={busy}>
                Back
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
