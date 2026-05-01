import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  venue: "charleys" | "mcnay";
  itemId: string;
  name: string;
  emoji: string;
  tags: string[];
  price: number;
  tone: string;
  weekOf: Date;
  status: "candidate" | "live" | "retired";
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
  venue: { type: String, required: true, enum: ["charleys", "mcnay"] },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  tags: [String],
  price: { type: Number, required: true },
  tone: { type: String, required: true },
  weekOf: { type: Date, required: true },
  status: {
    type: String,
    enum: ["candidate", "live", "retired"],
    default: "candidate",
  },
  createdAt: { type: Date, default: Date.now },
});

MenuItemSchema.index({ venue: 1, weekOf: -1, status: 1 });

export default mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
