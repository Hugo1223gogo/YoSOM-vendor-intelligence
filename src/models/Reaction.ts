import mongoose, { Schema, Document } from "mongoose";

export interface IReaction extends Document {
  sessionId: string;
  itemId: string;
  value: "up" | "mid" | "down";
  feedback?: string;
  createdAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  sessionId: { type: String, required: true },
  itemId: { type: String, required: true },
  value: { type: String, required: true, enum: ["up", "mid", "down"] },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Reaction ||
  mongoose.model<IReaction>("Reaction", ReactionSchema);
