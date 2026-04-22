import React, { useState } from "react";
import { Box, Checkbox, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuthExperience from "../components/auth/AuthExperience.jsx";
import { useAuth } from "../lib/auth.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await login(email, password, undefined, { remember: rememberMe });
      nav(r.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthExperience
      mode="login"
      title="Welcome Back"
      subtitle="Sign in to continue your journey"
      actionLabel="Sign In"
      error={error}
      onSubmit={onSubmit}
      busy={busy}
    >
      <Stack spacing={2.2}>
        <TextField
          label="Email or Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoComplete="username"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleOutlinedIcon />
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
          fullWidth
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{ color: "rgba(255,255,255,0.68)", "&.Mui-checked": { color: "var(--accent)" } }}
              />
            }
            label={<Typography variant="body2">Remember me</Typography>}
            sx={{ mr: 0 }}
          />
          <RouterLink className="link-action" to="/forgot-password">
            Forgot Password?
          </RouterLink>
        </Box>
      </Stack>
    </AuthExperience>
  );
}
