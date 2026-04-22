import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    status: { type: String, enum: ["registered", "started", "finished", "dnf"], default: "registered", index: true }
  },
  { timestamps: true }
);

RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", RegistrationSchema);

