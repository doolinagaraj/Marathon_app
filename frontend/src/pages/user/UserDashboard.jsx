import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardActions, CardContent, Chip, Divider, Grid, Stack, Typography } from "@mui/material";
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
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [latestRuns, setLatestRuns] = useState({});

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

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h5">Upcoming Events</Typography>
        <Button onClick={() => refresh().catch((e) => setError(e?.message ?? "Failed"))} variant="outlined">
          Refresh
        </Button>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {events.map((ev) => {
          const run = latestRuns[ev._id] ?? null;
          const isActive = Boolean(run && !run.endTime);
          const completed = Boolean(run && run.endTime && run.durationSec != null);
          const canStart = dayjs(ev.date).toDate().getTime() <= now.getTime() + 1000 * 60 * 60 * 24;
          return (
            <Grid item xs={12} md={6} key={ev._id}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography variant="h6">{ev.title}</Typography>
                      <Chip size="small" label={dayjs(ev.date).format("MMM D, YYYY")} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {ev.description}
                    </Typography>
                    <Divider />
                    <Typography variant="body2">
                      <b>Route:</b> {ev.startPoint} → {ev.endPoint}
                    </Typography>
                    <Typography variant="body2">
                      <b>Latest run:</b> {completed ? formatDuration(run.durationSec) : isActive ? "In progress" : "-"}
                    </Typography>
                    {run?.startTime ? (
                      <Typography variant="caption" color="text.secondary">
                        Start: {dayjs(run.startTime).format("MMM D, HH:mm")} {run.endTime ? `• End: ${dayjs(run.endTime).format("MMM D, HH:mm")}` : ""}
                      </Typography>
                    ) : null}
                  </Stack>
                </CardContent>
                <CardActions sx={{ flexWrap: "wrap" }}>
                  <Button onClick={() => registerEvent(ev._id)} disabled={busyId === ev._id} variant="outlined">
                    Register
                  </Button>
                  <Button onClick={() => startRun(ev._id)} disabled={busyId === ev._id || !canStart || isActive} variant="contained">
                    Start
                  </Button>
                  <Button onClick={() => endRun(ev._id)} disabled={busyId === ev._id || !isActive} color="success" variant="contained">
                    End
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}

