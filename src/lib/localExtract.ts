import type { Requirements } from "@/types";

const CATEGORY_MAP: Record<string, string> = {
  smartphone: "smartphones",
  phone: "smartphones",
  mobile: "smartphones",
  iphone: "smartphones",
  android: "smartphones",
  laptop: "laptops",
  notebook: "laptops",
  macbook: "laptops",
  headphones: "headphones",
  headphone: "headphones",
  earbuds: "headphones",
  earphone: "headphones",
  earphones: "headphones",
  speaker: "headphones",
  speakers: "headphones",
  watch: "womens-watches",
  smartwatch: "womens-watches",
  camera: "cameras",
  dslr: "cameras",
  television: "televisions",
  tv: "televisions",
  tablet: "tablets",
  ipad: "tablets",
  shoe: "mens-shoes",
  shoes: "mens-shoes",
  sneakers: "mens-shoes",
  jacket: "mens-shirts",
  shirt: "mens-shirts",
  bag: "womens-bags",
  backpack: "womens-bags",
  sunglasses: "sunglasses",
  fragrance: "fragrances",
  perfume: "fragrances",
  skincare: "skincare",
};

const PRIORITY_KEYWORDS: Record<string, string[]> = {
  battery: ["battery", "battery life", "charge", "long lasting"],
  camera: ["camera", "photo", "photography", "picture"],
  performance: ["performance", "speed", "fast", "processor", "cpu", "chip"],
  display: ["display", "screen", "resolution", "oled", "amoled"],
  storage: ["storage", "memory", "space", "gb"],
  portability: ["portability", "portable", "light", "lightweight", "weight", "thin"],
  durability: ["durability", "durable", "build", "rugged", "waterproof"],
  sound: ["sound", "audio", "noise", "anc", "bass"],
  comfort: ["comfort", "comfortable", "ergonomic"],
  design: ["design", "look", "aesthetic", "premium"],
  gaming: ["gaming", "game", "fps"],
  productivity: ["productivity", "work", "office", "multitask"],
  price: ["price", "budget", "cheap", "affordable", "value", "cost"],
};

const USE_CASE_KEYWORDS: Record<string, string[]> = {
  gaming: ["gaming", "game", "games", "gamer"],
  college: ["college", "student", "study", "university", "school"],
  work: ["work", "office", "business", "professional"],
  productivity: ["productivity", "multitask", "coding", "programming"],
  photography: ["photography", "photo", "camera work"],
  travel: ["travel", "commute", "trip", "flying"],
  fitness: ["fitness", "running", "workout", "gym", "exercise", "health"],
  entertainment: ["entertainment", "movies", "media", "streaming", "music"],
  budget: ["budget", "cheap", "affordable"],
};

function mapCategory(cat: string): string {
  const lower = cat.toLowerCase().trim();
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (lower.includes(key)) return CATEGORY_MAP[key];
  }
  return lower;
}

export function extractRequirementsLocal(query: string): Requirements {
  const text = query.toLowerCase();

  // Category
  let category = "smartphones";
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (text.includes(key)) {
      category = CATEGORY_MAP[key];
      break;
    }
  }

  // Budget
  let maxBudget: number | null = null;
  const budgetMatch = text.match(/(?:under|below|less than|max(?:imum)?|up to|within|around|≤)\s*\$?\s*(\d[\d,]*)/);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
  } else {
    const dollarMatch = text.match(/\$\s*(\d[\d,]*)/);
    if (dollarMatch) maxBudget = parseInt(dollarMatch[1].replace(/,/g, ""), 10);
  }

  // Priorities — detect "X matters more than Y" and "X is more important"
  const priorities: string[] = [];
  const prioritySet = new Set<string>();

  const moreThanMatch = text.match(
    /(\w+(?:\s\w+)?)\s+(?:matters|is|are)\s+more\s+(?:important|than)/,
  );
  if (moreThanMatch) {
    const p = moreThanMatch[1].trim();
    for (const [key, words] of Object.entries(PRIORITY_KEYWORDS)) {
      if (words.some((w) => p.includes(w))) {
        if (!prioritySet.has(key)) {
          prioritySet.add(key);
          priorities.push(key);
        }
        break;
      }
    }
  }

  const importantMatch = text.match(
    /(\w+(?:\s\w+)?)\s+(?:is|are)\s+(?:my\s+)?(?:top|main|most)\s+priority/,
  );
  if (importantMatch) {
    const p = importantMatch[1].trim();
    for (const [key, words] of Object.entries(PRIORITY_KEYWORDS)) {
      if (words.some((w) => p.includes(w))) {
        if (!prioritySet.has(key)) {
          prioritySet.add(key);
          priorities.unshift(key);
        }
        break;
      }
    }
  }

  // Detect all mentioned priorities
  for (const [key, words] of Object.entries(PRIORITY_KEYWORDS)) {
    if (words.some((w) => text.includes(w))) {
      if (!prioritySet.has(key)) {
        prioritySet.add(key);
        priorities.push(key);
      }
    }
  }

  // Use cases
  const useCases: string[] = [];
  const useCaseSet = new Set<string>();
  for (const [key, words] of Object.entries(USE_CASE_KEYWORDS)) {
    if (words.some((w) => text.includes(w))) {
      if (!useCaseSet.has(key)) {
        useCaseSet.add(key);
        useCases.push(key);
      }
    }
  }

  // Search keywords
  const searchKeywords: string[] = [];
  if (category) {
    const singular = category.replace(/s$/, "").replace(/-/g, " ");
    searchKeywords.push(singular);
  }
  for (const uc of useCases.slice(0, 2)) {
    if (uc !== "budget") searchKeywords.push(uc);
  }

  return {
    category,
    maxBudget,
    useCases,
    priorities,
    mustHaveSpecs: {},
    searchKeywords,
  };
}
