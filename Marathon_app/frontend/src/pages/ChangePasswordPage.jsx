import React, { useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";

function PasswordField({ label, value, onChange, required = true }) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={show ? "text" : "password"}
      required={required}
      inputProps={{ minLength: 8 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label={`toggle ${label.toLowerCase()} visibility`}>
              {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  );
}

export default function ChangePasswordPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const isLoggedIn = Boolean(token);
  const returnPath = searchParams.get("from") === "admin" ? "/admin-login" : "/login";
  const returnLabel = searchParams.get("from") === "admin" ? "Admin sign in" : "Sign in";

  function validateNewPassword() {
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return false;
    }
    return true;
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateNewPassword()) return;

    setBusy(true);
    try {
      await api.changePassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err?.message ?? "Could not change password");
    } finally {
      setBusy(false);
    }
  }

  async function onSendCode(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const r = await api.forgotPasswordStart({ email });
      setChallengeId(r.challengeId ?? "");
      setSuccess("If that email exists, a reset code has been sent.");
    } catch (err) {
      setError(err?.message ?? "Could not send reset code");
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateNewPassword()) return;
    if (!challengeId) {
      setError("Please request a reset code first.");
      return;
    }

    setBusy(true);
    try {
      await api.forgotPasswordVerify({ challengeId, code, newPassword });
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password reset successfully. You can now sign in.");
    } catch (err) {
      setError(err?.message ?? "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 500 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Change password</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          {isLoggedIn ? (
            <Stack spacing={2} component="form" onSubmit={onChangePassword}>
              <PasswordField label="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <PasswordField label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <PasswordField label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button variant="contained" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save password"}
              </Button>
            </Stack>
          ) : (
            <>
              <Stack spacing={2} component="form" onSubmit={onSendCode}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  type="email"
                />
                <Button variant="outlined" type="submit" disabled={busy}>
                  {busy ? "Sending..." : "Send reset code"}
                </Button>
              </Stack>

              <Stack spacing={2} component="form" onSubmit={onResetPassword}>
                <TextField label="Reset code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" required />
                <PasswordField label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <PasswordField label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button variant="contained" type="submit" disabled={busy}>
                  {busy ? "Resetting..." : "Reset password"}
                </Button>
              </Stack>

              <Typography variant="body2">
                Remembered it?{" "}
                <Link component={RouterLink} to={returnPath}>
                  {returnLabel}
                </Link>
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
