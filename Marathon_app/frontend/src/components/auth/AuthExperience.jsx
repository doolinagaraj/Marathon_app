import React from "react";
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import runnerLottie from "./runnerLottie.js";
import { oauthRedirectUrl } from "../../lib/api.js";

const MotionBox = motion(Box);

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${12 + ((index * 23) % 76)}%`,
  size: 2 + (index % 4),
  delay: (index % 8) * 0.28,
  duration: 4 + (index % 5) * 0.6
}));

const streaks = Array.from({ length: 11 }, (_, index) => ({
  id: index,
  left: `${(index * 13) % 100}%`,
  top: `${18 + index * 6}%`,
  delay: index * 0.35
}));

const socials = [
  { provider: "google", label: "Google", icon: <GoogleIcon />, color: "#ff4d3d" },
  { provider: "apple", label: "Apple", icon: <AppleIcon />, color: "#f7fbff" },
  { provider: "facebook", label: "Facebook", icon: <FacebookIcon />, color: "#2d8cff" }
];

const sceneCopy = {
  login: {
    icon: <DirectionsRunIcon />,
    kicker: "CHASE",
    title: "YOUR BEST",
    subtitle: "Every step brings you closer",
    switchLabel: "Don't have an account?",
    switchText: "Register Now",
    switchTo: "/register"
  },
  register: {
    icon: <EmojiEventsIcon />,
    kicker: "RUN",
    title: "BELIEVE ACHIEVE",
    subtitle: "Your marathon starts here",
    switchLabel: "Already have an account?",
    switchText: "Login Here",
    switchTo: "/login"
  }
};

function SocialButtons({ mode }) {
  return (
    <Stack direction="row" spacing={1.8} justifyContent="center">
      {socials.map((social) => (
        <IconButton
          key={social.provider}
          component={motion.button}
          whileHover={{ y: -4, scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Continue with ${social.label}`}
          onClick={() => {
            window.location.assign(oauthRedirectUrl(social.provider, mode));
          }}
          sx={{
            width: 54,
            height: 54,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(4, 11, 22, 0.62)",
            color: social.color,
            boxShadow: `0 0 22px ${social.color}22`,
            transition: "border-color 180ms ease, box-shadow 180ms ease",
            "&:hover": {
              borderColor: `${social.color}88`,
              background: "rgba(7, 16, 31, 0.78)",
              boxShadow: `0 0 30px ${social.color}38`
            }
          }}
        >
          {social.icon}
        </IconButton>
      ))}
    </Stack>
  );
}

function BackgroundScene({ mode }) {
  const isLogin = mode === "login";
  const accent = isLogin ? "#08d8ff" : "#18ff93";
  const second = isLogin ? "#176dff" : "#b32bff";

  return (
    <Box className={`auth-bg auth-bg-${mode}`} aria-hidden="true">
      <MotionBox
        className="parallax-sky"
        animate={{ x: isLogin ? [-12, 12, -12] : [10, -10, 10], y: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <Box className="moon" />
      <MotionBox
        className={isLogin ? "city-line" : "mountain-line"}
        animate={{ x: isLogin ? [-18, 0, -18] : [0, -14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionBox
        className="runner-art"
        animate={{ y: [0, -10, 0], rotate: isLogin ? [0, -1, 0] : [0, 1, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lottie animationData={runnerLottie} loop autoplay />
      </MotionBox>
      <Box className="road">
        <span />
        <span />
      </Box>
      {!isLogin && <Box className="crowd" />}
      <Box className="light-rays" />
      {streaks.map((streak) => (
        <Box
          key={streak.id}
          className="streak"
          sx={{
            left: streak.left,
            top: streak.top,
            animationDelay: `${streak.delay}s`,
            background: `linear-gradient(90deg, transparent, ${accent}, ${second}, transparent)`
          }}
        />
      ))}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          className="particle"
          sx={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            background: `linear-gradient(135deg, ${accent}, ${second})`
          }}
        />
      ))}
      <Box className="shade" />
    </Box>
  );
}

export default function AuthExperience({ mode, title, subtitle, actionLabel, error, success, children, onSubmit, busy }) {
  const isLogin = mode === "login";
  const accent = isLogin ? "#08d8ff" : "#18ff93";
  const second = isLogin ? "#198dff" : "#b52dff";
  const copy = sceneCopy[mode];

  return (
    <Box className={`auth-screen auth-${mode}`}>
      <BackgroundScene mode={mode} />
      <Box className="auth-brand">
        <Typography component={RouterLink} to="/" variant="h6">
          EVERNORTH RC
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/login" className={isLogin ? "active" : ""}>
            Login
          </Button>
          <Button component={RouterLink} to="/register" className={!isLogin ? "active" : ""}>
            Register
          </Button>
        </Stack>
      </Box>

      <MotionBox
        className="hero-copy"
        initial={{ opacity: 0, x: isLogin ? 24 : -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, delay: 0.1 }}
      >
        <Typography component="p">{copy.kicker}</Typography>
        <Typography component="h1">{copy.title}</Typography>
        <Box />
        <Typography component="span">{copy.subtitle}</Typography>
      </MotionBox>

      <MotionBox
        component="form"
        onSubmit={onSubmit}
        className="auth-card"
        initial={{ opacity: 0, y: 54, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: isLogin ? -80 : 80 }}
        transition={{ type: "spring", stiffness: 118, damping: 18 }}
      >
        <Stack spacing={2.4}>
          <Box className="card-heading">
            <Box className="card-icon">{copy.icon}</Box>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="body2">{subtitle}</Typography>
          </Box>

          {success && <Box className="auth-alert success">{success}</Box>}
          {error && <Box className="auth-alert error">{error}</Box>}

          {children}

          <Button
            type="submit"
            fullWidth
            disabled={busy}
            component={motion.button}
            whileTap={{ scale: 0.97 }}
            className="primary-action"
          >
            {busy ? (isLogin ? "Signing in..." : "Creating Account...") : actionLabel}
          </Button>

          <Divider className="social-divider">or continue with</Divider>
          <SocialButtons mode={mode} />

          <Typography className="switch-copy" variant="body2">
            {copy.switchLabel}{" "}
            <RouterLink to={copy.switchTo}>{copy.switchText}</RouterLink>
          </Typography>
        </Stack>
      </MotionBox>

      <style>{`
        .auth-screen {
          --accent: ${accent};
          --second: ${second};
          min-height: 100svh;
          position: relative;
          overflow: hidden;
          color: #fff;
          background: #02050a;
          display: grid;
          grid-template-rows: auto minmax(220px, 0.78fr) auto;
          padding: max(14px, env(safe-area-inset-top)) 16px max(22px, env(safe-area-inset-bottom));
        }

        .auth-bg, .auth-bg > * {
          position: absolute;
          inset: 0;
        }

        .auth-bg-login {
          background: linear-gradient(180deg, #06142c 0%, #02050c 58%, #000 100%);
        }

        .auth-bg-register {
          background: linear-gradient(180deg, #062118 0%, #050713 56%, #000 100%);
        }

        .parallax-sky {
          inset: -7%;
          background:
            radial-gradient(circle at 76% 12%, color-mix(in srgb, var(--accent) 48%, transparent), transparent 8%),
            radial-gradient(circle at 30% 28%, color-mix(in srgb, var(--second) 26%, transparent), transparent 15%),
            radial-gradient(circle at 50% 8%, rgba(255,255,255,0.28), transparent 0.9%),
            radial-gradient(circle at 11% 20%, rgba(255,255,255,0.22), transparent 0.8%),
            radial-gradient(circle at 88% 34%, rgba(255,255,255,0.2), transparent 0.7%);
          opacity: 0.95;
        }

        .moon {
          width: clamp(72px, 24vw, 180px);
          height: clamp(72px, 24vw, 180px);
          border-radius: 999px;
          top: 88px;
          left: auto;
          right: 10%;
          background: radial-gradient(circle, #e9fbff 0 28%, var(--accent) 42%, transparent 70%);
          filter: blur(0.1px);
          box-shadow: 0 0 80px color-mix(in srgb, var(--accent) 58%, transparent);
          animation: moonPulse 4.2s ease-in-out infinite;
        }

        .auth-register .moon {
          left: 42%;
          right: auto;
          background: radial-gradient(circle, #d6ffd7 0 28%, #6eff93 42%, #9736ff 68%, transparent 72%);
        }

        .city-line {
          top: auto;
          height: 38%;
          background:
            linear-gradient(to top, #02040a 10%, transparent),
            linear-gradient(90deg, transparent 0 6%, #071020 6% 12%, transparent 12% 16%, #081329 16% 25%, transparent 25% 31%, #071020 31% 42%, transparent 42% 48%, #0a1430 48% 62%, transparent 62% 70%, #071020 70% 82%, transparent 82%);
          clip-path: polygon(0 70%, 7% 58%, 7% 42%, 14% 42%, 14% 62%, 21% 62%, 21% 32%, 30% 32%, 30% 55%, 39% 55%, 39% 28%, 48% 28%, 48% 64%, 58% 64%, 58% 36%, 68% 36%, 68% 60%, 77% 60%, 77% 24%, 88% 24%, 88% 56%, 100% 68%, 100% 100%, 0 100%);
          opacity: 0.8;
        }

        .mountain-line {
          top: auto;
          height: 44%;
          background: linear-gradient(to top, #010503 18%, rgba(2,16,13,0.84), transparent);
          clip-path: polygon(0 66%, 8% 48%, 17% 56%, 29% 26%, 40% 58%, 52% 35%, 62% 62%, 74% 28%, 86% 54%, 100% 32%, 100% 100%, 0 100%);
          opacity: 0.86;
        }

        .runner-art {
          width: clamp(220px, 68vw, 470px);
          height: clamp(220px, 68vw, 470px);
          top: 15%;
          left: 5%;
          right: auto;
          bottom: auto;
          filter: drop-shadow(0 0 24px color-mix(in srgb, var(--accent) 66%, transparent));
          opacity: 0.64;
        }

        .auth-register .runner-art {
          left: auto;
          right: 3%;
          transform: scaleX(-1);
        }

        .road {
          top: auto;
          height: 30%;
          background:
            linear-gradient(to top, rgba(0,0,0,0.86), transparent),
            repeating-linear-gradient(112deg, color-mix(in srgb, var(--accent) 75%, transparent) 0 4px, transparent 4px 34px);
          clip-path: polygon(0 46%, 100% 18%, 100% 100%, 0 100%);
          opacity: 0.72;
        }

        .road span {
          position: absolute;
          left: -20%;
          right: -20%;
          height: 3px;
          top: 35%;
          background: linear-gradient(90deg, transparent, var(--accent), var(--second), transparent);
          transform: rotate(-9deg);
          animation: roadFlow 1.8s linear infinite;
          box-shadow: 0 0 18px var(--accent);
        }

        .road span + span {
          top: 56%;
          animation-delay: 0.5s;
          opacity: 0.72;
        }

        .crowd {
          top: auto;
          height: 13%;
          background:
            radial-gradient(circle at 7% 55%, #020308 0 10px, transparent 11px),
            radial-gradient(circle at 18% 48%, #020308 0 14px, transparent 15px),
            radial-gradient(circle at 30% 52%, #020308 0 11px, transparent 12px),
            radial-gradient(circle at 47% 42%, #020308 0 16px, transparent 17px),
            radial-gradient(circle at 64% 52%, #020308 0 13px, transparent 14px),
            radial-gradient(circle at 78% 46%, #020308 0 15px, transparent 16px),
            radial-gradient(circle at 92% 55%, #020308 0 12px, transparent 13px),
            linear-gradient(to top, #000 0 62%, transparent);
          opacity: 0.9;
        }

        .light-rays {
          inset: -20%;
          background: conic-gradient(from 210deg at 50% 45%, transparent, color-mix(in srgb, var(--accent) 14%, transparent), transparent 19%, color-mix(in srgb, var(--second) 13%, transparent), transparent 32%);
          animation: rayDrift 9s ease-in-out infinite;
          opacity: 0.55;
        }

        .streak {
          height: 2px;
          width: 42vw;
          border-radius: 99px;
          animation: streakMove 3.6s linear infinite;
          opacity: 0.55;
          filter: blur(0.3px);
        }

        .particle {
          border-radius: 999px;
          box-shadow: 0 0 14px var(--accent);
          animation: particleFloat 4s ease-in-out infinite;
          opacity: 0.72;
        }

        .shade {
          background:
            linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.9)),
            radial-gradient(circle at 50% 58%, transparent 0 20%, rgba(0,0,0,0.62) 76%);
        }

        .auth-brand {
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 48px;
        }

        .auth-brand a {
          color: #fff;
          text-decoration: none;
          font-weight: 800;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .auth-brand .MuiButton-root {
          color: #fff;
          min-width: 0;
          border-radius: 14px;
          padding: 8px 12px;
          border: 1px solid transparent;
        }

        .auth-brand .MuiButton-root.active {
          border-color: var(--accent);
          box-shadow: 0 0 22px color-mix(in srgb, var(--accent) 30%, transparent);
        }

        .hero-copy {
          z-index: 1;
          align-self: center;
          justify-self: end;
          width: min(44vw, 260px);
          margin-right: 3%;
          text-align: left;
          text-shadow: 0 3px 18px rgba(0,0,0,0.85);
        }

        .auth-register .hero-copy {
          justify-self: end;
        }

        .hero-copy p, .hero-copy h1 {
          margin: 0;
          font-weight: 950;
          font-style: italic;
          line-height: 0.98;
          letter-spacing: 0;
        }

        .hero-copy p {
          font-size: clamp(1.6rem, 7vw, 4rem);
        }

        .hero-copy h1 {
          margin-top: 4px;
          font-size: clamp(1.55rem, 7vw, 4rem);
          color: var(--accent);
          max-width: 8ch;
        }

        .hero-copy div {
          width: 58px;
          height: 4px;
          border-radius: 99px;
          background: var(--accent);
          box-shadow: 0 0 18px var(--accent);
          margin: 18px 0;
        }

        .hero-copy span {
          display: block;
          max-width: 14ch;
          font-size: clamp(0.95rem, 3vw, 1.15rem);
          line-height: 1.3;
        }

        .auth-card {
          z-index: 2;
          width: min(100%, 430px);
          justify-self: center;
          border-radius: 28px;
          padding: clamp(24px, 7vw, 36px);
          background: linear-gradient(145deg, rgba(9,18,32,0.72), rgba(2,8,18,0.56));
          border: 1px solid color-mix(in srgb, var(--accent) 46%, rgba(255,255,255,0.12));
          box-shadow:
            0 28px 80px rgba(0,0,0,0.62),
            0 0 36px color-mix(in srgb, var(--accent) 22%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.14);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .card-heading {
          text-align: center;
        }

        .card-icon {
          width: 58px;
          height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          border-radius: 20px;
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          filter: drop-shadow(0 0 16px var(--accent));
          animation: iconPulse 2.2s ease-in-out infinite;
        }

        .card-icon svg {
          font-size: 42px;
        }

        .card-heading h4 {
          margin-top: 12px;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: 0;
        }

        .card-heading p {
          color: rgba(255,255,255,0.72);
          margin-top: 4px;
        }

        .auth-alert {
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 0.9rem;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .auth-alert.success {
          background: rgba(24, 255, 147, 0.12);
          color: #baffdf;
        }

        .auth-alert.error {
          background: rgba(255, 61, 100, 0.13);
          color: #ffd2dc;
        }

        .auth-card .MuiTextField-root .MuiOutlinedInput-root {
          min-height: 64px;
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          transition: box-shadow 180ms ease, background 180ms ease, transform 180ms ease;
        }

        .auth-card .MuiTextField-root .MuiOutlinedInput-root:hover,
        .auth-card .MuiTextField-root .MuiOutlinedInput-root.Mui-focused {
          background: rgba(255,255,255,0.075);
          box-shadow: 0 0 26px color-mix(in srgb, var(--accent) 35%, transparent);
        }

        .auth-card .MuiOutlinedInput-notchedOutline {
          border-color: rgba(255,255,255,0.22);
        }

        .auth-card .Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: var(--accent);
        }

        .auth-card .MuiInputLabel-root.Mui-focused,
        .auth-card .MuiInputAdornment-root svg {
          color: var(--accent);
        }

        .link-action {
          color: var(--accent);
          text-decoration: none;
          position: relative;
          font-weight: 700;
        }

        .link-action::after,
        .switch-copy a::after {
          content: "";
          position: absolute;
          left: 0;
          right: 100%;
          bottom: -2px;
          height: 2px;
          background: currentColor;
          transition: right 180ms ease;
        }

        .link-action:hover::after,
        .switch-copy a:hover::after {
          right: 0;
        }

        .primary-action {
          min-height: 58px;
          border-radius: 17px;
          color: #03101b;
          font-size: 1.04rem;
          font-weight: 900;
          background-size: 220% 100%;
          background-image: linear-gradient(115deg, var(--accent), #7ee8ff, var(--second), var(--accent));
          box-shadow: 0 10px 34px color-mix(in srgb, var(--accent) 42%, transparent);
          animation: gradientShift 4s ease-in-out infinite, buttonPulse 2.6s ease-in-out infinite;
        }

        .primary-action:hover {
          background-position: 100% 0;
          box-shadow: 0 14px 46px color-mix(in srgb, var(--accent) 56%, transparent);
        }

        .social-divider {
          color: rgba(255,255,255,0.7);
          font-size: 0.92rem;
        }

        .social-divider::before,
        .social-divider::after {
          border-color: rgba(255,255,255,0.18);
        }

        .switch-copy {
          text-align: center;
          color: rgba(255,255,255,0.74);
        }

        .switch-copy a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 800;
          position: relative;
          white-space: nowrap;
        }

        @keyframes moonPulse {
          0%, 100% { transform: scale(1); opacity: 0.84; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes roadFlow {
          from { transform: translateX(12%) rotate(-9deg); }
          to { transform: translateX(-18%) rotate(-9deg); }
        }

        @keyframes rayDrift {
          0%, 100% { transform: translateX(-2%) rotate(0deg); opacity: 0.34; }
          50% { transform: translateX(3%) rotate(4deg); opacity: 0.62; }
        }

        @keyframes streakMove {
          from { transform: translateX(80vw) rotate(-12deg); opacity: 0; }
          18% { opacity: 0.72; }
          to { transform: translateX(-80vw) rotate(-12deg); opacity: 0; }
        }

        @keyframes particleFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(12px, -28px, 0); }
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes buttonPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.12); }
        }

        @media (min-width: 760px) {
          .auth-screen {
            grid-template-columns: minmax(320px, 1fr) minmax(420px, 520px);
            grid-template-rows: auto 1fr;
            column-gap: clamp(30px, 7vw, 110px);
            padding: 18px clamp(32px, 6vw, 90px) 34px;
          }

          .auth-brand {
            grid-column: 1 / -1;
          }

          .hero-copy {
            grid-column: 1;
            grid-row: 2;
            justify-self: center;
            align-self: center;
            width: min(78%, 420px);
            margin: 0;
          }

          .auth-card {
            grid-column: 2;
            grid-row: 2;
            align-self: center;
          }

          .runner-art {
            left: 12%;
            top: 20%;
            opacity: 0.72;
          }

          .auth-register .runner-art {
            right: 18%;
          }
        }

        @media (max-width: 390px) {
          .auth-screen {
            padding-left: 12px;
            padding-right: 12px;
          }

          .auth-brand a {
            font-size: 0.92rem;
          }

          .auth-brand .MuiButton-root {
            padding-left: 9px;
            padding-right: 9px;
          }

          .auth-card {
            padding: 22px;
            border-radius: 24px;
          }
        }
      `}</style>
    </Box>
  );
}
