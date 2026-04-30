import mongoose from "mongoose";
import MenuItem from "../src/models/MenuItem";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI env var");
  process.exit(1);
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const weekOf = getMonday(new Date());

const ITEMS = [
  {
    venue: "charlie",
    itemId: "ramen",
    emoji: "🍜",
    name: "Spicy Miso Ramen",
    tags: ["Vegan", "Spicy"],
    price: 9.5,
    tone: "#FFE2D6",
  },
  {
    venue: "charlie",
    itemId: "bowl",
    emoji: "🥘",
    name: "Korean Rice Bowl",
    tags: ["Gluten-free", "Spicy"],
    price: 10.25,
    tone: "#FFE9D6",
  },
  {
    venue: "charlie",
    itemId: "salad",
    emoji: "🥗",
    name: "Crunchy Thai Salad",
    tags: ["Vegan", "Gluten-free"],
    price: 8.75,
    tone: "#E6F1E0",
  },
  {
    venue: "charlie",
    itemId: "burrito",
    emoji: "🌯",
    name: "Breakfast Burrito",
    tags: ["Veggie", "High-protein"],
    price: 7.5,
    tone: "#FFF1D6",
  },
  {
    venue: "mcnay",
    itemId: "sandwich",
    emoji: "🥪",
    name: "Pesto Caprese Sub",
    tags: ["Veggie"],
    price: 8.25,
    tone: "#E6F1E0",
  },
  {
    venue: "mcnay",
    itemId: "matcha",
    emoji: "🍵",
    name: "Iced Matcha Latte",
    tags: ["Vegan-opt"],
    price: 5.5,
    tone: "#E0EFE3",
  },
  {
    venue: "mcnay",
    itemId: "boba",
    emoji: "🧋",
    name: "Brown Sugar Boba",
    tags: ["Sweet"],
    price: 6.0,
    tone: "#EFE0F0",
  },
  {
    venue: "mcnay",
    itemId: "wrap",
    emoji: "🌯",
    name: "Buffalo Chick Wrap",
    tags: ["High-protein", "Spicy"],
    price: 9.0,
    tone: "#FFE2D6",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  for (const item of ITEMS) {
    await MenuItem.findOneAndUpdate(
      { venue: item.venue, itemId: item.itemId, weekOf },
      { ...item, weekOf, status: "candidate" },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${ITEMS.length} menu items for week of ${weekOf.toISOString().slice(0, 10)}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
