import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  sessionId: string;
  venue: "charlie" | "mcnay";
  itemId: string;
  value: 1 | -1;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  sessionId: { type: String, required: true },
  venue: { type: String, required: true, enum: ["charlie", "mcnay"] },
  itemId: { type: String, required: true },
  value: { type: Number, required: true, enum: [1, -1] },
  createdAt: { type: Date, default: Date.now },
});

VoteSchema.index({ sessionId: 1, itemId: 1 }, { unique: true });
VoteSchema.index({ venue: 1, itemId: 1, createdAt: -1 });

export default mongoose.models.Vote ||
  mongoose.model<IVote>("Vote", VoteSchema);
