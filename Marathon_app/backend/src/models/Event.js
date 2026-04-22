import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    date: { type: Date, required: true, index: true },
    startPoint: { type: String, required: true, trim: true },
    endPoint: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", EventSchema);

