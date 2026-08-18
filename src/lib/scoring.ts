import type {
  Product,
  RankedProduct,
  Requirements,
  ScoreBreakdown,
  MatchReason,
} from "@/types";

const WEIGHTS = {
  budgetFit: 0.3,
  priorityMatch: 0.25,
  useCaseFit: 0.2,
  ratingNorm: 0.15,
  specMatch: 0.1,
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// How well a product's spec value satisfies a given priority dimension
function specScoreForPriority(
  product: Product,
  priority: string,
): number {
  const s = product.specs;
  const title = (product.title + " " + product.tags.join(" ")).toLowerCase();
  const p = priority.toLowerCase();

  if (p === "battery" || p === "battery life") {
    const b = s.battery || "";
    const m = b.match(/(\d+)\s*(mah|hrs|hr)/i);
    if (m) {
      const v = parseInt(m[1], 10);
      if (/mah/i.test(b)) return clamp01(v / 6000);
      return clamp01(v / 16);
    }
    return 0.4;
  }
  if (p === "performance" || p === "processor" || p === "speed") {
    const perf = s.performance || "";
    const perfLower = perf.toLowerCase();
    if (/8 gen 2|7 gen 1|dimensity 7|tensor g3|m2|ryzen 7|ryzen 9/i.test(perfLower)) return 0.95;
    if (/i7|ryzen 5|dimensity|7 gen/i.test(perfLower)) return 0.8;
    if (/i5|helio|a16/i.test(perfLower)) return 0.65;
    if (perf) return 0.5;
    return 0.4;
  }
  if (p === "camera") {
    const c = s.camera || "";
    const m = c.match(/(\d+)mp/i);
    if (m) return clamp01(parseInt(m[1], 10) / 200);
    return 0.4;
  }
  if (p === "display" || p === "screen") {
    const d = s.display || "";
    if (/oled|amoled|retina|2.8k|qhd|4k|120hz|165hz/i.test(d)) return 0.95;
    if (/ips|fhd|lcd/i.test(d)) return 0.6;
    if (d) return 0.5;
    return 0.4;
  }
  if (p === "storage") {
    const st = s.storage || "";
    const m = st.match(/(\d+)\s*(gb|tb)/i);
    if (m) {
      const v = parseInt(m[1], 10) * (/tb/i.test(m[2]) ? 1000 : 1);
      return clamp01(v / 1024);
    }
    return 0.4;
  }
  if (p === "price" || p === "budget" || p === "value") {
    return 0.7;
  }
  if (p === "portability" || p === "weight" || p === "lightweight") {
    const w = s.portability || s.weight || "";
    const m = w.match(/([\d.]+)\s*(kg|g)\b/i);
    if (m) {
      let v = parseFloat(m[1]);
      if (/kg/i.test(m[2])) v *= 1000;
      return clamp01(1 - v / 3000);
    }
    return 0.5;
  }
  if (p === "durability" || p === "build") {
    const d = s.durability || "";
    if (/ip68|mil-std|water|ripstop|rubber/i.test(d.toLowerCase())) return 0.9;
    if (d) return 0.7;
    return 0.5;
  }
  if (p === "sound" || p === "audio") {
    const so = s.sound || "";
    if (/dolby|anc|spatial|dts/i.test(so.toLowerCase())) return 0.95;
    if (so) return 0.7;
    return 0.5;
  }
  if (p === "comfort") {
    const c = s.comfort || "";
    if (/memory foam|plush|gel|cushion/i.test(c.toLowerCase())) return 0.95;
    if (c) return 0.7;
    return 0.5;
  }
  if (p === "design") {
    return 0.6;
  }
  if (p === "gaming") {
    if (s.gaming) return 0.95;
    if (/gaming|165hz|120hz|8 gen|gpu/i.test(title)) return 0.8;
    return 0.3;
  }
  if (p === "productivity" || p === "college" || p === "work") {
    if (s.productivity) return 0.9;
    if (/i5|i7|ryzen 5|ryzen 7|16gb|32gb/i.test((s.performance || "") + " " + (s.storage || ""))) return 0.8;
    return 0.5;
  }
  return 0.5;
}

function useCaseScore(product: Product, useCase: string): number {
  const u = useCase.toLowerCase();
  const text = (
    product.title +
    " " +
    product.tags.join(" ") +
    " " +
    product.description +
    " " +
    Object.values(product.specs).join(" ")
  ).toLowerCase();

  if (u === "gaming") {
    if (/gaming|gpu|165hz|120hz|8 gen|dimensity 7|snapdragon 8/i.test(text)) return 0.95;
    return 0.3;
  }
  if (u === "college" || u === "student" || u === "study") {
    if (/college|student|productivity|lightweight|portability|16gb|14/i.test(text)) return 0.85;
    return 0.5;
  }
  if (u === "work" || u === "office" || u === "productivity") {
    if (/productivity|office|work|16gb|32gb|ssd/i.test(text)) return 0.85;
    return 0.5;
  }
  if (u === "photography" || u === "camera") {
    if (/camera|mp|full-frame|aps|oled/i.test(text)) return 0.9;
    return 0.3;
  }
  if (u === "travel" || u === "commute") {
    if (/portab|light|compact|noise cancel|anc|wireless/i.test(text)) return 0.85;
    return 0.4;
  }
  if (u === "fitness" || u === "running" || u === "workout") {
    if (/fitness|heart|spo2|gps|cushion|running|sport/i.test(text)) return 0.9;
    return 0.3;
  }
  if (u === "entertainment" || u === "media" || u === "movies") {
    if (/oled|amoled|dolby|spatial|4k|120hz/i.test(text)) return 0.9;
    return 0.5;
  }
  if (u === "budget" || u === "value" || u === "cheap") {
    return 0.7;
  }
  return 0.5;
}

function specMatchScore(product: Product, mustHave: Record<string, string>): number {
  const keys = Object.keys(mustHave);
  if (keys.length === 0) return 0.7;
  let total = 0;
  for (const key of keys) {
    const required = mustHave[key].toLowerCase();
    const allSpecs = Object.entries(product.specs)
      .map(([k, v]) => `${k} ${v || ""}`)
      .join(" ")
      .toLowerCase();
    if (allSpecs.includes(required)) total += 1;
    else if (
      Object.values(product.specs).some((v) =>
        (v || "").toLowerCase().includes(required),
      )
    )
      total += 0.7;
    else total += 0.2;
  }
  return total / keys.length;
}

export function scoreProduct(
  product: Product,
  req: Requirements,
  minPrice: number,
  maxPrice: number,
): RankedProduct {
  // Budget fit
  let budgetFit: number;
  if (req.maxBudget && req.maxBudget > 0) {
    if (product.price <= req.maxBudget) {
      const range = Math.max(req.maxBudget - minPrice, 1);
      const headroom = req.maxBudget - product.price;
      budgetFit = clamp01(0.7 + 0.3 * (1 - headroom / range));
    } else {
      const over = (product.price - req.maxBudget) / req.maxBudget;
      budgetFit = clamp01(0.5 - over * 0.5);
    }
  } else {
    const norm = (maxPrice - product.price) / Math.max(maxPrice - minPrice, 1);
    budgetFit = clamp01(0.4 + 0.6 * norm);
  }

  // Priority match
  let priorityMatch = 0.5;
  if (req.priorities.length > 0) {
    const weights = req.priorities.map((_, i) => 1 - i * 0.15);
    const wSum = weights.reduce((a, b) => a + b, 0);
    priorityMatch =
      req.priorities.reduce(
        (acc, p, i) => acc + specScoreForPriority(product, p) * weights[i],
        0,
      ) / wSum;
  }

  // Use case fit
  let useCaseFit = 0.5;
  if (req.useCases.length > 0) {
    useCaseFit =
      req.useCases.reduce((acc, u) => acc + useCaseScore(product, u), 0) /
      req.useCases.length;
  }

  // Rating normalized
  const ratingNorm = clamp01(product.rating / 5);

  // Spec match
  const specMatch = specMatchScore(product, req.mustHaveSpecs);

  const total =
    WEIGHTS.budgetFit * budgetFit +
    WEIGHTS.priorityMatch * priorityMatch +
    WEIGHTS.useCaseFit * useCaseFit +
    WEIGHTS.ratingNorm * ratingNorm +
    WEIGHTS.specMatch * specMatch;

  const breakdown: ScoreBreakdown = {
    budgetFit,
    priorityMatch,
    useCaseFit,
    ratingNorm,
    specMatch,
    total,
  };

  return {
    ...product,
    score: breakdown,
    matchPercentage: Math.round(total * 100),
    reasons: buildReasons(product, req, breakdown),
  };
}

function buildReasons(
  product: Product,
  req: Requirements,
  score: ScoreBreakdown,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  if (req.maxBudget && product.price <= req.maxBudget) {
    reasons.push({
      label: `Within budget ($${product.price} ≤ $${req.maxBudget})`,
      type: "positive",
    });
  } else if (req.maxBudget) {
    reasons.push({
      label: `Over budget ($${product.price} > $${req.maxBudget})`,
      type: "warning",
    });
  }

  const topPriorities = req.priorities.slice(0, 3);
  for (const p of topPriorities) {
    const s = specScoreForPriority(product, p);
    if (s >= 0.75) {
      const specVal =
        product.specs[p] ||
        product.specs[p.replace(/\s/g, "")] ||
        "";
      const label = specVal
        ? `Strong ${p}: ${specVal}`
        : `Strong ${p} match`;
      reasons.push({ label, type: "positive" });
    } else if (s < 0.5) {
      reasons.push({ label: `Average ${p}`, type: "warning" });
    } else {
      reasons.push({ label: `Decent ${p}`, type: "neutral" });
    }
  }

  for (const uc of req.useCases.slice(0, 2)) {
    const s = useCaseScore(product, uc);
    if (s >= 0.8) {
      reasons.push({ label: `Great for ${uc}`, type: "positive" });
    }
  }

  if (score.ratingNorm >= 0.85) {
    reasons.push({
      label: `Highly rated (${product.rating.toFixed(1)}★)`,
      type: "positive",
    });
  }

  return reasons.slice(0, 5);
}

export function rankProducts(
  products: Product[],
  req: Requirements,
): RankedProduct[] {
  if (products.length === 0) return [];

  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const ranked = products.map((p) => scoreProduct(p, req, minPrice, maxPrice));
  ranked.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return ranked;
}

export function filterProducts(
  products: Product[],
  req: Requirements,
): Product[] {
  let filtered = products;

  if (req.maxBudget && req.maxBudget > 0) {
    // Keep within budget, but if too few, relax to 1.25x budget
    const inBudget = filtered.filter((p) => p.price <= req.maxBudget!);
    if (inBudget.length >= 3) {
      filtered = inBudget;
    } else {
      const relaxed = filtered.filter(
        (p) => p.price <= req.maxBudget! * 1.25,
      );
      if (relaxed.length >= 3) filtered = relaxed;
    }
  }

  // Dedupe by title
  const seen = new Set<string>();
  filtered = filtered.filter((p) => {
    if (seen.has(p.title)) return false;
    seen.add(p.title);
    return true;
  });

  return filtered;
}
