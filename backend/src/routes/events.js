import express from "express";
import { z } from "zod";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import { RunRecord } from "../models/RunRecord.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { stringify } from "csv-stringify";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { audit } from "../lib/audit.js";
import { sseKey, ssePublish, sseSubscribe, sseUnsubscribe } from "../lib/realtime.js";

export const eventsRouter = express.Router();

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  date: z.coerce.date(),
  startPoint: z.string().min(1),
  endPoint: z.string().min(1)
});

// Public (authenticated) list for users
eventsRouter.get("/", requireAuth, async (req, res) => {
  let query = {};
  let sort = { date: 1 };
  if (req.user?.role !== "admin") {
    const now = new Date();
    query = { date: { $gte: new Date(now.getTime() - 1000 * 60 * 60 * 24) } };
  } else {
    sort = { date: -1 };
  }

  const events = await Event.find(query).sort(sort).lean();
  return res.json({ events });
});

// Admin CRUD
eventsRouter.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const ev = await Event.create(parsed.data);
  await audit({ actorUserId: req.user.sub, action: "event.create", entityType: "event", entityId: String(ev._id) });
  return res.status(201).json({ event: ev });
});

eventsRouter.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const ev = await Event.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!ev) return res.status(404).json({ error: "Not found" });
  await audit({ actorUserId: req.user.sub, action: "event.update", entityType: "event", entityId: String(ev._id) });
  return res.json({ event: ev });
});

eventsRouter.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const ev = await Event.findByIdAndDelete(req.params.id);
  if (!ev) return res.status(404).json({ error: "Not found" });
  await Registration.deleteMany({ eventId: ev._id });
  await RunRecord.deleteMany({ eventId: ev._id });
  await audit({ actorUserId: req.user.sub, action: "event.delete", entityType: "event", entityId: String(ev._id) });
  return res.json({ ok: true });
});

// User registration for an event
eventsRouter.post("/:id/register", requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ error: "Not found" });

  try {
    const reg = await Registration.create({ userId: req.user.sub, eventId, status: "registered" });
    return res.status(201).json({ registration: reg });
  } catch (e) {
    if (String(e?.code) === "11000") return res.status(409).json({ error: "Already registered" });
    throw e;
  }
});

// Run tracking (start/end)
eventsRouter.post("/:id/run/start", requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const reg = await Registration.findOne({ userId: req.user.sub, eventId });
  if (!reg) return res.status(400).json({ error: "You must register for this event first" });

  const active = await RunRecord.findOne({ userId: req.user.sub, eventId, endTime: null }).sort({ startTime: -1 });
  if (active) return res.status(409).json({ error: "Run already started" });

  const rr = await RunRecord.create({ userId: req.user.sub, eventId, startTime: new Date() });
  reg.status = "started";
  await reg.save();

  ssePublish({ key: sseKey({ eventId }), event: "started", data: { userId: req.user.sub, eventId, startTime: rr.startTime } });
  return res.status(201).json({ run: rr });
});

eventsRouter.post("/:id/run/end", requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const active = await RunRecord.findOne({ userId: req.user.sub, eventId, endTime: null }).sort({ startTime: -1 });
  if (!active) return res.status(400).json({ error: "No active run" });

  const endTime = new Date();
  const durationSec = Math.max(0, Math.round((endTime.getTime() - new Date(active.startTime).getTime()) / 1000));

  active.endTime = endTime;
  active.durationSec = durationSec;
  await active.save();

  const reg = await Registration.findOne({ userId: req.user.sub, eventId });
  if (reg) {
    reg.status = "finished";
    await reg.save();
  }

  ssePublish({
    key: sseKey({ eventId }),
    event: "finished",
    data: { userId: req.user.sub, eventId, endTime: active.endTime, durationSec: active.durationSec }
  });
  return res.json({ run: active });
});

// Admin: realtime monitoring for an event (SSE)
eventsRouter.get("/:id/monitor", requireAuth, requireRole("admin"), async (req, res) => {
  const eventId = req.params.id;
  const key = sseKey({ eventId });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  sseSubscribe({ key, res });
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const interval = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(interval);
    sseUnsubscribe({ key, res });
  });
});

// User run summary for an event (latest)
eventsRouter.get("/:id/run/latest", requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const run = await RunRecord.findOne({ userId: req.user.sub, eventId }).sort({ startTime: -1 }).lean();
  return res.json({ run });
});

// Leaderboard (fastest completed)
eventsRouter.get("/:id/leaderboard", requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const gender = req.query.gender ? String(req.query.gender) : "";
  const ageGroup = req.query.ageGroup ? String(req.query.ageGroup) : "";

  // Filter by demographics if provided (done via populate+filter in memory; acceptable for small leaderboards)
  const top = await RunRecord.find({ eventId, durationSec: { $ne: null } })
    .sort({ durationSec: 1 })
    .limit(50)
    .populate("userId", "username email profile")
    .lean();

  const rows = top
    .map((r) => {
      const u = r.userId;
      const bd = u?.profile?.birthDate ? new Date(u.profile.birthDate) : null;
      const years =
        bd && !Number.isNaN(bd.getTime()) ? Math.floor((Date.now() - bd.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;
      const computedAgeGroup =
        years == null
          ? "unknown"
          : years < 18
            ? "<18"
            : years <= 29
              ? "18-29"
              : years <= 39
                ? "30-39"
                : years <= 49
                  ? "40-49"
                  : years <= 59
                    ? "50-59"
                    : "60+";
      return {
        username: u?.username ?? (u?.email ? u.email.split("@")[0] : "unknown"),
        email: u?.email ?? "",
        gender: u?.profile?.gender ?? "prefer_not_say",
        ageGroup: computedAgeGroup,
        durationSec: r.durationSec,
        startTime: r.startTime,
        endTime: r.endTime
      };
    })
    .filter((row) => (gender ? row.gender === gender : true))
    .filter((row) => (ageGroup ? row.ageGroup === ageGroup : true));
  return res.json({ leaderboard: rows });
});

// Admin: participants list
eventsRouter.get("/:id/participants", requireAuth, requireRole("admin"), async (req, res) => {
  const eventId = req.params.id;
  const regs = await Registration.find({ eventId }).populate("userId", "email username profile").lean();

  const userIds = regs.map((r) => r.userId?._id).filter(Boolean);
  const runs = await RunRecord.find({ eventId, userId: { $in: userIds }, durationSec: { $ne: null } })
    .sort({ startTime: -1 })
    .lean();

  const bestByUser = new Map();
  for (const r of runs) {
    const key = String(r.userId);
    const cur = bestByUser.get(key);
    if (!cur || (r.durationSec ?? Infinity) < (cur.durationSec ?? Infinity)) bestByUser.set(key, r);
  }

  const participants = regs.map((reg) => {
    const u = reg.userId;
    const best = bestByUser.get(String(u?._id));
    return {
      userId: String(u?._id ?? ""),
      email: u?.email ?? "",
      username: u?.username ?? "",
      gender: u?.profile?.gender ?? "prefer_not_say",
      birthDate: u?.profile?.birthDate ?? null,
      registeredAt: reg.createdAt,
      status: reg.status ?? "registered",
      bestDurationSec: best?.durationSec ?? null,
      bestStartTime: best?.startTime ?? null,
      bestEndTime: best?.endTime ?? null
    };
  });

  return res.json({ participants });
});

// Admin: attendance + analytics for an event
eventsRouter.get("/:id/analytics", requireAuth, requireRole("admin"), async (req, res) => {
  const eventId = req.params.id;
  const regs = await Registration.find({ eventId }).lean();
  const completedRuns = await RunRecord.find({ eventId, durationSec: { $ne: null } }).lean();

  const attendance = {
    registered: regs.length,
    started: regs.filter((r) => r.status === "started" || r.status === "finished").length,
    finished: regs.filter((r) => r.status === "finished").length,
    dnf: regs.filter((r) => r.status === "dnf").length
  };

  const durations = completedRuns.map((r) => r.durationSec).filter((x) => typeof x === "number");
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  const fastest = durations.length ? Math.min(...durations) : null;
  const slowest = durations.length ? Math.max(...durations) : null;

  // distribution buckets (0-30m, 30-60m, 60-90m, 90-120m, 120m+)
  const buckets = [
    { label: "0-30m", min: 0, max: 30 * 60, count: 0 },
    { label: "30-60m", min: 30 * 60, max: 60 * 60, count: 0 },
    { label: "60-90m", min: 60 * 60, max: 90 * 60, count: 0 },
    { label: "90-120m", min: 90 * 60, max: 120 * 60, count: 0 },
    { label: "120m+", min: 120 * 60, max: Infinity, count: 0 }
  ];
  for (const d of durations) {
    const b = buckets.find((x) => d >= x.min && d < x.max);
    if (b) b.count += 1;
  }

  return res.json({
    attendance,
    performance: { averageSec: avg, fastestSec: fastest, slowestSec: slowest, sampleSize: durations.length },
    distribution: buckets
  });
});

// Admin: export Excel
eventsRouter.get("/:id/participants.xlsx", requireAuth, requireRole("admin"), async (req, res) => {
  const eventId = req.params.id;
  const regs = await Registration.find({ eventId }).populate("userId", "email username profile").lean();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Participants");
  ws.columns = [
    { header: "Email", key: "email", width: 28 },
    { header: "Username", key: "username", width: 18 },
    { header: "Gender", key: "gender", width: 14 },
    { header: "Status", key: "status", width: 14 },
    { header: "Registered At", key: "registeredAt", width: 24 }
  ];
  regs.forEach((reg) => {
    ws.addRow({
      email: reg.userId?.email ?? "",
      username: reg.userId?.username ?? "",
      gender: reg.userId?.profile?.gender ?? "prefer_not_say",
      status: reg.status ?? "registered",
      registeredAt: reg.createdAt?.toISOString?.() ?? ""
    });
  });

  await audit({ actorUserId: req.user.sub, action: "export.xlsx", entityType: "event", entityId: eventId });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="participants-${eventId}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

// Admin: export PDF (simple table)
eventsRouter.get("/:id/participants.pdf", requireAuth, requireRole("admin"), async (req, res) => {
  const eventId = req.params.id;
  const regs = await Registration.find({ eventId }).populate("userId", "email username profile").lean();

  await audit({ actorUserId: req.user.sub, action: "export.pdf", entityType: "event", entityId: eventId });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="participants-${eventId}.pdf"`);
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);
  doc.fontSize(18).text("Participants", { align: "left" });
  doc.moveDown();
  doc.fontSize(10);
  regs.forEach((reg) => {
    doc.text(
      `${reg.userId?.email ?? ""} | ${reg.userId?.username ?? ""} | ${reg.userId?.profile?.gender ?? ""} | ${reg.status ?? ""}`
    );
  });
  doc.end();
});

// Admin: export CSV
eventsRouter.get("/:id/participants.csv", requireAuth, requireRole("admin"), async (req, res) => {
  const eventId = req.params.id;

  const regs = await Registration.find({ eventId }).populate("userId", "email username").lean();
  const userIds = regs.map((r) => r.userId?._id).filter(Boolean);
  const runs = await RunRecord.find({ eventId, userId: { $in: userIds }, durationSec: { $ne: null } }).lean();

  const bestByUser = new Map();
  for (const r of runs) {
    const key = String(r.userId);
    const cur = bestByUser.get(key);
    if (!cur || (r.durationSec ?? Infinity) < (cur.durationSec ?? Infinity)) bestByUser.set(key, r);
  }

  const records = regs.map((reg) => {
    const u = reg.userId;
    const best = bestByUser.get(String(u?._id));
    return {
      email: u?.email ?? "",
      username: u?.username ?? "",
      registeredAt: reg.createdAt?.toISOString?.() ?? "",
      bestDurationSec: best?.durationSec ?? "",
      bestStartTime: best?.startTime?.toISOString?.() ?? "",
      bestEndTime: best?.endTime?.toISOString?.() ?? ""
    };
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="participants-${eventId}.csv"`);
  await audit({ actorUserId: req.user.sub, action: "export.csv", entityType: "event", entityId: eventId });

  const stringifier = stringify({
    header: true,
    columns: ["email", "username", "registeredAt", "bestDurationSec", "bestStartTime", "bestEndTime"]
  });
  stringifier.pipe(res);
  for (const r of records) stringifier.write(r);
  stringifier.end();
});

