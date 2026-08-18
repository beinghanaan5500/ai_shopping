import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RankedProduct, Requirements } from "@/types";

// Credentials may be provided under either the Vite (VITE_) or Next (NEXT_PUBLIC_)
// public prefix depending on how the project is provisioned.
const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Persistence is a non-blocking nice-to-have. If credentials are missing or the
// client can't be created, degrade gracefully instead of crashing the whole app
// at module load (which blanks the UI).
export const supabase: SupabaseClient | null = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase credentials not set — session persistence disabled.");
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("[v0] Failed to create Supabase client:", err);
    return null;
  }
})();

export async function saveSession(
  query: string,
  req: Requirements,
): Promise<string | null> {
  if (!supabase) return null;
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
  if (!supabase) return false;
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
