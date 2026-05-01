import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  sessionId: string;
  entrySource: "qr" | "instagram";
  venueQR?: "charleys" | "mcnay";
  startedAt: Date;
  completedStage: string;
  finishedAt?: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true },
  entrySource: { type: String, enum: ["qr", "instagram"], default: "qr" },
  venueQR: { type: String, enum: ["charleys", "mcnay"] },
  startedAt: { type: Date, default: Date.now },
  completedStage: { type: String, default: "boot" },
  finishedAt: Date,
});

SessionSchema.index({ sessionId: 1 }, { unique: true });

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
