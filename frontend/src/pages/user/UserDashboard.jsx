import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DirectionsRun as RunIcon,
  EmojiEvents as EventIcon,
  Leaderboard as LeaderboardIcon,
  Menu as MenuIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { api } from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";

function formatDuration(sec) {
  if (sec == null) return "-";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function UserDashboard() {
  const { token, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [latestRuns, setLatestRuns] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("events");

  async function refresh() {
    setError("");
    const r = await api.listEvents(token);
    setEvents(r.events || []);
    setRegistrations(r.registrations || []);
    const runs = {};
    await Promise.all(
      (r.events || []).map(async (e) => {
        const rr = await api.runLatest(token, e._id);
        runs[e._id] = rr.run;
      })
    );
    setLatestRuns(runs);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e?.message ?? "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update "now" every minute so button state updates live
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  async function registerEvent(eventId) {
    setBusyId(eventId);
    setError("");
    try {
      await api.registerForEvent(token, eventId);
      await refresh();
    } catch (e) {
      setError(e?.message ?? "Failed to register");
    } finally {
      setBusyId("");
    }
  }

  async function startRun(eventId) {
    setBusyId(eventId);
    setError("");
    try {
      await api.runStart(token, eventId);
      await refresh();
    } catch (e) {
      setError(e?.message ?? "Failed to start");
    } finally {
      setBusyId("");
    }
  }

  async function endRun(eventId) {
    setBusyId(eventId);
    setError("");
    try {
      await api.runEnd(token, eventId);
      await refresh();
    } catch (e) {
      setError(e?.message ?? "Failed to end");
    } finally {
      setBusyId("");
    }
  }

  // Sidebar content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)",
          color: "#0a0a0a",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {user?.username || "Runner"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.email}
        </Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={activeTab === "runs"} onClick={() => setActiveTab("runs")}>
            <ListItemIcon>
              <RunIcon sx={{ color: activeTab === "runs" ? "primary.main" : "inherit" }} />
            </ListItemIcon>
            <ListItemText primary="My Runs" primaryTypographyProps={{ fontWeight: activeTab === "runs" ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={activeTab === "events"} onClick={() => setActiveTab("events")}>
            <ListItemIcon>
              <EventIcon sx={{ color: activeTab === "events" ? "primary.main" : "inherit" }} />
            </ListItemIcon>
            <ListItemText primary="Events" primaryTypographyProps={{ fontWeight: activeTab === "events" ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={activeTab === "leaderboard"} onClick={() => setActiveTab("leaderboard")}>
            <ListItemIcon>
              <LeaderboardIcon sx={{ color: activeTab === "leaderboard" ? "primary.main" : "inherit" }} />
            </ListItemIcon>
            <ListItemText primary="Leaderboard" primaryTypographyProps={{ fontWeight: activeTab === "leaderboard" ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={activeTab === "stats"} onClick={() => setActiveTab("stats")}>
            <ListItemIcon>
              <TimelineIcon sx={{ color: activeTab === "stats" ? "primary.main" : "inherit" }} />
            </ListItemIcon>
            <ListItemText primary="Stats" primaryTypographyProps={{ fontWeight: activeTab === "stats" ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const registeredEventIds = useMemo(() => new Set(registrations.map(r => r.eventId)), [registrations]);
  const newEvents = events.filter(e => !registeredEventIds.has(String(e._id)));
  const appliedEvents = events.filter(e => registeredEventIds.has(String(e._id)));

  const renderEventCard = (ev, isRegistered) => {
    const run = latestRuns[ev._id] ?? null;
    const isActive = Boolean(run && !run.endTime);
    const completed = Boolean(run && run.endTime && run.durationSec != null);
    
    // Start button enabled ONLY after event time starts
    const eventTime = dayjs(ev.date).toDate().getTime();
    const canStart = now.getTime() >= eventTime;

    // End button enabled ONLY half an hour (30 mins) after run start time
    const canEnd = run && run.startTime && (now.getTime() >= new Date(run.startTime).getTime() + 30 * 60 * 1000);

    return (
      <Grid item xs={12} sm={6} lg={4} key={ev._id}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 48px rgba(0, 212, 255, 0.2)",
            },
          }}
        >
          <CardContent sx={{ flex: 1 }}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                  {ev.title}
                </Typography>
                <Chip
                  label={dayjs(ev.date).format("MMM D HH:mm")}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                {ev.description}
              </Typography>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

              <Stack spacing={1}>
                <Typography variant="body2">
                  <span style={{ opacity: 0.7 }}>Route:</span>{" "}
                  <span style={{ fontWeight: 600 }}>{ev.startPoint} → {ev.endPoint}</span>
                </Typography>
                <Typography variant="body2">
                  <span style={{ opacity: 0.7 }}>Status:</span>{" "}
                  <Chip
                    label={completed ? "Completed" : isActive ? "In Progress" : isRegistered ? "Registered" : "Not Registered"}
                    size="small"
                    color={completed ? "success" : isActive ? "warning" : isRegistered ? "info" : "default"}
                    sx={{ fontWeight: 600 }}
                  />
                </Typography>
                {completed && (
                  <Typography variant="body2">
                    <span style={{ opacity: 0.7 }}>Time:</span>{" "}
                    <span style={{ fontWeight: 600, color: "#00ff88" }}>
                      {formatDuration(run.durationSec)}
                    </span>
                  </Typography>
                )}
                {!canStart && isRegistered && !completed && !isActive && (
                  <Typography variant="caption" color="text.secondary">
                    Run starts on {dayjs(ev.date).format("MMM D, hh:mm A")}
                  </Typography>
                )}
                {isActive && !canEnd && (
                  <Typography variant="caption" color="warning.main">
                    End Run unlocks 30 mins after start.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </CardContent>

          <CardActions
            sx={{
              p: 2,
              pt: 0,
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
            }}
          >
            {!isRegistered ? (
              <Button
                onClick={() => registerEvent(ev._id)}
                disabled={busyId === ev._id}
                variant="outlined"
                fullWidth
                size="small"
              >
                Register
              </Button>
            ) : (
              <Button
                disabled
                variant="outlined"
                color="info"
                fullWidth
                size="small"
              >
                Registered
              </Button>
            )}

            <Button
              onClick={() => startRun(ev._id)}
              disabled={busyId === ev._id || !canStart || isActive || !isRegistered || completed}
              variant="contained"
              fullWidth
              size="small"
            >
              Start Run
            </Button>
            
            <Button
              onClick={() => endRun(ev._id)}
              disabled={busyId === ev._id || !isActive || !canEnd}
              color="success"
              variant="contained"
              fullWidth
              size="small"
            >
              End Run
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 250,
              boxSizing: "border-box",
              backgroundColor: "background.paper",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", md: "calc(100% - 250px)" },
        }}
      >
        <Container maxWidth="xl" sx={{ p: 0 }}>
          {/* Mobile Menu Button & Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Box>
              {isMobile && (
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2, color: "primary.main" }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline",
                }}
              >
                My Dashboard
              </Typography>
            </Box>
            <Button
              onClick={() => refresh().catch((e) => setError(e?.message ?? "Failed"))}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            >
              Refresh
            </Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {/* Hero Banner */}
          <Card
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3 },
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Welcome back, {user?.username || "Runner"}! 🏃
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your runs, compete in events, and climb the leaderboard
              </Typography>
            </Stack>
          </Card>

          {/* Conditional Content based on Sidebar Tab */}
          {activeTab === "events" && (
            <Box>
              {/* Applied Events */}
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 1 }}>
                Applied Events
              </Typography>
              
              <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                {appliedEvents.map((ev) => renderEventCard(ev, true))}
                {appliedEvents.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center", py: 4, opacity: 0.5, border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 2 }}>
                      <Typography variant="body1">You haven't applied to any events yet.</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* New Events */}
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 1 }}>
                New Events
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {newEvents.map((ev) => renderEventCard(ev, false))}
                {newEvents.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center", py: 4, opacity: 0.5, border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 2 }}>
                      <Typography variant="body1">No new events available at this time.</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {activeTab === "runs" && (
             <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
               <RunIcon sx={{ fontSize: 64, mb: 2 }} />
               <Typography variant="h6">My Runs</Typography>
               <Typography variant="body2">This feature is coming soon.</Typography>
             </Box>
          )}

          {activeTab === "leaderboard" && (
             <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
               <LeaderboardIcon sx={{ fontSize: 64, mb: 2 }} />
               <Typography variant="h6">Leaderboard</Typography>
               <Typography variant="body2">See where you stand against others. Coming soon.</Typography>
             </Box>
          )}

          {activeTab === "stats" && (
             <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
               <TimelineIcon sx={{ fontSize: 64, mb: 2 }} />
               <Typography variant="h6">My Stats</Typography>
               <Typography variant="body2">Personal records and charts coming soon.</Typography>
             </Box>
          )}

        </Container>
      </Box>
    </Box>
  );
}
