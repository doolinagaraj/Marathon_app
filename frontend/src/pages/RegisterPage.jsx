import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
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
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await register({ email, password, username });
      setMsg("Registration successful! You can now login.");
      // Redirect to login after 2 seconds
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
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 460 }}>
        <Stack spacing={2} component="form" onSubmit={onSubmit}>
          <Typography variant="h5">Register</Typography>
          {msg ? <Alert severity="success">{msg}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

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
        </Stack>
      </Paper>
    </Box>
  );
}

