import { createClient } from "@supabase/supabase-js";
import type { RankedProduct, Requirements } from "@/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveSession(
  query: string,
  req: Requirements,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("shopping_sessions")
    .insert({
      query,
      category: req.category,
      max_budget: req.maxBudget,
      use_cases: req.useCases,
      priorities: req.priorities,
      must_have_specs: req.mustHaveSpecs,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to save session:", error.message);
    return null;
  }

  return data?.id ?? null;
}

export async function saveRecommendations(
  sessionId: string,
  products: RankedProduct[],
): Promise<boolean> {
  const rows = products.map((p) => ({
    session_id: sessionId,
    product_id: p.id,
    product_title: p.title,
    product_price: p.price,
    product_rating: p.rating,
    match_score: p.matchPercentage,
    score_breakdown: p.score,
    reasons: p.reasons,
  }));

  const { error } = await supabase
    .from("recommendations")
    .insert(rows);

  if (error) {
    console.error("Failed to save recommendations:", error.message);
    return false;
  }

  return true;
}
