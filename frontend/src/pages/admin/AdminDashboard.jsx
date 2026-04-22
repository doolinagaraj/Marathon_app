import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { api, participantsCsvUrl, participantsPdfUrl, participantsXlsxUrl } from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";
import { BarChart, Bar, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBarChart, RadialBar } from "recharts";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: dayjs().add(7, "day").format("YYYY-MM-DD"),
    startPoint: "",
    endPoint: ""
  });
  const [participants, setParticipants] = useState([]);
  const [participantsEventId, setParticipantsEventId] = useState("");
  const [analytics, setAnalytics] = useState(null);

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
    setForm({ title: "", description: "", date: dayjs().add(7, "day").format("YYYY-MM-DD"), startPoint: "", endPoint: "" });
    setOpen(true);
  }

  function openEdit(ev) {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? "",
      date: dayjs(ev.date).format("YYYY-MM-DD"),
      startPoint: ev.startPoint,
      endPoint: ev.endPoint
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

  async function exportCsv(ev) {
    setError("");
    try {
      const res = await fetch(participantsCsvUrl(ev._id), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `participants-${ev._id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message ?? "Export failed");
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

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h5">Admin Dashboard</Typography>
        <Button variant="contained" onClick={openCreate}>
          Create event
        </Button>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Events" />
        <Tab label="Participants & Attendance" />
        <Tab label="Analytics" />
        <Tab label="Exports" />
      </Tabs>

      {tab === 0 ? (
      <Grid container spacing={2}>
        {events.map((ev) => (
          <Grid item xs={12} md={6} key={ev._id}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="h6">{ev.title}</Typography>
                  <Box>
                    <IconButton onClick={() => openEdit(ev)} aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => del(ev)} aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(ev.date).format("MMM D, YYYY")}
                </Typography>
                <Typography variant="body2">{ev.description}</Typography>
                <Typography variant="body2">
                  <b>Route:</b> {ev.startPoint} → {ev.endPoint}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button variant="outlined" onClick={() => viewParticipants(ev)}>
                    View participants
                  </Button>
                  <Button variant="outlined" onClick={() => exportCsv(ev)}>
                    Export CSV
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      ) : null}

      {tab === 1 && participantsEventId ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h6">Participants</Typography>
            <Button onClick={() => setParticipantsEventId("")}>Close</Button>
          </Box>
          {analytics?.attendance ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              <Chip label={`Registered: ${analytics.attendance.registered}`} />
              <Chip color="info" label={`Started: ${analytics.attendance.started}`} />
              <Chip color="success" label={`Finished: ${analytics.attendance.finished}`} />
              <Chip color="warning" label={`DNF: ${analytics.attendance.dnf}`} />
            </Box>
          ) : null}
          <Stack spacing={1} sx={{ mt: 1 }}>
            {participants.map((p) => (
              <Box key={p.userId} sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2">
                  {p.username ? `${p.username} • ` : ""}
                  {p.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {p.status ?? "registered"} • Best: {p.bestDurationSec != null ? `${p.bestDurationSec}s` : "-"}
                </Typography>
              </Box>
            ))}
            {!participants.length ? <Typography variant="body2">No participants yet.</Typography> : null}
          </Stack>
        </Paper>
      ) : null}

      {tab === 2 && analytics ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">Performance analytics</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
            <Chip label={`Avg: ${analytics.performance?.averageSec ?? "-"}s`} />
            <Chip label={`Fastest: ${analytics.performance?.fastestSec ?? "-"}s`} />
            <Chip label={`Slowest: ${analytics.performance?.slowestSec ?? "-"}s`} />
            <Chip label={`Samples: ${analytics.performance?.sampleSize ?? 0}`} />
          </Box>
          <Box sx={{ height: 320, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(analytics.distribution ?? []).map((b) => ({ name: b.label, count: b.count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976d2" name="Finishers" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ height: 320, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="20%" outerRadius="90%" data={(analytics.distribution ?? []).map((b) => ({ name: b.label, count: b.count }))}>
                <RadialBar dataKey="count" name="Distribution" fill="#2e7d32" />
                <Legend />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="caption" color="text.secondary">
            (Radial chart represents the performance distribution buckets.)
          </Typography>
        </Paper>
      ) : null}

      {tab === 3 && participantsEventId ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">Exports</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
            <Button variant="outlined" onClick={() => exportFile(participantsCsvUrl(participantsEventId), `participants-${participantsEventId}.csv`)}>
              CSV
            </Button>
            <Button variant="outlined" onClick={() => exportFile(participantsXlsxUrl(participantsEventId), `participants-${participantsEventId}.xlsx`)}>
              Excel
            </Button>
            <Button variant="outlined" onClick={() => exportFile(participantsPdfUrl(participantsEventId), `participants-${participantsEventId}.pdf`)}>
              PDF
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tip: open an event’s participants first, then export.
          </Typography>
        </Paper>
      ) : null}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              multiline
              minRows={3}
            />
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField label="Start point" value={form.startPoint} onChange={(e) => setForm((f) => ({ ...f, startPoint: e.target.value }))} />
            <TextField label="End point" value={form.endPoint} onChange={(e) => setForm((f) => ({ ...f, endPoint: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

