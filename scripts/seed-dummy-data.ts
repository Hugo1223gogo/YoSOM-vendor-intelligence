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
const SESSION_COUNT = 150;

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

// ── Charley's Transcripts (25 diverse conversations) ──────────────────
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
  [
    { role: "user", text: "A good sushi roll station would be incredible" },
    { role: "assistant", text: "Ooh yes! Any favorites — California, spicy tuna, dragon roll? 🍣" },
    { role: "user", text: "Spicy tuna and a shrimp tempura roll" },
  ],
  [
    { role: "user", text: "I miss good fried chicken, like Korean style" },
    { role: "assistant", text: "Korean fried chicken is elite! Wings, strips, or a sandwich? 🍗" },
    { role: "user", text: "A KFC sandwich with pickled daikon" },
  ],
  [
    { role: "user", text: "Can we do Mediterranean? Like falafel wraps" },
    { role: "assistant", text: "Great idea! Would you want it with hummus, tzatziki, or both? 🥙" },
    { role: "user", text: "Both! And some tabbouleh on the side" },
  ],
  [
    { role: "user", text: "Hot pot or shabu shabu style would be so cool" },
    { role: "assistant", text: "That sounds fun! What broth base — spicy, herbal, tomato? 🍲" },
    { role: "user", text: "Split pot, spicy and herbal, with thin sliced beef" },
  ],
  [
    { role: "user", text: "I just want a really good burger honestly" },
    { role: "assistant", text: "Classic! Any style — smash burger, brioche bun, veggie patty? 🍔" },
    { role: "user", text: "Smash burger with caramelized onions and special sauce" },
  ],
  [
    { role: "user", text: "Thai curry, green or red, doesn't matter" },
    { role: "assistant", text: "Both are amazing! With rice or noodles? 🍛" },
    { role: "user", text: "Green curry with jasmine rice and extra basil" },
  ],
  [
    { role: "user", text: "We need a good pasta station" },
    { role: "assistant", text: "Totally! What kind — carbonara, pesto, bolognese? 🍝" },
    { role: "user", text: "Spicy vodka rigatoni, that's trending everywhere" },
  ],
  [
    { role: "user", text: "Bibimbap would be perfect for lunch" },
    { role: "assistant", text: "Love it! Dolsot (hot stone) or regular? 🥘" },
    { role: "user", text: "Hot stone with a crispy egg on top" },
  ],
  [
    { role: "user", text: "Something lighter, like spring rolls or dumplings" },
    { role: "assistant", text: "Nice! Fried or fresh rolls? And for dumplings — steamed, pan-fried? 🥟" },
    { role: "user", text: "Fresh spring rolls and pan-fried pork dumplings" },
  ],
  [
    { role: "user", text: "I'd eat jerk chicken every day if you had it" },
    { role: "assistant", text: "Caribbean vibes! With rice and peas, or plantains? 🌴" },
    { role: "user", text: "Both, and some mango habanero sauce" },
  ],
  [
    { role: "user", text: "How about a build-your-own bowl concept?" },
    { role: "assistant", text: "That's super popular! What base — rice, noodles, greens? 🥗" },
    { role: "user", text: "Pick your base, pick your protein, pick your sauce — like Chipotle but Asian" },
  ],
  [
    { role: "user", text: "Dan dan noodles or mapo tofu would slap" },
    { role: "assistant", text: "Sichuan cravings! How spicy — mild, medium, mouth-numbing? 🌶️" },
    { role: "user", text: "Mouth-numbing with extra Sichuan peppercorn" },
  ],
  [
    { role: "user", text: "A good banh mi sandwich" },
    { role: "assistant", text: "Vietnamese classic! Pork, chicken, or tofu? 🥖" },
    { role: "user", text: "Lemongrass chicken with extra pickled carrots and jalapeño" },
  ],
  [
    { role: "user", text: "Honestly the portions are too small for the price" },
    { role: "assistant", text: "That's really helpful feedback. Which dish felt too small? 📏" },
    { role: "user", text: "The rice bowl — should be bigger for $10" },
  ],
  [
    { role: "user", text: "Need more gluten-free options, I have celiac" },
    { role: "assistant", text: "Totally valid! What kind of GF dishes would you want? 🌾" },
    { role: "user", text: "Rice noodle stir fry, or lettuce wraps with ground chicken" },
  ],
  [
    { role: "user", text: "A kebab plate with all the fixings" },
    { role: "assistant", text: "Turkish or Middle Eastern style? 🍢" },
    { role: "user", text: "Mixed grill — lamb and chicken with garlic sauce and pita" },
  ],
  [
    { role: "user", text: "Breakfast for lunch! Eggs, bacon, the works" },
    { role: "assistant", text: "Brunch vibes! Plated or sandwich style? 🍳" },
    { role: "user", text: "An egg sandwich on English muffin with avocado and hot sauce" },
  ],
];

// ── McNay Transcripts (25 diverse conversations) ──────────────────
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
  [
    { role: "user", text: "I want an iced lavender latte so bad" },
    { role: "assistant", text: "Lavender is so in right now! With oat milk or regular? 💜" },
    { role: "user", text: "Oat milk, light ice, maybe with honey" },
  ],
  [
    { role: "user", text: "The cakes here are too sweet, can we get something less sugary?" },
    { role: "assistant", text: "Totally — like a basque cheesecake, banana bread, or carrot cake? 🍰" },
    { role: "user", text: "Basque cheesecake sounds amazing, and banana bread with walnuts" },
  ],
  [
    { role: "user", text: "More grab and go options for between classes" },
    { role: "assistant", text: "Quick bites! Like wraps, protein boxes, or onigiri? 🍙" },
    { role: "user", text: "Onigiri and protein snack boxes would be clutch" },
  ],
  [
    { role: "user", text: "Affogato or espresso over ice cream please" },
    { role: "assistant", text: "A dessert-coffee hybrid! Any ice cream flavor preference? 🍨" },
    { role: "user", text: "Vanilla or salted caramel with a double shot" },
  ],
  [
    { role: "user", text: "Do you have anything savory? I can't just eat sweets all day" },
    { role: "assistant", text: "Good point! Like quiche, savory scones, or a hot panini? 🥧" },
    { role: "user", text: "Quiche lorraine and maybe a ham and cheese croissant" },
  ],
  [
    { role: "user", text: "A proper matcha with real Japanese powder, not the sugary premix" },
    { role: "assistant", text: "Respect for the matcha standards! Ceremonial grade? 🍵" },
    { role: "user", text: "Ceremonial grade, whisked not blended, with just a touch of oat milk" },
  ],
  [
    { role: "user", text: "Fresh squeezed juice or lemonade would be refreshing" },
    { role: "assistant", text: "Refreshing! Any combos in mind — OJ, green juice, strawberry lemon? 🍋" },
    { role: "user", text: "Green juice and a strawberry basil lemonade" },
  ],
  [
    { role: "user", text: "I want a really good bagel with cream cheese" },
    { role: "assistant", text: "Classic! Everything bagel, or other flavors? Any schmear preferences? 🥯" },
    { role: "user", text: "Everything bagel with scallion cream cheese and lox" },
  ],
  [
    { role: "user", text: "Bubble waffle or Hong Kong egg waffle with toppings" },
    { role: "assistant", text: "Fun pick! Ice cream inside, or more like a sweet crepe vibe? 🧇" },
    { role: "user", text: "With soft serve, Oreo crumbs, and condensed milk drizzle" },
  ],
  [
    { role: "user", text: "Can you do overnight oats or chia pudding?" },
    { role: "assistant", text: "Both are great for grab-and-go! Any flavor ideas? 🥣" },
    { role: "user", text: "Mango chia pudding and PB banana overnight oats" },
  ],
  [
    { role: "user", text: "Flat white, done properly, that's all I ask" },
    { role: "assistant", text: "A person of taste! Any bean preference — single origin? ☕" },
    { role: "user", text: "Ethiopian single origin if possible, medium roast" },
  ],
  [
    { role: "user", text: "A salad bar or grain bowl option at the cafe" },
    { role: "assistant", text: "Healthy lunch at the cafe! What ingredients are must-haves? 🥗" },
    { role: "user", text: "Quinoa, roasted sweet potato, feta, and a lemon dressing" },
  ],
  [
    { role: "user", text: "Cinnamon rolls fresh out of the oven" },
    { role: "assistant", text: "Warm and gooey! Classic cream cheese frosting or something different? 🍩" },
    { role: "user", text: "Brown butter frosting, less sweet than cream cheese" },
  ],
  [
    { role: "user", text: "Tiramisu or cannoli as a dessert option" },
    { role: "assistant", text: "Italian dessert vibes! Classic or any fun twist? 🇮🇹" },
    { role: "user", text: "Classic tiramisu, none of that matcha tiramisu stuff" },
  ],
  [
    { role: "user", text: "A hot chocolate that's actually rich, not watery" },
    { role: "assistant", text: "Real chocolate, not powder! Any flavor additions — mocha, peppermint? 🍫" },
    { role: "user", text: "Dark chocolate with a shot of espresso — basically a mocha" },
  ],
  [
    { role: "user", text: "Protein shakes or post-gym smoothies" },
    { role: "assistant", text: "Functional drinks! What base — whey, plant protein, collagen? 💪" },
    { role: "user", text: "Plant protein with banana, PB, and almond milk" },
  ],
  [
    { role: "user", text: "Vietnamese iced coffee would be a game changer" },
    { role: "assistant", text: "Ca phe sua da! With condensed milk the traditional way? 🇻🇳" },
    { role: "user", text: "Yes! The real deal with condensed milk and strong dark roast" },
  ],
  [
    { role: "user", text: "Cookies! Good ones, not the prepackaged kind" },
    { role: "assistant", text: "Fresh baked! What kind — chocolate chip, oatmeal raisin, snickerdoodle? 🍪" },
    { role: "user", text: "Brown butter chocolate chip and maybe a matcha white choc cookie" },
  ],
];

// ── Charley's Tags (25 sets) ──────────────────
const CHARLEYS_TAGS = [
  ["spicy", "ramen", "tonkotsu", "noodles"],
  ["protein", "rice bowl", "chicken", "kimchi"],
  ["healthy", "grain bowl", "veggies", "tahini"],
  ["tacos", "burritos", "mexican", "carnitas"],
  ["indian", "butter chicken", "naan", "samosa"],
  ["poke", "salmon", "avocado", "japanese"],
  ["vegan", "pad thai", "plant-based", "jackfruit"],
  ["comfort food", "mac and cheese", "late night", "warm"],
  ["sushi", "spicy tuna", "shrimp tempura", "japanese"],
  ["korean fried chicken", "sandwich", "pickled daikon", "crispy"],
  ["falafel", "mediterranean", "hummus", "tabbouleh"],
  ["hot pot", "shabu shabu", "beef", "sichuan"],
  ["burger", "smash burger", "caramelized onions", "american"],
  ["thai curry", "green curry", "jasmine rice", "basil"],
  ["pasta", "vodka rigatoni", "italian", "spicy"],
  ["bibimbap", "hot stone", "korean", "egg"],
  ["spring rolls", "dumplings", "pan-fried", "pork"],
  ["jerk chicken", "caribbean", "plantains", "mango habanero"],
  ["build your own", "customizable", "bowl", "asian fusion"],
  ["dan dan noodles", "mapo tofu", "sichuan", "numbing spicy"],
  ["banh mi", "vietnamese", "lemongrass", "pickled vegetables"],
  ["portions", "value", "feedback", "price"],
  ["gluten-free", "celiac", "rice noodles", "lettuce wraps"],
  ["kebab", "mixed grill", "lamb", "middle eastern"],
  ["breakfast", "brunch", "egg sandwich", "avocado"],
];

// ── McNay Tags (25 sets) ──────────────────
const MCNAY_TAGS = [
  ["coffee", "oat milk", "latte", "cold brew"],
  ["pastry", "croissant", "almond", "scones"],
  ["smoothie", "acai", "granola", "healthy"],
  ["matcha", "chai", "tea", "iced tea"],
  ["sourdough", "sandwich", "pesto", "turkey"],
  ["boba", "taro", "mango", "milk tea"],
  ["yogurt", "parfait", "berries", "light snack"],
  ["lavender latte", "oat milk", "honey", "floral"],
  ["basque cheesecake", "banana bread", "less sweet", "walnuts"],
  ["grab and go", "onigiri", "protein box", "quick"],
  ["affogato", "espresso", "ice cream", "salted caramel"],
  ["quiche", "savory", "ham and cheese", "croissant"],
  ["ceremonial matcha", "japanese", "whisked", "premium"],
  ["fresh juice", "lemonade", "green juice", "strawberry basil"],
  ["bagel", "lox", "cream cheese", "everything"],
  ["bubble waffle", "soft serve", "oreo", "egg waffle"],
  ["overnight oats", "chia pudding", "mango", "PB banana"],
  ["flat white", "single origin", "ethiopian", "medium roast"],
  ["grain bowl", "quinoa", "sweet potato", "feta"],
  ["cinnamon roll", "brown butter", "fresh baked", "pastry"],
  ["tiramisu", "cannoli", "italian dessert", "classic"],
  ["hot chocolate", "dark chocolate", "mocha", "rich"],
  ["protein shake", "plant protein", "post-gym", "smoothie"],
  ["vietnamese coffee", "condensed milk", "dark roast", "iced"],
  ["cookies", "brown butter", "chocolate chip", "matcha white choc"],
];

// ── Negative Feedback (expanded) ──────────────────
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
  "Rice was undercooked and hard",
  "Too much salt in the soup today",
  "The chicken was dry and overcooked",
  "Not enough vegetarian options",
  "The sauce was way too sweet",
  "Bowl was mostly rice, barely any toppings",
  "Please use fresher ingredients",
  "The drink was mostly ice, not enough actual drink",
  "Line was so long I gave up and left",
  "The price went up but quality went down",
  "Allergen labeling needs to be better",
  "Ran out of the popular items by noon",
  "Seating area was dirty when I went",
  "The burrito was soggy at the bottom",
  "No options for people with nut allergies",
];

// ── Free Text Samples (expanded) ──────────────────
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
  "Please bring back the poke bowl",
  "Late night food options would be amazing",
  "The Korean rice bowl is underrated",
  "More gluten-free desserts please",
  "The coffee quality has improved a lot!",
  "I wish we had a salad bar",
  "Rotating seasonal specials would be cool",
  "The Thai salad dressing is incredible",
  "Can we get real chopsticks not the wooden ones?",
  "Love the variety this semester",
  "Smoothie bowls in the morning would be perfect",
  "The croissants sell out too fast",
  "Please add a loyalty/points system",
  "Halal options are really appreciated",
  "Indian food Fridays would be epic",
  "The cold brew is too strong, need a lighter option",
  "More plant-based milk choices please",
  "Wish there was a hot sauce bar",
  "The avocado toast was surprisingly good",
  "Need a quick grab section for 5-min breaks",
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

  // 85 Charley's, 65 McNay
  const charleyCount = 85;

  for (let i = 0; i < SESSION_COUNT; i++) {
    const venue: "charleys" | "mcnay" = i < charleyCount ? "charleys" : "mcnay";
    const sessionId = `seed-${venue}-${i.toString().padStart(3, "0")}`;
    const createdAt = randomDate(7);

    // Session — vary entry source
    const entrySource = Math.random() > 0.3 ? "qr" : "instagram";
    await Session.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        entrySource,
        venueQR: venue,
        startedAt: createdAt,
        completedStage: "final",
        finishedAt: new Date(createdAt.getTime() + 60_000 + Math.random() * 180_000),
      },
      { upsert: true }
    );
    sessionsCreated++;

    // Votes (2-4 items)
    const items = venue === "charleys" ? CHARLEYS_ITEMS : MCNAY_ITEMS;
    const voteCount = 2 + Math.floor(Math.random() * 3);
    const votedItems = pick(items, voteCount);
    for (const itemId of votedItems) {
      const value = Math.random() > 0.2 ? 1 : -1;
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
      [55, 28, 17]
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

    // Preferences — vary how many they pick
    const prefConfig = venue === "charleys" ? CHARLEYS_PREFS : MCNAY_PREFS;
    const flavorCount = 1 + Math.floor(Math.random() * 3); // 1-3
    const proteinCount = 1 + Math.floor(Math.random() * 2); // 1-2
    const dietaryCount = Math.random() > 0.4 ? 1 + Math.floor(Math.random() * 2) : 1; // 1-2
    const cuisineCount = 1 + Math.floor(Math.random() * 2); // 1-2

    const prefDoc: Record<string, unknown> = {
      sessionId,
      venue,
      flavors: pickWeightedN(prefConfig.flavors.options, prefConfig.flavors.weights, flavorCount),
      proteins: pickWeightedN(prefConfig.proteins.options, prefConfig.proteins.weights, proteinCount),
      dietary: pickWeightedN(prefConfig.dietary.options, prefConfig.dietary.weights, dietaryCount),
      cuisines: pickWeightedN(prefConfig.cuisines.options, prefConfig.cuisines.weights, cuisineCount),
      createdAt,
    };
    // ~45% leave a free text comment
    if (Math.random() > 0.55) {
      prefDoc.freeText = FREE_TEXT_SAMPLES[Math.floor(Math.random() * FREE_TEXT_SAMPLES.length)];
    }
    await Preference.findOneAndUpdate(
      { sessionId },
      prefDoc,
      { upsert: true }
    );
    prefsCreated++;

    // DeepTalk — 65% of sessions
    if (Math.random() > 0.35) {
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
  console.log(`Sessions:    ${sessionsCreated}`);
  console.log(`Votes:       ${votesCreated}`);
  console.log(`Reactions:   ${reactionsCreated}`);
  console.log(`Preferences: ${prefsCreated}`);
  console.log(`DeepTalks:   ${deepTalksCreated}`);
  console.log(`\nVenue split: ${charleyCount} Charley's, ${SESSION_COUNT - charleyCount} McNay`);
  console.log("\nDone! 🎉");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
