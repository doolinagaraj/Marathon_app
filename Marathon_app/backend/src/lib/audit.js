import { AuditLog } from "../models/AuditLog.js";

export async function audit({ actorUserId, action, entityType, entityId = null, metadata = {} }) {
  try {
    await AuditLog.create({ actorUserId, action, entityType, entityId, metadata });
  } catch (e) {
    console.warn("Audit log failed:", e?.message ?? e);
  }
}

