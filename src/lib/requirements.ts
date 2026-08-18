import type { Requirements } from "@/types";
import { extractRequirementsLocal } from "@/lib/localExtract";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function extractRequirements(query: string): Promise<Requirements> {
  // Try the Gemini-backed edge function first
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/extract-requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ query }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        if (data.requirements) return data.requirements as Requirements;
      }
    } catch {
      // fall through to local extraction
    }
  }

  // Fallback: local heuristic extraction (no API key needed)
  return extractRequirementsLocal(query);
}
