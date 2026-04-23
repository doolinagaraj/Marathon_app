import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { api, participantsCsvUrl, participantsPdfUrl, participantsXlsxUrl } from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: dayjs().add(7, "day").format("YYYY-MM-DDTHH:mm"),
    startPoint: "",
    endPoint: "",
  });
  const [participants, setParticipants] = useState([]);
  const [participantsEventId, setParticipantsEventId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function refresh() {
    setError("");
    const r = await api.listEvents(token);
    setEvents(r.events);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e?.message ?? "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      date: dayjs().add(7, "day").format("YYYY-MM-DDTHH:mm"),
      startPoint: "",
      endPoint: "",
    });
    setOpen(true);
  }

  function openEdit(ev) {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? "",
      date: dayjs(ev.date).format("YYYY-MM-DDTHH:mm"),
      startPoint: ev.startPoint,
      endPoint: ev.endPoint,
    });
    setOpen(true);
  }

  async function save() {
    setError("");
    const payload = { ...form, date: new Date(form.date).toISOString() };
    try {
      if (editing) await api.updateEvent(token, editing._id, payload);
      else await api.createEvent(token, payload);
      setOpen(false);
      await refresh();
    } catch (e) {
      setError(e?.message ?? "Save failed");
    }
  }

  async function del(ev) {
    setError("");
    try {
      await api.deleteEvent(token, ev._id);
      await refresh();
    } catch (e) {
      setError(e?.message ?? "Delete failed");
    }
  }

  async function viewParticipants(ev) {
    setError("");
    try {
      const r = await api.participants(token, ev._id);
      setParticipants(r.participants);
      setParticipantsEventId(ev._id);
      const a = await api.analytics(token, ev._id);
      setAnalytics(a);
      setTab(1);
    } catch (e) {
      setError(e?.message ?? "Failed to load participants");
    }
  }

  async function exportFile(url, filename) {
    setError("");
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      setError(e?.message ?? "Export failed");
    }
  }

  // Sidebar content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #ff3366 0%, #ff6b35 100%)",
          color: "#0a0a0a",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin Panel
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.email}
        </Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setTab(0)} selected={tab === 0}>
            <ListItemIcon>
              <EventIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Events" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setTab(1)} selected={tab === 1}>
            <ListItemIcon>
              <PeopleIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Participants" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setTab(2)} selected={tab === 2}>
            <ListItemIcon>
              <AnalyticsIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Analytics" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setTab(3)} selected={tab === 3}>
            <ListItemIcon>
              <DownloadIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Exports" primaryTypographyProps={{ fontWeight: 600 }} />
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
          overflow: "auto",
        }}
      >
        <Container maxWidth="xl" sx={{ p: 0 }}>
          {/* Header */}
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
                  background: "linear-gradient(135deg, #ff3366 0%, #ff6b35 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline",
                }}
              >
                Admin Dashboard
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={openCreate}
              startIcon={<AddIcon />}
              size={isMobile ? "small" : "medium"}
            >
              {!isMobile && "Create Event"}
            </Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {/* Tabs - Scrollable on mobile */}
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                fontWeight: 600,
                minHeight: { xs: 48, sm: 56 },
              },
            }}
          >
            <Tab label="Events" icon={<EventIcon />} iconPosition="start" />
            <Tab label="Participants" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Analytics" icon={<AnalyticsIcon />} iconPosition="start" />
            <Tab label="Exports" icon={<DownloadIcon />} iconPosition="start" />
          </Tabs>

          {/* Events Tab */}
          {tab === 0 && (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {events.map((ev) => (
                <Grid item xs={12} sm={6} lg={4} key={ev._id}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 48px rgba(255, 51, 102, 0.2)",
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                          {ev.title}
                        </Typography>
                        <Box>
                          <IconButton onClick={() => openEdit(ev)} size="small" sx={{ color: "primary.main" }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => del(ev)} size="small" sx={{ color: "error.main" }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {dayjs(ev.date).format("MMMM D, YYYY HH:mm")}
                      </Typography>

                      <Typography variant="body2">{ev.description}</Typography>

                      <Typography variant="body2">
                        <span style={{ opacity: 0.7 }}>Route:</span>{" "}
                        <span style={{ fontWeight: 600 }}>{ev.startPoint} → {ev.endPoint}</span>
                      </Typography>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => viewParticipants(ev)}
                          fullWidth
                          size="small"
                        >
                          View Participants
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Participants Tab */}
          {tab === 1 && participantsEventId && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Participants
                  </Typography>
                  <Button onClick={() => setParticipantsEventId("")} size="small">
                    Close
                  </Button>
                </Box>

                {analytics?.attendance && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip label={`Registered: ${analytics.attendance.registered}`} />
                    <Chip color="info" label={`Started: ${analytics.attendance.started}`} />
                    <Chip color="success" label={`Finished: ${analytics.attendance.finished}`} />
                    <Chip color="warning" label={`DNF: ${analytics.attendance.dnf}`} />
                  </Box>
                )}

                <Stack spacing={1}>
                  {participants.map((p) => (
                    <Paper
                      key={p.userId}
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.username || p.email}
                        </Typography>
                        {p.username && (
                          <Typography variant="body2" color="text.secondary">
                            {p.email}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Status: {p.status ?? "registered"} • Best: {p.bestDurationSec != null ? `${p.bestDurationSec}s` : "-"}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                  {!participants.length && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                      No participants yet.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          )}

          {/* Analytics Tab */}
          {tab === 2 && analytics && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Performance Analytics
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={`Avg: ${analytics.performance?.averageSec ?? "-"}s`} />
                  <Chip label={`Fastest: ${analytics.performance?.fastestSec ?? "-"}s`} />
                  <Chip label={`Slowest: ${analytics.performance?.slowestSec ?? "-"}s`} />
                  <Chip label={`Samples: ${analytics.performance?.sampleSize ?? 0}`} />
                </Box>

                <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
                  <AnalyticsIcon sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="body2">Charts require recharts package</Typography>
                  <Typography variant="caption">Install with: npm install recharts</Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Exports Tab */}
          {tab === 3 && participantsEventId && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Export Data
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      onClick={() => exportFile(participantsCsvUrl(participantsEventId), `participants-${participantsEventId}.csv`)}
                      fullWidth
                      startIcon={<DownloadIcon />}
                    >
                      Export CSV
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      onClick={() => exportFile(participantsXlsxUrl(participantsEventId), `participants-${participantsEventId}.xlsx`)}
                      fullWidth
                      startIcon={<DownloadIcon />}
                    >
                      Export Excel
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      onClick={() => exportFile(participantsPdfUrl(participantsEventId), `participants-${participantsEventId}.pdf`)}
                      fullWidth
                      startIcon={<DownloadIcon />}
                    >
                      Export PDF
                    </Button>
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary">
                  Tip: Select an event in the Participants tab first, then export.
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Empty states */}
          {tab === 0 && events.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
              <EventIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">No events yet</Typography>
              <Typography variant="body2">Create your first marathon event</Typography>
            </Box>
          )}

          {(tab === 1 || tab === 3) && !participantsEventId && (
            <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">No event selected</Typography>
              <Typography variant="body2">View an event's participants first</Typography>
            </Box>
          )}

          {tab === 2 && !analytics && (
            <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
              <AnalyticsIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">No analytics data</Typography>
              <Typography variant="body2">Select an event to view analytics</Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Create/Edit Event Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle>{editing ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              multiline
              minRows={3}
              fullWidth
            />
            <TextField
              label="Date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Start Point"
              value={form.startPoint}
              onChange={(e) => setForm((f) => ({ ...f, startPoint: e.target.value }))}
              fullWidth
            />
            <TextField
              label="End Point"
              value={form.endPoint}
              onChange={(e) => setForm((f) => ({ ...f, endPoint: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">
            Save Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
