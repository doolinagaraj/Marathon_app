import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import { Link as RouterLink } from "react-router-dom";

const socialLinks = {
  google: "https://accounts.google.com/signin",
  apple: "https://appleid.apple.com/sign-in",
  facebook: "https://www.facebook.com/login"
};

const socialIcons = [
  { key: "google", icon: <GoogleIcon />, label: "Google" },
  { key: "apple", icon: <AppleIcon />, label: "Apple" },
  { key: "facebook", icon: <FacebookIcon />, label: "Facebook" }
];

function AnimatedBackground({ mode }) {
  const loginMode = mode === "login";
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: loginMode
          ? "radial-gradient(circle at 20% 10%, rgba(24,124,255,0.35), transparent 35%), linear-gradient(180deg, #051226 0%, #02060f 65%, #000 100%)"
          : "radial-gradient(circle at 70% 14%, rgba(105,255,167,0.45), transparent 35%), linear-gradient(180deg, #042013 0%, #051811 48%, #03040a 100%)"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: loginMode
            ? "linear-gradient(180deg, rgba(0,156,255,0.12) 0%, rgba(4,12,32,0.58) 60%, rgba(0,0,0,0.9) 100%)"
            : "linear-gradient(180deg, rgba(0,255,170,0.12) 0%, rgba(10,26,19,0.58) 60%, rgba(0,0,0,0.9) 100%)"
        }}
      />

      {Array.from({ length: 18 }).map((_, i) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          sx={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            bgcolor: loginMode ? "#45c2ff" : "#7cfbb9",
            left: `${(i * 19) % 100}%`,
            top: `${(i * 11) % 100}%`,
            boxShadow: `0 0 14px ${loginMode ? "#00b7ff" : "#49ffbf"}`,
            animation: `float${i % 4} ${4 + (i % 5)}s ease-in-out infinite`
          }}
        />
      ))}

      <Box
        sx={{
          position: "absolute",
          bottom: loginMode ? "16%" : "19%",
          left: 0,
          right: 0,
          height: 190,
          background: loginMode
            ? "linear-gradient(180deg, rgba(0,159,255,0) 0%, rgba(0,129,255,0.25) 100%)"
            : "linear-gradient(180deg, rgba(89,255,170,0) 0%, rgba(166,85,255,0.3) 100%)",
          clipPath: loginMode
            ? "polygon(0 80%, 15% 68%, 30% 74%, 55% 62%, 77% 66%, 100% 56%, 100% 100%, 0 100%)"
            : "polygon(0 85%, 22% 75%, 43% 70%, 70% 72%, 100% 58%, 100% 100%, 0 100%)",
          animation: "parallax 9s ease-in-out infinite"
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "14%",
          left: loginMode ? "8%" : "auto",
          right: loginMode ? "auto" : "8%",
          textAlign: loginMode ? "left" : "right",
          animation: "floatTitle 5s ease-in-out infinite"
        }}
      >
        <Typography sx={{ fontSize: { xs: 34, sm: 44 }, fontWeight: 900, lineHeight: 1.1, letterSpacing: 1, color: "#fff" }}>
          {loginMode ? "CHASE" : "RUN"}
          <br />
          {loginMode ? "YOUR" : "BELIEVE"}
          <br />
          <Box component="span" sx={{ color: loginMode ? "#0dc6ff" : "#42ffb5" }}>
            {loginMode ? "BEST" : "ACHIEVE"}
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: "13%",
          right: loginMode ? "10%" : "52%",
          transform: loginMode ? "none" : "translateX(50%)",
          width: 82,
          height: 82,
          borderRadius: "50%",
          border: `3px solid ${loginMode ? "rgba(66,204,255,0.8)" : "rgba(94,255,173,0.8)"}`,
          boxShadow: `0 0 35px ${loginMode ? "rgba(35,201,255,0.45)" : "rgba(73,255,178,0.45)"}`,
          animation: "moonPulse 4s ease-in-out infinite"
        }}
      />

      <Box sx={{ position: "absolute", bottom: "2%", left: "6%", color: loginMode ? "#2ad5ff" : "#44ffb3", animation: "runnerMove 3s ease-in-out infinite" }}>
        <DirectionsRunRoundedIcon sx={{ fontSize: 86 }} />
      </Box>

      <Box
        sx={{
          "@keyframes float0": { "0%,100%": { transform: "translateY(0)", opacity: 0.3 }, "50%": { transform: "translateY(-18px)", opacity: 0.95 } },
          "@keyframes float1": { "0%,100%": { transform: "translateY(0)", opacity: 0.2 }, "50%": { transform: "translateY(-23px)", opacity: 0.9 } },
          "@keyframes float2": { "0%,100%": { transform: "translateY(0)", opacity: 0.25 }, "50%": { transform: "translateY(-16px)", opacity: 0.88 } },
          "@keyframes float3": { "0%,100%": { transform: "translateY(0)", opacity: 0.2 }, "50%": { transform: "translateY(-20px)", opacity: 0.82 } },
          "@keyframes parallax": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(10px)" } },
          "@keyframes floatTitle": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
          "@keyframes moonPulse": { "0%,100%": { transform: "scale(1)", opacity: 0.8 }, "50%": { transform: "scale(1.08)", opacity: 1 } },
          "@keyframes runnerMove": { "0%,100%": { transform: "translateX(0)" }, "50%": { transform: "translateX(8px)" } }
        }}
      />
    </Box>
  );
}

export default function AuthShell({ mode, title, subtitle, form, footer, onSubmit, busy, remember, setRemember, forgotHref }) {
  const loginMode = mode === "login";

  return (
    <Box sx={{ minHeight: { xs: "100dvh", md: "100vh" }, position: "relative", display: "flex", justifyContent: "center" }}>
      <AnimatedBackground mode={mode} />
      <Box sx={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 480, px: 2, py: 2.5, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, letterSpacing: 0.6, fontSize: 28 }}>EVERNORTH RC</Typography>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/login" sx={{ color: "#fff", borderRadius: 3, border: loginMode ? "1px solid #10c5ff" : "1px solid transparent", boxShadow: loginMode ? "0 0 20px rgba(16,197,255,0.5)" : "none" }}>
              Login
            </Button>
            <Button component={RouterLink} to="/register" sx={{ color: "#fff", borderRadius: 3, border: !loginMode ? "1px solid #38ff9a" : "1px solid transparent", boxShadow: !loginMode ? "0 0 20px rgba(56,255,154,0.45)" : "none" }}>
              Register
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", pb: { xs: 3, md: 5 } }}>
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              width: "100%",
              borderRadius: 6,
              p: 3,
              backdropFilter: "blur(20px)",
              background: loginMode ? "linear-gradient(180deg, rgba(7,20,47,0.75), rgba(4,8,26,0.7))" : "linear-gradient(180deg, rgba(7,33,24,0.75), rgba(10,12,26,0.7))",
              border: `1px solid ${loginMode ? "rgba(59,203,255,0.65)" : "rgba(70,255,166,0.65)"}`,
              boxShadow: loginMode ? "0 24px 40px rgba(0,0,0,0.6), 0 0 36px rgba(37,177,255,0.35)" : "0 24px 40px rgba(0,0,0,0.6), 0 0 36px rgba(80,255,163,0.3)",
              animation: "cardIn 0.45s ease-out",
              "@keyframes cardIn": { from: { opacity: 0, transform: "translateY(28px)" }, to: { opacity: 1, transform: "translateY(0)" } }
            }}
          >
            <Stack spacing={2.2}>
              <Stack alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    bgcolor: loginMode ? "rgba(4,155,255,0.2)" : "rgba(16,255,171,0.18)",
                    color: loginMode ? "#2cd1ff" : "#37ffad",
                    display: "grid",
                    placeItems: "center"
                  }}
                >
                  {loginMode ? <DirectionsRunRoundedIcon /> : <EmojiEventsRoundedIcon />}
                </Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: 34, sm: 38 } }}>
                  {title}
                </Typography>
                <Typography sx={{ color: "rgba(223,232,255,0.84)", textAlign: "center" }}>{subtitle}</Typography>
              </Stack>

              {form}

              {loginMode ? (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} sx={{ color: "#56cdff" }} />}
                    label={<Typography sx={{ color: "#cde8ff" }}>Remember me</Typography>}
                  />
                  <Typography component={RouterLink} to={forgotHref} sx={{ color: "#33cfff", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                    Forgot Password?
                  </Typography>
                </Stack>
              ) : null}

              <Button
                type="submit"
                disabled={busy}
                sx={{
                  borderRadius: 3,
                  py: 1.4,
                  fontSize: 32,
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#021018",
                  background: loginMode ? "linear-gradient(120deg, #18a8ff 0%, #28d7ff 50%, #3ff4ff 100%)" : "linear-gradient(120deg, #14f7b4 0%, #43dfd2 52%, #973cff 100%)",
                  boxShadow: loginMode ? "0 12px 26px rgba(23,200,255,0.4)" : "0 12px 26px rgba(67,223,210,0.38)",
                  animation: "pulseGlow 3s ease-in-out infinite",
                  "&:active": { transform: "scale(0.98)" },
                  "@keyframes pulseGlow": {
                    "0%, 100%": { filter: "brightness(1)" },
                    "50%": { filter: "brightness(1.15)" }
                  }
                }}
              >
                {busy ? (loginMode ? "Signing in..." : "Creating...") : loginMode ? "Sign In" : "Create Account"}
              </Button>

              <Stack spacing={1.3}>
                <Divider sx={{ color: "rgba(202,221,255,0.8)", "&::before, &::after": { borderColor: "rgba(202,221,255,0.3)" } }}>or continue with</Divider>
                <Stack direction="row" justifyContent="center" spacing={2}>
                  {socialIcons.map((item) => (
                    <IconButton
                      key={item.key}
                      aria-label={item.label}
                      onClick={() => window.open(socialLinks[item.key], "_blank", "noopener,noreferrer")}
                      sx={{
                        width: 54,
                        height: 54,
                        border: "1px solid rgba(163,193,255,0.35)",
                        bgcolor: "rgba(9,17,33,0.55)",
                        color: "#fff",
                        transition: "all 0.2s ease",
                        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 20px rgba(0,0,0,0.4)" },
                        "&:active": { transform: "scale(0.9)" }
                      }}
                    >
                      {item.icon}
                    </IconButton>
                  ))}
                </Stack>
              </Stack>

              {footer}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
