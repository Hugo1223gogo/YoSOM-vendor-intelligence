import mongoose, { Schema, Document } from "mongoose";

export interface IDeepTalk extends Document {
  sessionId: string;
  transcript: { role: "user" | "assistant"; text: string; ts: Date }[];
  extractedTags: string[];
  createdAt: Date;
}

const DeepTalkSchema = new Schema<IDeepTalk>({
  sessionId: { type: String, required: true },
  transcript: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      text: { type: String, required: true },
      ts: { type: Date, default: Date.now },
    },
  ],
  extractedTags: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DeepTalk ||
  mongoose.model<IDeepTalk>("DeepTalk", DeepTalkSchema);
