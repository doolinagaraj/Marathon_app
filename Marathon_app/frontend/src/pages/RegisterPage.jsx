import React, { useState } from "react";
import { IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import AuthExperience from "../components/auth/AuthExperience.jsx";
import { useAuth } from "../lib/auth.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
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
      setMsg("Registration successful. Redirecting to login...");
      window.setTimeout(() => nav("/login"), 1400);
    } catch (err) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthExperience
      mode="register"
      title="Create Account"
      subtitle="Join thousands of runners worldwide"
      actionLabel="Create Account"
      success={msg}
      error={error}
      onSubmit={onSubmit}
      busy={busy}
    >
      <Stack spacing={2.2}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          fullWidth
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailOutlinedIcon />
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
          fullWidth
          autoComplete="new-password"
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
      </Stack>
    </AuthExperience>
  );
}
