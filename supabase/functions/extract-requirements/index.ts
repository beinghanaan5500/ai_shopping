import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExtractedRequirements {
  category: string;
  maxBudget: number | null;
  useCases: string[];
  priorities: string[];
  mustHaveSpecs: Record<string, string>;
  searchKeywords: string[];
}

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
  monitor: "laptops",
  keyboard: "laptops",
  mouse: "laptops",
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
  grocery: "groceries",
};

function mapCategory(cat: string): string {
  const lower = cat.toLowerCase().trim();
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  const sortedKeys = Object.keys(CATEGORY_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) return CATEGORY_MAP[key];
  }
  return lower;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const systemPrompt = `You are a shopping assistant that extracts structured shopping requirements from a user's natural-language request. Return ONLY a valid JSON object with this exact structure:
{
  "category": "the product category in singular form (e.g. smartphone, laptop, headphones, smartwatch, camera, television, tablet, shoes, jacket, bag, sunglasses, perfume, skincare)",
  "maxBudget": <number or null>,
  "useCases": ["array of use cases mentioned or implied"],
  "priorities": ["array ordered by importance, most important first. Use simple terms like: battery, camera, performance, display, storage, price, portability, durability, sound, comfort, weight, design, gaming, productivity, budget"],
  "mustHaveSpecs": {"specName": "required value or condition"},
  "searchKeywords": ["2-4 keywords to search a product catalog"]
}
Rules:
- maxBudget is an integer number in standard currency units (e.g. 40000 for ₹40,000, 40k, or Rs 40,000; 500 for $500). If '40k' or '40 thousand' is written, output 40000. Output null if not specified.
- priorities must be ordered from most to least important.
- If currency symbols like ₹, Rs, INR, or $ are present, extract the numeric value only.
- Keep values simple and lowercase.
- Respond with valid JSON only, no backticks, no code fences, no explanation.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    let parsed: ExtractedRequirements;
    try {
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse AI response" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    parsed.category = mapCategory(parsed.category || "");
    parsed.useCases = parsed.useCases || [];
    parsed.priorities = parsed.priorities || [];
    parsed.mustHaveSpecs = parsed.mustHaveSpecs || {};
    parsed.searchKeywords = parsed.searchKeywords || [];

    return new Response(JSON.stringify({ requirements: parsed }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
