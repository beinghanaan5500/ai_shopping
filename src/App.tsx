import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, RotateCcw, AlertCircle, Sparkles } from "lucide-react";
import type { AppStage, RankedProduct, Requirements } from "@/types";
import { extractRequirements } from "@/lib/requirements";
import { fetchProducts } from "@/lib/products";
import { filterProducts, rankProducts } from "@/lib/scoring";
import { Scroller } from "@/components/Scroller";
import { AnalyzingState } from "@/components/AnalyzingState";
import { RequirementsPanel } from "@/components/RequirementsPanel";
import { MatchCard } from "@/components/MatchCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { saveSession, saveRecommendations } from "@/lib/db";

const EXAMPLES = [
  {
    label: "Phone for gaming, under $500",
    query:
      "I need a smartphone under $500 for gaming and college. Battery life is more important than camera quality.",
  },
  {
    label: "Headphones for the gym, under $200",
    query:
      "Looking for wireless headphones under $200 for commuting and gym. Noise cancellation matters most.",
  },
  {
    label: "Portable laptop, under $800",
    query:
      "I want a laptop under $800 for college work and light gaming. Portability is my top priority.",
  },
  {
    label: "Fitness smartwatch, under $300",
    query:
      "Need a smartwatch under $300 for fitness tracking and sleep monitoring. Battery should last at least 2 days.",
  },
];

export default function App() {
  const [stage, setStage] = useState<AppStage>("landing");
  const [query, setQuery] = useState("");
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [ranked, setRanked] = useState<RankedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const runAnalysis = useCallback(async (q: string) => {
    if (!q.trim()) {
      setError("Please describe what you're shopping for.");
      return;
    }
    setError(null);
    setStage("analyzing");

    try {
      const req = await extractRequirements(q);
      setRequirements(req);

      const products = await fetchProducts(req);
      if (products.length === 0) {
        setError("No products found for that category. Try a different request.");
        setStage("landing");
        return;
      }

      const filtered = filterProducts(products, req);
      if (filtered.length === 0) {
        setError("No products matched your budget. Try increasing it.");
        setStage("landing");
        return;
      }

      const rankedProducts = rankProducts(filtered, req);
      if (rankedProducts.length === 0) {
        setError("Could not rank products for this request.");
        setStage("landing");
        return;
      }

      setRanked(rankedProducts);
      setStage("results");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      // Persist session + top 3 recommendations (non-blocking)
      const sessionId = await saveSession(q, req);
      if (sessionId) {
        await saveRecommendations(sessionId, rankedProducts.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message.includes("AI service not configured")
          ? "The AI service is not configured. Add an OpenRouter API key to use the assistant."
          : "Something went wrong analyzing your request. Please try again.",
      );
      setStage("landing");
    }
  }, []);

  const reset = useCallback(() => {
    setStage("landing");
    setQuery("");
    setRequirements(null);
    setRanked([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const top3 = ranked.slice(0, 3);
  const best = top3[0];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header onReset={reset} showReset={stage !== "landing"} />

      {stage === "landing" && (
        <Landing onSearch={runAnalysis} error={error} />
      )}

      {stage === "analyzing" && <AnalyzingState />}

      {stage === "results" && requirements && best && (
        <div ref={resultsRef} className="mx-auto max-w-7xl px-6 pb-24 pt-8">
          <ResultsHeader query={query} onReset={reset} />

          <div className="mt-6">
            <RequirementsPanel requirements={requirements} query={query} />
          </div>

          {/* Best match — featured, with its explanation right alongside */}
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Top pick
              </span>
              <div className="h-px flex-1 bg-line/60" />
              <span className="text-sm text-muted">
                {ranked.length} products scored
              </span>
            </div>

            <div className="grid items-stretch gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <MatchCard product={best} isBest index={0} />
              </div>
              <div className="lg:col-span-2">
                <BestMatchExplanation best={best} requirements={requirements} />
              </div>
            </div>
          </div>

          {/* Runners-up — visibly secondary */}
          {top3.length > 1 && (
            <div className="mt-12">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-display text-lg font-medium text-ink">
                  Runners-up
                </h2>
                <div className="h-px flex-1 bg-line/60" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {top3.slice(1).map((p, i) => (
                  <MatchCard key={p.id} product={p} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <ComparisonTable products={top3} />
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-paper-2"
            >
              <RotateCcw className="h-4 w-4" />
              Search again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ onReset, showReset }: { onReset: () => void; showReset: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <button onClick={onReset} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
            <Sparkles className="h-4 w-4 text-paper" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Tally
          </span>
          <span className="hidden text-xs text-muted sm:inline">
            — shopping, scored
          </span>
        </button>
        {showReset && (
          <button
            onClick={onReset}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            New search
          </button>
        )}
      </div>
    </header>
  );
}

function Landing({ onSearch, error }: { onSearch: (q: string) => void; error: string | null }) {
  const [input, setInput] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input);
  };

  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-4xl px-6 pb-12 pt-12 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Transparent scoring, not just AI picks
            </div>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
              Describe it. We&apos;ll
              <br />
              <span className="italic text-accent">score the match.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Tell us what you need in plain words. We extract your priorities,
              score real products against them, and show your best match — with
              the math visible.
            </p>
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-7 max-w-2xl"
          >
            <div className="group relative rounded-2xl border border-line bg-paper p-2 shadow-[0_2px_20px_-8px_rgba(26,26,26,0.12)] transition-all focus-within:border-ink focus-within:shadow-[0_4px_30px_-8px_rgba(26,26,26,0.2)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I need a phone under $500 for gaming and college. Battery matters more than camera."
                rows={3}
                className="w-full resize-none bg-transparent px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(e);
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <span className="text-[11px] text-muted/60">
                  Enter to search
                </span>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-[0_4px_16px_-4px_rgba(200,84,26,0.5)] transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <Search className="h-4 w-4" />
                  Find my match
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-6 max-w-2xl"
          >
            <div className="mb-2.5 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted/60">
              Try an example
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(ex.query);
                    onSearch(ex.query);
                  }}
                  className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs text-muted transition-all hover:border-ink hover:text-ink"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Scroller />

      <section className="border-t border-line/60 bg-paper-2/40">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-medium text-ink">
            How the scoring works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted">
            The AI only extracts what you need. Our scoring engine does the
            ranking — so you can see exactly why a product wins.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            {[
              { label: "Budget fit", w: "30%" },
              { label: "Priority match", w: "25%" },
              { label: "Use-case fit", w: "20%" },
              { label: "Rating", w: "15%" },
              { label: "Spec match", w: "10%" },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`rounded-xl border border-line bg-paper p-4 ${
                  i === 4 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <div className="font-display text-2xl font-semibold text-ink">
                  {row.w}
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                  {row.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line/60 py-8 text-center text-xs text-muted/60">
        Tally — a transparent shopping assistant. Product data from DummyJSON.
      </footer>
    </>
  );
}

function ResultsHeader({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 border-b border-line/60 pb-6"
    >
      <div className="flex items-center gap-2 text-xs text-muted">
        <button onClick={onReset} className="hover:text-ink">
          Search
        </button>
        <ArrowRight className="h-3 w-3" />
        <span className="truncate">{query}</span>
      </div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        Your best match
      </h1>
    </motion.div>
  );
}

function BestMatchExplanation({
  best,
  requirements,
}: {
  best: RankedProduct;
  requirements: Requirements;
}) {
  const topPriority = requirements.priorities[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col rounded-2xl border border-ink bg-ink p-7 text-paper sm:p-8"
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-paper/50">
        Why this matches you
      </div>
      <h2 className="mt-2 font-display text-2xl font-medium leading-tight text-paper sm:text-3xl">
        {best.title}
      </h2>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-paper/70">
        {topPriority ? (
          <>
            Because <span className="text-paper">{topPriority}</span> is your top
            priority, this product's{" "}
            <span className="text-paper">
              {best.specs[topPriority] || best.specs[topPriority.replace(/\s/g, "")] || "performance"}
            </span>{" "}
            makes it the strongest fit for your needs.
          </>
        ) : (
          <>This product best balances your stated requirements.</>
        )}{" "}
        It scores{" "}
        <span className="font-semibold text-accent">{best.matchPercentage}%</span>{" "}
        overall — the highest of {requirements.category.replace(/-/g, " ")} we
        evaluated against your priorities.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {best.reasons.map((r, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-lg border border-paper/10 bg-paper/5 px-4 py-3"
          >
            <div
              className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                r.type === "positive"
                  ? "bg-success"
                  : r.type === "warning"
                    ? "bg-warning"
                    : "bg-paper/40"
              }`}
            />
            <span className="text-sm text-paper/80">{r.label}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
