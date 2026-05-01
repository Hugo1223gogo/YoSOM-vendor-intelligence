import mongoose, { Schema, Document } from "mongoose";

export interface IPreference extends Document {
  sessionId: string;
  venue?: "charleys" | "mcnay";
  flavors: string[];
  proteins: string[];
  dietary: string[];
  cuisines: string[];
  freeText?: string;
  createdAt: Date;
}

const PreferenceSchema = new Schema<IPreference>({
  sessionId: { type: String, required: true },
  venue: { type: String, enum: ["charleys", "mcnay"] },
  flavors: [String],
  proteins: [String],
  dietary: [String],
  cuisines: [String],
  freeText: String,
  createdAt: { type: Date, default: Date.now },
});

PreferenceSchema.index({ sessionId: 1 }, { unique: true });
PreferenceSchema.index({ createdAt: -1 });
PreferenceSchema.index({ venue: 1, createdAt: -1 });

export default mongoose.models.Preference ||
  mongoose.model<IPreference>("Preference", PreferenceSchema);
