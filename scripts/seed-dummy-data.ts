import mongoose from "mongoose";
import Session from "../src/models/Session";
import Vote from "../src/models/Vote";
import Reaction from "../src/models/Reaction";
import Preference from "../src/models/Preference";
import DeepTalk from "../src/models/DeepTalk";
import MenuItem from "../src/models/MenuItem";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI env var");
  process.exit(1);
}

const CLEAN = process.argv.includes("--clean");
const SESSION_COUNT = 25;

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function weightedPick<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offset);
}

const CHARLEYS_ITEMS = ["ramen", "bowl", "salad", "burrito"];
const MCNAY_ITEMS = ["sandwich", "matcha", "boba", "wrap"];

const CHARLEYS_PREFS = {
  flavors: { options: ["spicy", "savory", "umami", "sweet", "sour", "smoky"], weights: [5, 4, 3, 2, 1, 1] },
  proteins: { options: ["chicken", "tofu", "beef", "shrimp", "veggies", "fish"], weights: [5, 3, 4, 2, 2, 1] },
  dietary: { options: ["gluten-free", "dairy-free", "vegan", "nut-free", "halal", "none"], weights: [2, 1, 3, 1, 2, 5] },
  cuisines: { options: ["asian", "mexican", "italian", "mediterranean", "american", "indian"], weights: [5, 4, 2, 2, 3, 3] },
};

const MCNAY_PREFS = {
  flavors: { options: ["sweet", "fruity", "refreshing", "rich", "nutty", "earthy"], weights: [5, 4, 4, 3, 2, 1] },
  proteins: { options: ["chicken", "tofu", "veggies", "fish", "beef", "shrimp"], weights: [2, 3, 4, 1, 1, 1] },
  dietary: { options: ["vegan", "dairy-free", "gluten-free", "nut-free", "halal", "none"], weights: [4, 3, 2, 1, 1, 4] },
  cuisines: { options: ["asian", "mediterranean", "italian", "american", "mexican", "indian"], weights: [3, 3, 3, 4, 2, 1] },
};

const CHARLEYS_TRANSCRIPTS = [
  [
    { role: "user", text: "I've been craving spicy ramen all week" },
    { role: "assistant", text: "Love that! Any specific broth preference — miso, tonkotsu, or something else? 🍜" },
    { role: "user", text: "Tonkotsu with extra chili oil" },
  ],
  [
    { role: "user", text: "Something with lots of protein, like a big rice bowl" },
    { role: "assistant", text: "Nice! What protein — chicken, beef, tofu? 🥘" },
    { role: "user", text: "Chicken with kimchi on the side" },
  ],
  [
    { role: "user", text: "I want something healthy but filling" },
    { role: "assistant", text: "Got it — like a grain bowl or a hearty salad? 🥗" },
    { role: "user", text: "Grain bowl with roasted veggies and tahini" },
  ],
  [
    { role: "user", text: "Tacos or burritos, anything Mexican" },
    { role: "assistant", text: "Classic! Any filling preference — carnitas, chicken, veggie? 🌯" },
    { role: "user", text: "Carnitas with guac and extra salsa" },
  ],
  [
    { role: "user", text: "Can we get more Indian options? Like butter chicken" },
    { role: "assistant", text: "That would be amazing! Would you want it with rice or naan? 🍛" },
    { role: "user", text: "Rice and garlic naan, and maybe some samosas too" },
  ],
  [
    { role: "user", text: "I'd love a poke bowl" },
    { role: "assistant", text: "Great choice! Tuna or salmon base? Any toppings in mind? 🐟" },
    { role: "user", text: "Salmon with avocado, edamame, and spicy mayo" },
  ],
  [
    { role: "user", text: "More vegan options please, the salad is getting old" },
    { role: "assistant", text: "Totally fair! What kind of vegan dishes excite you? 🌱" },
    { role: "user", text: "Maybe a vegan pad thai or a jackfruit sandwich" },
  ],
  [
    { role: "user", text: "Late night comfort food — mac and cheese or something warm" },
    { role: "assistant", text: "Comfort food hits different! Loaded mac or classic? 🧀" },
    { role: "user", text: "Loaded with bacon bits and jalapeños" },
  ],
];

const MCNAY_TRANSCRIPTS = [
  [
    { role: "user", text: "I need better coffee options, the current ones are too basic" },
    { role: "assistant", text: "What kind of coffee vibes — oat milk lattes, cold brew, pour over? ☕" },
    { role: "user", text: "Oat milk latte with vanilla, and maybe a cold brew option" },
  ],
  [
    { role: "user", text: "More pastry options would be nice" },
    { role: "assistant", text: "Love that! What kind — croissants, muffins, Danish? 🥐" },
    { role: "user", text: "Almond croissants and maybe some scones" },
  ],
  [
    { role: "user", text: "Can we get smoothie bowls or acai?" },
    { role: "assistant", text: "Great idea! Any favorite toppings? 🫐" },
    { role: "user", text: "Acai with granola, banana, and honey" },
  ],
  [
    { role: "user", text: "The matcha latte is great but I want more tea options" },
    { role: "assistant", text: "Nice! Like chai, oolong, or fruit teas? 🍵" },
    { role: "user", text: "Chai latte and maybe some fruit iced teas" },
  ],
  [
    { role: "user", text: "Better sandwich bread options, sourdough please" },
    { role: "assistant", text: "Sourdough is the move! Any specific sandwich combos? 🥪" },
    { role: "user", text: "Turkey avocado on sourdough with pesto" },
  ],
  [
    { role: "user", text: "I grab boba here every day, need more flavors" },
    { role: "assistant", text: "A boba fan! What flavors are you missing? 🧋" },
    { role: "user", text: "Taro and mango would be amazing" },
  ],
  [
    { role: "user", text: "Something sweet but not too heavy for a study snack" },
    { role: "assistant", text: "Like energy bites, a light cake, or yogurt parfait? 🍰" },
    { role: "user", text: "Yogurt parfait with berries, and maybe some madeleines" },
  ],
];

const CHARLEYS_TAGS = [
  ["spicy", "ramen", "tonkotsu", "noodles"],
  ["protein", "rice bowl", "chicken", "kimchi"],
  ["healthy", "grain bowl", "veggies", "tahini"],
  ["tacos", "burritos", "mexican", "carnitas"],
  ["indian", "butter chicken", "naan", "samosa"],
  ["poke", "salmon", "avocado", "japanese"],
  ["vegan", "pad thai", "plant-based", "jackfruit"],
  ["comfort food", "mac and cheese", "late night", "warm"],
];

const MCNAY_TAGS = [
  ["coffee", "oat milk", "latte", "cold brew"],
  ["pastry", "croissant", "almond", "scones"],
  ["smoothie", "acai", "granola", "healthy"],
  ["matcha", "chai", "tea", "iced tea"],
  ["sourdough", "sandwich", "pesto", "turkey"],
  ["boba", "taro", "mango", "milk tea"],
  ["yogurt", "parfait", "berries", "light snack"],
];

const NEGATIVE_FEEDBACK = [
  "Portions were way too small for the price",
  "Food was lukewarm, not hot enough",
  "Need more variety, same menu every week",
  "The ramen broth tasted watered down",
  "Waited 15 minutes in line, too slow",
  "Salad was wilted and not fresh",
  "Would love gluten-free bread options",
  "The wrap fell apart, needs better wrapping",
  "Coffee was burnt tasting today",
  "Pastries were stale by afternoon",
];

const FREE_TEXT_SAMPLES = [
  "More spicy options please!",
  "Love the ramen, keep it coming",
  "Would love a build-your-own bowl station",
  "The boba is addicting",
  "Need more vegan protein options",
  "A soup bar would be amazing in winter",
  "Breakfast options end too early",
  "The matcha latte is my go-to",
  "Can we get sushi rolls?",
  "More fresh fruit options please",
  "I'd eat bibimbap every day",
  "The portion sizes are perfect",
  "Would love overnight oats",
  "Need better decaf options",
  "A panini press would be game changing",
];

function pickWeightedN<T>(options: T[], weights: number[], n: number): T[] {
  const result: T[] = [];
  const usedIdx = new Set<number>();
  for (let i = 0; i < n && usedIdx.size < options.length; i++) {
    const available = options.map((o, idx) => ({ o, w: usedIdx.has(idx) ? 0 : weights[idx], idx }));
    const totalW = available.reduce((a, b) => a + b.w, 0);
    if (totalW === 0) break;
    let r = Math.random() * totalW;
    for (const { o, w, idx } of available) {
      r -= w;
      if (r <= 0) {
        result.push(o);
        usedIdx.add(idx);
        break;
      }
    }
  }
  return result;
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB\n");

  if (CLEAN) {
    const prefix = "seed-";
    await Promise.all([
      Session.deleteMany({ sessionId: { $regex: `^${prefix}` } }),
      Vote.deleteMany({ sessionId: { $regex: `^${prefix}` } }),
      Reaction.deleteMany({ sessionId: { $regex: `^${prefix}` } }),
      Preference.deleteMany({ sessionId: { $regex: `^${prefix}` } }),
      DeepTalk.deleteMany({ sessionId: { $regex: `^${prefix}` } }),
    ]);
    console.log("Cleaned existing seed data\n");
  }

  let sessionsCreated = 0;
  let votesCreated = 0;
  let reactionsCreated = 0;
  let prefsCreated = 0;
  let deepTalksCreated = 0;

  for (let i = 0; i < SESSION_COUNT; i++) {
    const venue: "charleys" | "mcnay" = i < 14 ? "charleys" : "mcnay";
    const sessionId = `seed-${venue}-${i.toString().padStart(3, "0")}`;
    const createdAt = randomDate(6);

    // Session
    await Session.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        entrySource: "qr",
        venueQR: venue,
        startedAt: createdAt,
        completedStage: "final",
        finishedAt: new Date(createdAt.getTime() + 90_000 + Math.random() * 120_000),
      },
      { upsert: true }
    );
    sessionsCreated++;

    // Votes (2-4 items)
    const items = venue === "charleys" ? CHARLEYS_ITEMS : MCNAY_ITEMS;
    const votedItems = pick(items, 2 + Math.floor(Math.random() * 3));
    for (const itemId of votedItems) {
      const value = Math.random() > 0.15 ? 1 : -1;
      await Vote.findOneAndUpdate(
        { sessionId, itemId },
        { sessionId, venue, itemId, value, createdAt },
        { upsert: true }
      );
      votesCreated++;
    }

    // Reaction
    const reactionVal = weightedPick(
      ["up", "mid", "down"] as const,
      [60, 25, 15]
    );
    const reactionDoc: Record<string, unknown> = {
      sessionId,
      itemId: venue,
      value: reactionVal,
      createdAt,
    };
    if (reactionVal === "down") {
      reactionDoc.feedback = NEGATIVE_FEEDBACK[Math.floor(Math.random() * NEGATIVE_FEEDBACK.length)];
    }
    await Reaction.create(reactionDoc);
    reactionsCreated++;

    // Preferences
    const prefConfig = venue === "charleys" ? CHARLEYS_PREFS : MCNAY_PREFS;
    const prefDoc: Record<string, unknown> = {
      sessionId,
      venue,
      flavors: pickWeightedN(prefConfig.flavors.options, prefConfig.flavors.weights, 2 + Math.floor(Math.random() * 2)),
      proteins: pickWeightedN(prefConfig.proteins.options, prefConfig.proteins.weights, 1 + Math.floor(Math.random() * 2)),
      dietary: pickWeightedN(prefConfig.dietary.options, prefConfig.dietary.weights, 1 + Math.floor(Math.random() * 2)),
      cuisines: pickWeightedN(prefConfig.cuisines.options, prefConfig.cuisines.weights, 1 + Math.floor(Math.random() * 2)),
      createdAt,
    };
    if (Math.random() > 0.6) {
      prefDoc.freeText = FREE_TEXT_SAMPLES[Math.floor(Math.random() * FREE_TEXT_SAMPLES.length)];
    }
    await Preference.findOneAndUpdate(
      { sessionId },
      prefDoc,
      { upsert: true }
    );
    prefsCreated++;

    // DeepTalk (70% of sessions have one)
    if (Math.random() > 0.3) {
      const transcripts = venue === "charleys" ? CHARLEYS_TRANSCRIPTS : MCNAY_TRANSCRIPTS;
      const tags = venue === "charleys" ? CHARLEYS_TAGS : MCNAY_TAGS;
      const idx = Math.floor(Math.random() * transcripts.length);
      const transcript = transcripts[idx].map((t) => ({
        ...t,
        ts: new Date(createdAt.getTime() + Math.random() * 60_000),
      }));
      await DeepTalk.create({
        sessionId,
        transcript,
        extractedTags: tags[idx] || [],
        createdAt,
      });
      deepTalksCreated++;
    }
  }

  console.log("=== Seed Summary ===");
  console.log(`Sessions:   ${sessionsCreated}`);
  console.log(`Votes:      ${votesCreated}`);
  console.log(`Reactions:  ${reactionsCreated}`);
  console.log(`Preferences:${prefsCreated}`);
  console.log(`DeepTalks:  ${deepTalksCreated}`);
  console.log(`\nVenue split: 14 Charley's, 11 McNay`);
  console.log("\nDone!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
