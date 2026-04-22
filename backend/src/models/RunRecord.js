import mongoose from "mongoose";

const RunRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    durationSec: { type: Number, default: null },
    startedBy: { type: String, default: "user" }
  },
  { timestamps: true }
);

RunRecordSchema.index({ userId: 1, eventId: 1, startTime: -1 });

export const RunRecord = mongoose.model("RunRecord", RunRecordSchema);

