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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // ensure any existing session is cleared
      logout();
      const r = await api.adminLogin({ email, password });
      setSession(r.token, r.user);
      nav("/admin");
    } catch (err) {
      setError(err?.message ?? "Admin login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 520 }}>
        <Stack spacing={2} component="form" onSubmit={handleLogin}>
          <Typography variant="h5">Admin Login</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}

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
            {busy ? "Logging in..." : "Login"}
          </Button>
          <Typography variant="body2">
            Not an admin? <RouterLink to="/login">User Login</RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
