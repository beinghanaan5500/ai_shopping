import { motion } from "framer-motion";
import { Wallet, Target, Sparkles, ListChecks, SlidersHorizontal } from "lucide-react";
import type { Requirements } from "@/types";
import { formatINR } from "@/lib/currency";

interface RequirementsPanelProps {
  requirements: Requirements;
  query: string;
  onEdit?: () => void;
}

export function RequirementsPanel({ requirements, query, onEdit }: RequirementsPanelProps) {
  const r = requirements;
  const cleanQuery = query?.trim().replace(/^["']+|["']+$/g, "").trim() || "Your shopping request";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-line bg-paper p-6 sm:p-7 shadow-xs"
    >
      {/* Header with Title and Edit Action */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Requirements Understood by Pickwise
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted/75 hidden sm:inline font-sans">
            Priorities ranked by importance
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1 text-xs font-semibold text-ink shadow-2xs transition-all hover:border-ink hover:bg-paper-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3 text-accent" />
              Edit
            </button>
          )}
        </div>
      </div>

      <blockquote className="mb-5 rounded-xl border-l-2 border-accent bg-paper-2/50 px-4 py-3 font-display text-sm sm:text-base italic leading-relaxed text-ink/85 shadow-2xs">
        "{cleanQuery}"
      </blockquote>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Category
          </div>
          <div className="text-sm font-semibold capitalize text-ink">
            {r.category.replace(/-/g, " ").replace(/s$/, "")}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            <Wallet className="h-3 w-3" />
            Max Budget
          </div>
          <div className="text-sm font-semibold text-ink">
            {formatINR(r.maxBudget)}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            <Target className="h-3 w-3" />
            Use Cases
          </div>
          <div className="flex flex-wrap gap-1">
            {r.useCases.length === 0 ? (
              <span className="text-sm text-muted">—</span>
            ) : (
              r.useCases.map((u) => (
                <span
                  key={u}
                  className="rounded-md bg-paper-2 px-2 py-0.5 text-xs font-medium capitalize text-ink/85 border border-line/40 shadow-2xs"
                >
                  {u}
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            <ListChecks className="h-3 w-3" />
            Priorities
          </div>
          <div className="flex flex-wrap gap-1">
            {r.priorities.length === 0 ? (
              <span className="text-sm text-muted">—</span>
            ) : (
              r.priorities.map((p, i) => (
                <span
                  key={p}
                  className={`rounded-md px-2 py-0.5 text-xs capitalize transition-all ${
                    i === 0
                      ? "bg-accent-soft text-accent font-semibold border border-accent/30 shadow-2xs"
                      : i === 1
                        ? "bg-paper-2 text-ink font-medium border border-line/60"
                        : "bg-paper-2/80 text-ink/75"
                  }`}
                >
                  {i === 0 ? "① " : i === 1 ? "② " : i === 2 ? "③ " : ""}
                  {p}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {Object.keys(r.mustHaveSpecs).length > 0 && (
        <div className="mt-5 border-t border-line/60 pt-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Must-have specs
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(r.mustHaveSpecs).map(([k, v]) => (
              <span
                key={k}
                className="rounded-md border border-line bg-paper-2/60 px-2.5 py-1 text-xs text-ink/85 font-medium shadow-2xs"
              >
                <span className="text-muted">{k}:</span> {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
