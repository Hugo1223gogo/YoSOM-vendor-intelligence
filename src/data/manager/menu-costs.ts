// Cost / sale price model for current and candidate menu items.
// Numbers are illustrative — replace with real SOM dining data when available.

import type { CostItem } from "@/lib/manager/types";

export const COST_ITEMS: CostItem[] = [
  // ── Charley's current items
  {
    itemId: "ramen",
    name: "Spicy Tonkotsu Ramen",
    emoji: "🍜",
    category: "main",
    costPerServing: 3.2,
    salePrice: 11.5,
    baselineDailyServings: 50,
    dietary: ["contains-gluten", "contains-soy"],
    venues: ["charleys"],
  },
  {
    itemId: "bowl",
    name: "Korean Rice Bowl",
    emoji: "🍱",
    category: "main",
    costPerServing: 2.9,
    salePrice: 10.5,
    baselineDailyServings: 45,
    dietary: ["contains-soy", "gluten-free-option"],
    venues: ["charleys"],
  },
  {
    itemId: "salad",
    name: "Plain Quinoa Salad",
    emoji: "🥗",
    category: "main",
    costPerServing: 2.1,
    salePrice: 9.0,
    baselineDailyServings: 25,
    dietary: ["vegan", "gluten-free"],
    venues: ["charleys"],
  },
  {
    itemId: "burrito",
    name: "Carnitas Burrito",
    emoji: "🌯",
    category: "main",
    costPerServing: 2.5,
    salePrice: 9.5,
    baselineDailyServings: 38,
    dietary: ["contains-gluten", "contains-dairy"],
    venues: ["charleys"],
  },
  // Charley's candidate (suggested) items
  {
    itemId: "butter-chicken",
    name: "Butter Chicken with Naan",
    emoji: "🍛",
    category: "main",
    costPerServing: 3.5,
    salePrice: 11.0,
    baselineDailyServings: 0,
    dietary: ["contains-gluten", "contains-dairy"],
    venues: ["charleys"],
  },
  {
    itemId: "poke",
    name: "Salmon Poke Bowl",
    emoji: "🐟",
    category: "main",
    costPerServing: 4.2,
    salePrice: 13.0,
    baselineDailyServings: 0,
    dietary: ["gluten-free-option", "contains-soy"],
    venues: ["charleys"],
  },
  {
    itemId: "pad-thai",
    name: "Vegan Pad Thai",
    emoji: "🥢",
    category: "main",
    costPerServing: 2.8,
    salePrice: 10.0,
    baselineDailyServings: 0,
    dietary: ["vegan", "contains-soy"],
    venues: ["charleys"],
  },

  // ── McNay current items
  {
    itemId: "sandwich",
    name: "Turkey Avocado Sandwich",
    emoji: "🥪",
    category: "main",
    costPerServing: 2.3,
    salePrice: 8.5,
    baselineDailyServings: 35,
    dietary: ["contains-gluten", "contains-dairy"],
    venues: ["mcnay"],
  },
  {
    itemId: "matcha",
    name: "Matcha Latte",
    emoji: "🍵",
    category: "drink",
    costPerServing: 1.4,
    salePrice: 5.5,
    baselineDailyServings: 60,
    dietary: ["contains-dairy", "vegan-option"],
    venues: ["mcnay"],
  },
  {
    itemId: "boba",
    name: "Brown Sugar Boba",
    emoji: "🧋",
    category: "drink",
    costPerServing: 1.3,
    salePrice: 5.0,
    baselineDailyServings: 55,
    dietary: ["contains-dairy"],
    venues: ["mcnay"],
  },
  {
    itemId: "wrap",
    name: "Hummus Veggie Wrap",
    emoji: "🌯",
    category: "main",
    costPerServing: 2.1,
    salePrice: 8.0,
    baselineDailyServings: 28,
    dietary: ["vegan", "contains-gluten"],
    venues: ["mcnay"],
  },
  // McNay candidates
  {
    itemId: "oat-latte",
    name: "Oat Milk Cold Brew",
    emoji: "☕",
    category: "drink",
    costPerServing: 1.1,
    salePrice: 5.0,
    baselineDailyServings: 0,
    dietary: ["vegan", "dairy-free"],
    venues: ["mcnay"],
  },
  {
    itemId: "acai",
    name: "Acai Bowl",
    emoji: "🫐",
    category: "main",
    costPerServing: 3.2,
    salePrice: 9.5,
    baselineDailyServings: 0,
    dietary: ["vegan", "gluten-free"],
    venues: ["mcnay"],
  },
  {
    itemId: "almond-croissant",
    name: "Almond Croissant",
    emoji: "🥐",
    category: "pastry",
    costPerServing: 1.2,
    salePrice: 4.5,
    baselineDailyServings: 0,
    dietary: ["contains-gluten", "contains-nuts", "contains-dairy"],
    venues: ["mcnay"],
  },
];

export function costsForVenue(venue: "charleys" | "mcnay"): CostItem[] {
  return COST_ITEMS.filter((i) => i.venues.includes(venue));
}

export function findCostItem(name: string): CostItem | undefined {
  const norm = name.toLowerCase();
  return COST_ITEMS.find(
    (i) => i.name.toLowerCase() === norm || i.itemId === norm,
  );
}
