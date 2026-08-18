import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, RotateCcw, AlertCircle, Sparkles, SlidersHorizontal, Scale, Info } from "lucide-react";
import type { AppStage, RankedProduct, Requirements } from "@/types";
import { extractRequirements } from "@/lib/requirements";
import { fetchProducts } from "@/lib/products";
import { filterProducts, rankProducts } from "@/lib/scoring";
import { CartScrollAnimation } from "@/components/CartScrollAnimation";
import { AnalyzingState } from "@/components/AnalyzingState";
import { RequirementsPanel } from "@/components/RequirementsPanel";
import { MatchCard } from "@/components/MatchCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { EditRequirementsModal } from "@/components/EditRequirementsModal";
import { NoMatchModal } from "@/components/NoMatchModal";
import { saveSession, saveRecommendations } from "@/lib/db";
import { formatINR, usdToInr } from "@/lib/currency";

const EXAMPLES = [
  "I need a smartphone under ₹40,000 for gaming and college. Battery matters more than camera.",
  "Laptop under ₹1,90,000 for coding and college",
  "Headphones under ₹10,000 with strong ANC",
  "Smartwatch under ₹15,000 for fitness tracking",
];

export default function App() {
  const [stage, setStage] = useState<AppStage>("landing");
  const [query, setQuery] = useState("");
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [ranked, setRanked] = useState<RankedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<RankedProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNoMatchOpen, setIsNoMatchOpen] = useState(false);
  const [noMatchInfo, setNoMatchInfo] = useState<{
    category: string;
    maxBudget: number | null;
    hasCategoryProducts: boolean;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const runAnalysis = useCallback(async (q: string) => {
    const rawQuery = q.trim();
    if (!rawQuery) {
      setError("Please describe what you're shopping for.");
      return;
    }
    setQuery(rawQuery);
    setError(null);
    setRanked([]);
    setIsNoMatchOpen(false);
    setStage("analyzing");

    try {
      const req = await extractRequirements(rawQuery);
      setRequirements(req);

      const products = await fetchProducts(req);
      if (products.length === 0) {
        setNoMatchInfo({
          category: req.category,
          maxBudget: req.maxBudget,
          hasCategoryProducts: false,
        });
        setIsNoMatchOpen(true);
        setStage("landing");
        return;
      }

      const filtered = filterProducts(products, req);
      if (filtered.length === 0) {
        setNoMatchInfo({
          category: req.category,
          maxBudget: req.maxBudget,
          hasCategoryProducts: true,
        });
        setIsNoMatchOpen(true);
        setStage("landing");
        return;
      }

      const rankedProducts = rankProducts(filtered, req);
      if (rankedProducts.length === 0) {
        setNoMatchInfo({
          category: req.category,
          maxBudget: req.maxBudget,
          hasCategoryProducts: true,
        });
        setIsNoMatchOpen(true);
        setStage("landing");
        return;
      }

      setRanked(rankedProducts);
      setIsNoMatchOpen(false);
      setNoMatchInfo(null);
      setStage("results");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      // Persist session + top 3 recommendations (non-blocking)
      const sessionId = await saveSession(rawQuery, req);
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

  // Re-run pipeline with edited requirements
  const rerunWithRequirements = useCallback(async (newQuery: string, newReq: Requirements) => {
    const trimmedQuery = newQuery.trim() || query;
    setQuery(trimmedQuery);
    setRequirements(newReq);
    setError(null);
    setRanked([]);
    setIsNoMatchOpen(false);
    setStage("analyzing");

    try {
      const products = await fetchProducts(newReq);
      if (products.length === 0) {
        setNoMatchInfo({
          category: newReq.category,
          maxBudget: newReq.maxBudget,
          hasCategoryProducts: false,
        });
        setIsNoMatchOpen(true);
        setStage("landing");
        return;
      }

      const filtered = filterProducts(products, newReq);
      if (filtered.length === 0) {
        setNoMatchInfo({
          category: newReq.category,
          maxBudget: newReq.maxBudget,
          hasCategoryProducts: true,
        });
        setIsNoMatchOpen(true);
        setStage("landing");
        return;
      }

      const rankedProducts = rankProducts(filtered, newReq);
      if (rankedProducts.length === 0) {
        setNoMatchInfo({
          category: newReq.category,
          maxBudget: newReq.maxBudget,
          hasCategoryProducts: true,
        });
        setIsNoMatchOpen(true);
        setStage("landing");
        return;
      }

      setRanked(rankedProducts);
      setIsNoMatchOpen(false);
      setNoMatchInfo(null);
      setStage("results");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      const sessionId = await saveSession(trimmedQuery, newReq);
      if (sessionId) {
        await saveRecommendations(sessionId, rankedProducts.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong updating requirements. Please try again.");
      setStage("landing");
    }
  }, [query]);

  const reset = useCallback(() => {
    setStage("landing");
    setQuery("");
    setRequirements(null);
    setRanked([]);
    setError(null);
    setSelectedProduct(null);
    setIsEditModalOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const top3 = ranked.slice(0, 3);
  const best = top3[0];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <div>
        {stage !== "landing" && <Header onReset={reset} showReset={true} />}

        {stage === "landing" && (
          <Landing onSearch={runAnalysis} error={error} />
        )}

        {stage === "analyzing" && <AnalyzingState />}

        {stage === "results" && requirements && best && (
          <div ref={resultsRef} className="mx-auto max-w-7xl px-6 pb-24 pt-6 sm:pt-8">
            <ResultsHeader query={query} onReset={reset} />

            <div className="mt-6">
              <RequirementsPanel
                requirements={requirements}
                query={query}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            <div className="mt-10">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink">
                    Top Recommendations
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    Ranked strictly against your priorities and budget
                  </p>
                </div>
                <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-muted">
                  {ranked.length} {ranked.length === 1 ? "product evaluated" : "products evaluated"}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-3 items-start">
                {top3.map((p, i) => (
                  <MatchCard
                    key={p.id}
                    product={p}
                    isBest={i === 0}
                    index={i}
                    onViewDetails={(prod) => setSelectedProduct(prod)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12">
              <ComparisonTable products={top3} />
            </div>

            <BestMatchExplanation
              best={best}
              requirements={requirements}
              onOpenDetails={() => setSelectedProduct(best)}
            />

            <div className="mt-12 flex justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper shadow-sm transition-all hover:bg-ink/90 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Search for another product
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Drawer / Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Edit Requirements Modal */}
      <EditRequirementsModal
        isOpen={isEditModalOpen}
        requirements={requirements}
        query={query}
        onClose={() => setIsEditModalOpen(false)}
        onSaveAndRerun={rerunWithRequirements}
      />

      {/* No Match Modal */}
      {noMatchInfo && (
        <NoMatchModal
          isOpen={isNoMatchOpen}
          category={noMatchInfo.category}
          maxBudget={noMatchInfo.maxBudget}
          hasCategoryProducts={noMatchInfo.hasCategoryProducts}
          onEditRequirements={() => {
            setIsNoMatchOpen(false);
            setIsEditModalOpen(true);
          }}
          onNewSearch={() => {
            setIsNoMatchOpen(false);
            setNoMatchInfo(null);
            const el = document.getElementById("shopping-input");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              const textarea = el.querySelector<HTMLTextAreaElement>("textarea");
              if (textarea) setTimeout(() => textarea.focus(), 450);
            }
          }}
          onClose={() => setIsNoMatchOpen(false)}
        />
      )}

      {stage === "landing" && (
        <footer className="border-t border-line/60 py-6 text-center text-xs text-muted/70">
          Pickwise — AI Personal Shopping Decision Assistant. Shopping, scored.
        </footer>
      )}
    </div>
  );
}

function Header({ onReset, showReset }: { onReset: () => void; showReset: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <button onClick={onReset} className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform active:scale-95">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper transition-transform group-hover:scale-105 shadow-2xs">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Pickwise
            </span>
            <span className="hidden text-xs text-muted/80 sm:inline ml-1.5 font-sans">
              — shopping, scored
            </span>
          </div>
        </button>
        {showReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted transition-all hover:border-ink hover:text-ink hover:bg-paper-2 active:scale-95 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New search
          </button>
        )}
      </div>
    </header>
  );
}

function Landing({ onSearch, error }: { onSearch: (q: string) => void; error: string | null }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToInput = useCallback(() => {
    const el = document.getElementById("shopping-input");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 450);
    } else if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input);
  };

  return (
    <>
      <CartScrollAnimation onScrollToInput={scrollToInput} />

      <section id="shopping-input" className="relative border-t border-line/60 bg-paper">
        <div className="mx-auto max-w-4xl px-6 pb-12 pt-10 sm:pt-16 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft/60 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              SHOPPING, SCORED.
            </div>
            <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
              Not more choices.
              <br />
              <span className="italic text-accent">The right one.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Tell Pickwise what you need. We score the options against what matters to you and explain why the winner wins.
            </p>
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-9 max-w-2xl"
          >
            <div className="group relative rounded-2xl border-2 border-line bg-paper p-3 shadow-[0_4px_24px_-8px_rgba(26,26,26,0.08)] transition-all focus-within:border-ink focus-within:shadow-[0_8px_32px_-8px_rgba(26,26,26,0.16)]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. I need a smartphone under ₹40,000 for gaming and college. Battery matters more than camera."
                rows={3}
                className="w-full resize-none bg-transparent px-3 py-2 text-base text-ink placeholder:text-muted/60 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(e);
                  }
                }}
              />
              <div className="flex items-center justify-between px-2 pt-1.5">
                <span className="text-[11px] font-medium text-muted/70 flex items-center gap-1">
                  Press <kbd className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line/60">Enter ↵</kbd> to search
                </span>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-all hover:bg-ink/90 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm cursor-pointer"
                >
                  <Search className="h-4 w-4 text-accent" />
                  Find my match
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning shadow-2xs"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mx-auto mt-7 max-w-2xl"
          >
            <div className="mb-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Try an example search
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(ex);
                    onSearch(ex);
                  }}
                  className="rounded-full border border-line bg-paper px-4 py-1.5 text-xs text-muted/90 font-medium transition-all hover:border-ink hover:text-ink hover:bg-paper-2 hover:scale-[1.01] active:scale-95 shadow-2xs cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compact "How Pickwise Works" 3-Step Visual Section */}
      <section className="border-t border-line/60 bg-paper py-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            How Pickwise Works
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink">
            From search prompt to verified decision
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted">
            A transparent, three-step engine designed to eliminate choice overload and cut through marketing fluff.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-line bg-paper-2/40 p-5 shadow-2xs transition-all hover:border-line-dark hover:-translate-y-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper font-mono text-xs font-bold mb-3 shadow-2xs">
                01
              </div>
              <div className="text-sm font-bold text-ink mb-1">1. Understand</div>
              <p className="text-xs leading-relaxed text-muted">
                Extracts your requested category, hard budget, use cases, and ranked priorities in plain words.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper-2/40 p-5 shadow-2xs transition-all hover:border-line-dark hover:-translate-y-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper font-mono text-xs font-bold mb-3 shadow-2xs">
                02
              </div>
              <div className="text-sm font-bold text-ink mb-1">2. Score</div>
              <p className="text-xs leading-relaxed text-muted">
                Filters candidate pool and computes weighted match scores against budget, specs, and priorities.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper-2/40 p-5 shadow-2xs transition-all hover:border-line-dark hover:-translate-y-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper font-mono text-xs font-bold mb-3 shadow-2xs">
                03
              </div>
              <div className="text-sm font-bold text-ink mb-1">3. Explain</div>
              <p className="text-xs leading-relaxed text-muted">
                Explains why the winner wins, details side-by-side trade-offs, and provides neutral purchase search links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Weight Scoring Formula Section */}
      <section className="border-t border-line/60 bg-paper-2/30">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent mb-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Transparent Algorithm
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink">
            How the scoring works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted">
            The AI extracts what matters to you. Our mathematical scoring engine computes the fit — so you can see why each product placed where it did.
          </p>
          <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3.5 sm:grid-cols-5">
            {[
              { label: "Budget fit", w: "30%" },
              { label: "Priority match", w: "25%" },
              { label: "Use-case fit", w: "20%" },
              { label: "Rating", w: "15%" },
              { label: "Spec match", w: "10%" },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-line bg-paper p-3.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-xs"
              >
                <div className="font-display text-2xl font-bold text-ink">
                  {row.w}
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  {row.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ResultsHeader({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2.5 border-b border-line/60 pb-5"
    >
      <div className="flex items-center gap-2 text-xs text-muted">
        <button onClick={onReset} className="hover:text-ink font-semibold underline underline-offset-2 cursor-pointer">
          New search
        </button>
        <ArrowRight className="h-3 w-3 text-muted/60" />
        <span className="truncate text-ink font-medium">"{query}"</span>
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Pickwise Recommendation
      </h1>
    </motion.div>
  );
}

function BestMatchExplanation({
  best,
  requirements,
  onOpenDetails,
}: {
  best: RankedProduct;
  requirements: Requirements;
  onOpenDetails: () => void;
}) {
  const p1 = requirements.priorities[0];
  const p2 = requirements.priorities[1];

  const p1Spec = p1 ? (best.specs[p1] || best.specs[p1.replace(/\s/g, "")] || "") : "";
  const p2Spec = p2 ? (best.specs[p2] || best.specs[p2.replace(/\s/g, "")] || "") : "";

  let narrativeText = "";
  if (p1 && p2 && (p1Spec || p2Spec)) {
    narrativeText = `Because ${p1} was your #1 priority, this product's ${p1Spec || "strong configuration"} makes it the strongest fit in that category. It also satisfies your secondary priority of ${p2}${p2Spec ? ` with ${p2Spec}` : ""}, making it the most balanced winner overall.`;
  } else if (p1 && p1Spec) {
    narrativeText = `Because ${p1} is your top priority, this product's ${p1Spec} gives it the highest score across all evaluated options in this category.`;
  } else {
    narrativeText = `This product achieved the highest weighted balance across your stated budget, use cases, and technical requirements.`;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12 rounded-2xl border border-ink bg-ink p-7 text-paper sm:p-9 shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-paper/15 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          Why Pickwise Picked This
        </div>
        <span className="rounded-full bg-paper/10 px-3 py-0.5 font-mono text-xs font-semibold text-paper/80">
          Rank #1 Match
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <div className="text-xs font-semibold text-paper/60 uppercase tracking-wider">
            {best.brand}
          </div>
          <h2 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
            {best.title}
          </h2>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-accent">
            {best.matchPercentage}%
          </span>
          <span className="text-xs text-paper/70 font-medium">match</span>
        </div>
      </div>

      <p className="mt-4 text-pretty text-sm leading-relaxed text-paper/80 sm:text-base">
        {narrativeText}{" "}
        It scored an overall{" "}
        <span className="font-bold text-accent">{best.matchPercentage}%</span>{" "}
        match — outperforming other {requirements.category.replace(/-/g, " ")} against your exact priorities.
      </p>

      {/* Trade-off Highlight (if present) */}
      {best.tradeoff && (
        <div className="mt-5 rounded-xl border border-accent/30 bg-paper/5 p-4 text-xs sm:text-sm shadow-inner">
          <div className="flex items-center gap-2 font-semibold text-accent uppercase tracking-wider text-[11px]">
            <Scale className="h-3.5 w-3.5" />
            Trade-off to Keep in Mind
          </div>
          <p className="mt-1.5 text-paper/85 leading-relaxed">
            {best.tradeoff}
          </p>
        </div>
      )}

      {/* Match Reasons */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {best.reasons.map((r, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl border border-paper/10 bg-paper/5 px-4 py-3 shadow-2xs"
          >
            <div
              className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                r.type === "positive"
                  ? "bg-success"
                  : r.type === "warning"
                    ? "bg-warning"
                    : "bg-paper/40"
              }`}
            />
            <span className="text-xs sm:text-sm text-paper/90 font-medium">{r.label}</span>
          </div>
        ))}
      </div>

      {/* Action to open full details */}
      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={onOpenDetails}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs sm:text-sm font-semibold text-paper shadow-sm transition-all hover:bg-accent/90 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Info className="h-4 w-4" />
          View full details & where to buy →
        </button>
      </div>
    </motion.section>
  );
}
