import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await login(email, password, needOtp ? otp : undefined);
      nav(r.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const msg = err?.message ?? "Login failed";
      // If server requires OTP (admin 2FA), prompt the user for it instead of failing outright.
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
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 460 }}>
        <Stack spacing={2} component="form" onSubmit={onSubmit}>
          <Typography variant="h5">Login</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            required
            type="text"
          />
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
          {needOtp ? (
            <TextField label="Admin OTP" value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" required />
          ) : null}
          <Button variant="contained" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
          <Typography variant="body2">
            <Link component={RouterLink} to="/forgot-password">
              Forgot or change password?
            </Link>
          </Typography>
          <Typography variant="body2">
            No account? <RouterLink to="/register">Register</RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
