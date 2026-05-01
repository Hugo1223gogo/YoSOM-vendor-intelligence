export type OptionItem = { id: string; label: string };

// --- Charley's (canteen/restaurant) ---

export const FLAVOR_OPTIONS: OptionItem[] = [
  { id: "spicy", label: "Spicy 🌶️" },
  { id: "sweet", label: "Sweet 🍯" },
  { id: "savory", label: "Savory 🧈" },
  { id: "umami", label: "Umami 🍄" },
  { id: "sour", label: "Sour 🍋" },
  { id: "smoky", label: "Smoky 🔥" },
];

export const PROTEIN_OPTIONS: OptionItem[] = [
  { id: "chicken", label: "Chicken 🍗" },
  { id: "tofu", label: "Tofu 🧊" },
  { id: "beef", label: "Beef 🥩" },
  { id: "shrimp", label: "Shrimp 🦐" },
  { id: "veggies", label: "Veggies 🥬" },
  { id: "fish", label: "Fish 🐟" },
];

export const DIETARY_OPTIONS: OptionItem[] = [
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "vegan", label: "Vegan 🌱" },
  { id: "nut-free", label: "Nut-free" },
  { id: "halal", label: "Halal" },
  { id: "none", label: "No restrictions" },
];

export const CUISINE_OPTIONS: OptionItem[] = [
  { id: "asian", label: "Asian 🥢" },
  { id: "mexican", label: "Mexican 🌮" },
  { id: "italian", label: "Italian 🍝" },
  { id: "mediterranean", label: "Mediterranean 🫒" },
  { id: "american", label: "American 🍔" },
  { id: "indian", label: "Indian 🍛" },
];

// --- McNay Cafe (cafe/drinks) ---

export const MCNAY_FLAVOR_OPTIONS: OptionItem[] = [
  { id: "sweet", label: "Sweet 🍯" },
  { id: "rich", label: "Rich 🍫" },
  { id: "fruity", label: "Fruity 🍓" },
  { id: "nutty", label: "Nutty 🥜" },
  { id: "refreshing", label: "Refreshing 🧊" },
  { id: "earthy", label: "Earthy 🍵" },
];

export const MCNAY_ITEM_OPTIONS: OptionItem[] = [
  { id: "coffee", label: "Coffee ☕" },
  { id: "matcha", label: "Matcha 🍵" },
  { id: "smoothie", label: "Smoothies 🥤" },
  { id: "pastry", label: "Pastries 🥐" },
  { id: "cake", label: "Cakes 🍰" },
  { id: "bread", label: "Bread 🍞" },
];

export const MCNAY_DIETARY_OPTIONS: OptionItem[] = [
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "vegan", label: "Vegan 🌱" },
  { id: "sugar-free", label: "Low sugar" },
  { id: "oat-milk", label: "Oat milk 🥛" },
  { id: "none", label: "No restrictions" },
];

export const MCNAY_VIBE_OPTIONS: OptionItem[] = [
  { id: "grab-and-go", label: "Grab & go 🏃" },
  { id: "study-fuel", label: "Study fuel 📚" },
  { id: "treat-yourself", label: "Treat yourself 🎉" },
  { id: "healthy", label: "Healthy pick 🥗" },
  { id: "cozy", label: "Cozy & warm 🧣" },
  { id: "iced", label: "Iced drinks 🧋" },
];
