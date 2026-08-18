import type { Requirements } from "@/types";
import { USD_TO_INR_RATE } from "./currency";

const CATEGORY_MAP: Record<string, string> = {
  smartwatch: "smartwatches",
  "smart watch": "smartwatches",
  smartwatches: "smartwatches",
  watch: "smartwatches",
  watches: "smartwatches",
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
  battery: ["battery", "battery life", "charge", "long lasting", "mah", "backup"],
  camera: ["camera", "photo", "photography", "picture", "mp", "video", "sensor"],
  performance: ["performance", "speed", "fast", "processor", "cpu", "chip", "ram", "lag free", "smooth"],
  display: ["display", "screen", "resolution", "oled", "amoled", "120hz", "refresh rate", "brightness"],
  storage: ["storage", "memory", "space", "gb", "tb", "ssd"],
  portability: ["portability", "portable", "light", "lightweight", "weight", "thin", "compact"],
  durability: ["durability", "durable", "build", "rugged", "waterproof", "ip68", "tough"],
  sound: ["sound", "audio", "noise", "anc", "bass", "clear audio", "noise cancellation"],
  comfort: ["comfort", "comfortable", "ergonomic", "fit"],
  design: ["design", "look", "aesthetic", "premium", "finish"],
  gaming: ["gaming", "game", "fps", "gpu", "graphics", "high frame"],
  productivity: ["productivity", "work", "office", "multitask", "coding", "programming"],
  price: ["price", "budget", "cheap", "affordable", "value", "cost", "pocket friendly"],
};

const USE_CASE_KEYWORDS: Record<string, string[]> = {
  gaming: ["gaming", "game", "games", "gamer", "fps", "esports"],
  college: ["college", "student", "study", "university", "school", "classes", "campus"],
  work: ["work", "office", "business", "professional", "remote"],
  productivity: ["productivity", "multitask", "coding", "programming", "developer"],
  photography: ["photography", "photo", "camera work", "vlogging", "creator"],
  travel: ["travel", "commute", "trip", "flying", "transit"],
  fitness: ["fitness", "running", "workout", "gym", "exercise", "health", "sports", "tracking"],
  entertainment: ["entertainment", "movies", "media", "streaming", "music", "binge", "netflix"],
  budget: ["budget", "cheap", "affordable", "value for money"],
};

function parseIndianBudget(text: string): number | null {
  // Pattern 1: numbers with 'k' or 'thousand' with prefix (under 40k, budget ₹40k, rs. 50k, 15 k, 40 thousand)
  const kWithPrefixMatch = text.match(
    /(?:under|below|less than|max(?:imum)?|up to|within|around|≤|budget(?:\s*(?:of|:))?)\s*(?:₹|rs\.?|inr|\$)?\s*(\d+(?:\.\d+)?)\s*(?:k\b|thousand\b)/i,
  );
  if (kWithPrefixMatch) {
    return Math.round(parseFloat(kWithPrefixMatch[1]) * 1000);
  }

  // Pattern 2: Lakhs / Lac format (e.g. 1.9 lakh, 1.5L, 2 lakhs, 1.9 lac)
  const lakhMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l\b)/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // Pattern 3: ₹ or Rs symbol with 'k' or 'thousand' (₹40k, Rs 50k, INR 15k)
  const symbolKMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(?:k\b|thousand\b)/i);
  if (symbolKMatch) {
    return Math.round(parseFloat(symbolKMatch[1]) * 1000);
  }

  // Pattern 4: Explicit INR symbols followed by full number (₹40,000, ₹1 90 000, Rs. 40000, INR 50000)
  const inrSymbolMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d\s,]+)/i);
  if (inrSymbolMatch) {
    const raw = parseInt(inrSymbolMatch[1].replace(/[\s,]/g, ""), 10);
    if (!isNaN(raw) && raw > 0) return raw;
  }

  // Pattern 5: Number followed by 'INR', 'Rs', or 'Rupees' (40000 inr, 1 90 000 rs, 50,000 rs, 40k inr)
  const trailingInrMatch = text.match(/([\d\s,]+)\s*(?:inr|rs\.?|rupees?)/i);
  if (trailingInrMatch) {
    const raw = parseInt(trailingInrMatch[1].replace(/[\s,]/g, ""), 10);
    if (!isNaN(raw) && raw > 0) return raw;
  }

  // Pattern 6: Standalone '40k' or '40 thousand'
  const standaloneKMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:k\b|thousand\b)/i);
  if (standaloneKMatch) {
    return Math.round(parseFloat(standaloneKMatch[1]) * 1000);
  }

  // Pattern 7: Standard budget phrase with full number (under 40000, under 1 90 000, below 50000, max 70,000)
  const generalBudgetMatch = text.match(
    /(?:under|below|less than|max(?:imum)?|up to|within|around|≤|budget(?:\s*(?:of|:))?)\s*([\d\s,]+)/i,
  );
  if (generalBudgetMatch) {
    const raw = parseInt(generalBudgetMatch[1].replace(/[\s,]/g, ""), 10);
    if (!isNaN(raw) && raw > 0) {
      // If the number is small like 40 or 50 without 'k', but likely meant thousands
      if (raw <= 200 && (text.includes("phone") || text.includes("laptop") || text.includes("mobile"))) {
        return raw * 1000;
      }
      return raw;
    }
  }

  // Pattern 8: USD dollar amount ($500 -> converted to INR)
  const dollarMatch = text.match(/\$\s*([\d\s,]+)/);
  if (dollarMatch) {
    const usd = parseInt(dollarMatch[1].replace(/[\s,]/g, ""), 10);
    if (!isNaN(usd) && usd > 0) {
      return Math.round(usd * USD_TO_INR_RATE);
    }
  }

  return null;
}

export function extractRequirementsLocal(query: string): Requirements {
  const text = query.toLowerCase();

  // Category detection (match longest keywords first to prevent 'phone' matching 'headphones')
  let category = "smartphones";
  const sortedCatKeys = Object.keys(CATEGORY_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedCatKeys) {
    if (text.includes(key)) {
      category = CATEGORY_MAP[key];
      break;
    }
  }

  // Budget detection (normalized to INR)
  const maxBudget = parseIndianBudget(text);

  // Priorities — detect "X matters more than Y" and "X is my top priority"
  const priorities: string[] = [];
  const prioritySet = new Set<string>();

  const moreThanMatch = text.match(
    /(\w+(?:\s\w+)?)\s+(?:matters|is|are)\s+more\s+(?:important|than)/i,
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
    /(\w+(?:\s\w+)?)\s+(?:is|are)\s+(?:my\s+)?(?:top|main|most|first|primary)\s+priority/i,
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
  if (category === "smartwatches") {
    searchKeywords.push("smartwatch", "watch");
  } else if (category) {
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
