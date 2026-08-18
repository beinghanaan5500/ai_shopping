import { motion } from "framer-motion";
import { Check, AlertTriangle, Minus, Star, Award, Info, ArrowUpRight, Sparkles, Scale } from "lucide-react";
import type { RankedProduct } from "@/types";
import { usdToInr, formatINR } from "@/lib/currency";
import { ScoreBar } from "./ScoreBar";

interface MatchCardProps {
  product: RankedProduct;
  isBest?: boolean;
  index?: number;
  onViewDetails?: (product: RankedProduct) => void;
}

export function MatchCard({ product, isBest = false, index = 0, onViewDetails }: MatchCardProps) {
  const reasons = product.reasons;
  const positiveCount = reasons.filter((r) => r.type === "positive").length;

  const inrPrice = usdToInr(product.price);
  const originalUsd = product.discountPercentage > 0
    ? Math.round(product.price / (1 - product.discountPercentage / 100))
    : null;
  const originalInr = originalUsd ? usdToInr(originalUsd) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        isBest
          ? "border-ink bg-paper shadow-[0_12px_40px_-10px_rgba(26,26,26,0.18)] ring-1 ring-ink/10 hover:-translate-y-1 hover:shadow-[0_16px_48px_-10px_rgba(26,26,26,0.22)]"
          : "border-line bg-paper shadow-2xs hover:border-line-dark hover:-translate-y-0.5 hover:shadow-sm"
      }`}
    >
      {/* Best Match Ribbon or Runner-up badge */}
      {isBest ? (
        <div className="absolute right-0 top-0 z-10">
          <div className="flex items-center gap-1.5 rounded-bl-xl bg-ink px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper shadow-sm">
            <Award className="h-3.5 w-3.5 text-accent" />
            Pickwise Best Match
          </div>
        </div>
      ) : (
        <div className="absolute right-3.5 top-3.5 z-10">
          <span className="rounded-full border border-line bg-paper/90 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted shadow-2xs backdrop-blur-xs">
            Rank #{index + 1}
          </span>
        </div>
      )}

      {/* Product Image & Floating Rating */}
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-paper-2/50 border-b border-line/40">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-500 ease-out hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur-md border border-line/60 shadow-2xs">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="tabular-nums font-semibold">{product.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {product.brand}
        </div>
        <h3 className={`font-display font-medium leading-snug text-ink ${isBest ? "text-xl sm:text-2xl" : "text-lg"}`}>
          {product.title}
        </h3>

        {/* INR Pricing */}
        <div className="mt-3 flex items-baseline gap-2.5">
          <span className={`font-display font-bold text-ink ${isBest ? "text-2xl sm:text-3xl text-ink" : "text-2xl"}`}>
            {formatINR(inrPrice)}
          </span>
          {originalInr && (
            <span className="text-xs text-muted line-through">
              {formatINR(originalInr)}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              {Math.round(product.discountPercentage)}% off
            </span>
          )}
        </div>

        {/* Match Score Circular Gauge */}
        <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-line/60 bg-paper-2/40 p-3">
          <div className="relative flex h-14 w-14 items-center justify-center flex-shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-line/70" />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                className={isBest ? "text-accent" : "text-ink"}
                initial={{ strokeDasharray: "0 151" }}
                animate={{ strokeDasharray: `${(product.matchPercentage / 100) * 151} 151` }}
                transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <span className="absolute font-display text-sm font-bold tabular-nums text-ink">
              {product.matchPercentage}%
            </span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-ink">
              {isBest ? "Winning Match Score" : "Match Score"}
            </div>
            <div className="text-[11px] text-muted">
              {positiveCount} priority {positiveCount === 1 ? "match" : "matches"}
            </div>
          </div>
        </div>

        {/* Explainable Reasons List */}
        <div className="mt-5 space-y-2 border-t border-line/60 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {isBest ? "Evaluation highlights" : "Key match signals"}
          </div>
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
              {r.type === "positive" && (
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
              )}
              {r.type === "warning" && (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
              )}
              {r.type === "neutral" && (
                <Minus className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted" />
              )}
              <span className={r.type === "positive" ? "text-ink font-medium" : "text-muted"}>
                {r.label}
              </span>
            </div>
          ))}
        </div>

        {/* Compact "Why we'd pick this" Insight Block for Best Match */}
        {isBest && (
          <div className="mt-4 rounded-xl border border-accent/25 bg-accent-soft/40 p-3.5 text-xs text-ink shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-[0.14em] text-accent text-[10px] mb-2">
              <Sparkles className="h-3 w-3" />
              Why we'd pick this
            </div>
            <ul className="space-y-1.5">
              {reasons.filter((r) => r.type === "positive").slice(0, 3).map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-ink/90 font-medium text-xs leading-snug">
                  <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-success" />
                  <span>{r.label}</span>
                </li>
              ))}
              {product.tradeoff && (
                <li className="flex items-start gap-1.5 text-ink/80 pt-1.5 border-t border-accent/20 text-xs leading-snug">
                  <Scale className="mt-0.5 h-3 w-3 flex-shrink-0 text-warning" />
                  <span><strong className="text-accent font-semibold">Trade-off:</strong> {product.tradeoff}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Winner Score Breakdown */}
        {isBest && (
          <div className="mt-5 space-y-2.5 border-t border-line/60 pt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <span>Score Breakdown</span>
              <span className="text-[10px] font-normal text-muted/80">Normalized</span>
            </div>
            <ScoreBar label="Budget Fit" value={product.score.budgetFit} weight={0.3} delay={0.3} />
            <ScoreBar label="Priority Match" value={product.score.priorityMatch} weight={0.25} delay={0.4} />
            <ScoreBar label="Use-case Fit" value={product.score.useCaseFit} weight={0.2} delay={0.5} />
            <ScoreBar label="Rating Score" value={product.score.ratingNorm} weight={0.15} delay={0.6} />
            <ScoreBar label="Specification Fit" value={product.score.specMatch} weight={0.1} delay={0.7} />
          </div>
        )}

        {/* Primary Action: View Details */}
        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={() => onViewDetails?.(product)}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.01] active:scale-98 cursor-pointer ${
              isBest
                ? "bg-ink text-paper hover:bg-ink/90 shadow-sm"
                : "border border-line bg-paper text-ink hover:border-ink hover:bg-paper-2 shadow-2xs"
            }`}
          >
            <Info className="h-4 w-4" />
            View details
          </button>
        </div>
      </div>
    </motion.article>
  );
}
