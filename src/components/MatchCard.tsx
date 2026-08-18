import { motion } from "framer-motion";
import { Check, AlertTriangle, Minus, Star } from "lucide-react";
import type { RankedProduct } from "@/types";
import { ScoreBar } from "./ScoreBar";

interface MatchCardProps {
  product: RankedProduct;
  isBest?: boolean;
  index?: number;
}

export function MatchCard({ product, isBest = false, index = 0 }: MatchCardProps) {
  const reasons = product.reasons;
  const positiveCount = reasons.filter((r) => r.type === "positive").length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-paper ${
        isBest
          ? "border-ink shadow-[0_8px_40px_-12px_rgba(26,26,26,0.25)]"
          : "border-line"
      }`}
    >
      {isBest && (
        <div className="absolute right-0 top-0 z-10">
          <div className="rounded-bl-xl bg-ink px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper">
            Best Match
          </div>
        </div>
      )}

      <div className="relative aspect-[5/4] w-full overflow-hidden bg-paper-2">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-contain p-6"
        />
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="tabular-nums">{product.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {product.brand}
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-ink">
          {product.title}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold text-ink">
            ${product.price}
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-xs text-muted line-through">
              ${Math.round(product.price / (1 - product.discountPercentage / 100))}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-line/60" />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className={isBest ? "text-accent" : "text-ink"}
                initial={{ strokeDasharray: "0 151" }}
                animate={{ strokeDasharray: `${(product.matchPercentage / 100) * 151} 151` }}
                transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <span className="absolute font-display text-sm font-semibold tabular-nums text-ink">
              {product.matchPercentage}%
            </span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-ink">Match score</div>
            <div className="text-[11px] text-muted">
              {positiveCount} strong {positiveCount === 1 ? "point" : "points"}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-line/60 pt-4">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {r.type === "positive" && (
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
              )}
              {r.type === "warning" && (
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              )}
              {r.type === "neutral" && (
                <Minus className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
              )}
              <span className={r.type === "positive" ? "text-ink" : "text-muted"}>
                {r.label}
              </span>
            </div>
          ))}
        </div>

        {isBest && (
          <div className="mt-5 space-y-2.5 border-t border-line/60 pt-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Score breakdown
            </div>
            <ScoreBar label="Budget fit" value={product.score.budgetFit} weight={0.3} delay={0.4} />
            <ScoreBar label="Priority match" value={product.score.priorityMatch} weight={0.25} delay={0.5} />
            <ScoreBar label="Use-case fit" value={product.score.useCaseFit} weight={0.2} delay={0.6} />
            <ScoreBar label="Rating" value={product.score.ratingNorm} weight={0.15} delay={0.7} />
            <ScoreBar label="Spec match" value={product.score.specMatch} weight={0.1} delay={0.8} />
          </div>
        )}
      </div>
    </motion.article>
  );
}
