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
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [latestRuns, setLatestRuns] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function refresh() {
    setError("");
    const r = await api.listEvents(token);
    setEvents(r.events);
    const runs = {};
    await Promise.all(
      r.events.map(async (e) => {
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

  const now = useMemo(() => new Date(), []);

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
          <ListItemButton selected>
            <ListItemIcon>
              <RunIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="My Runs" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <EventIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Events" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <LeaderboardIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Leaderboard" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <TimelineIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Stats" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

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
              mb: 3,
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

          {/* Events Grid - Mobile First */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Available Events
          </Typography>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {events.map((ev) => {
              const run = latestRuns[ev._id] ?? null;
              const isActive = Boolean(run && !run.endTime);
              const completed = Boolean(run && run.endTime && run.durationSec != null);
              const canStart = dayjs(ev.date).toDate().getTime() <= now.getTime() + 1000 * 60 * 60 * 24;

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
                            label={dayjs(ev.date).format("MMM D")}
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
                              label={completed ? "Completed" : isActive ? "In Progress" : "Not Started"}
                              size="small"
                              color={completed ? "success" : isActive ? "warning" : "default"}
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
                      <Button
                        onClick={() => registerEvent(ev._id)}
                        disabled={busyId === ev._id}
                        variant="outlined"
                        fullWidth
                        size="small"
                      >
                        Register
                      </Button>
                      <Button
                        onClick={() => startRun(ev._id)}
                        disabled={busyId === ev._id || !canStart || isActive}
                        variant="contained"
                        fullWidth
                        size="small"
                      >
                        Start Run
                      </Button>
                      <Button
                        onClick={() => endRun(ev._id)}
                        disabled={busyId === ev._id || !isActive}
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
            })}
          </Grid>

          {events.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                opacity: 0.5,
              }}
            >
              <EventIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">No events available</Typography>
              <Typography variant="body2">Check back later for upcoming marathons</Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
