import { motion } from "framer-motion";
import { Wallet, Target, Sparkles, ListChecks } from "lucide-react";
import type { Requirements } from "@/types";

interface RequirementsPanelProps {
  requirements: Requirements;
  query: string;
}

export function RequirementsPanel({ requirements, query }: RequirementsPanelProps) {
  const r = requirements;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-line bg-paper p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          AI extracted requirements
        </span>
      </div>

      <blockquote className="mb-5 border-l-2 border-accent/40 pl-4 font-display text-base italic leading-relaxed text-ink/70">
        "{query}"
      </blockquote>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            Category
          </div>
          <div className="text-sm font-medium capitalize text-ink">
            {r.category.replace(/-/g, " ").replace(/s$/, "")}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            <Wallet className="h-3 w-3" />
            Max Budget
          </div>
          <div className="text-sm font-medium text-ink">
            {r.maxBudget ? `$${r.maxBudget.toLocaleString()}` : "Not specified"}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
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
                  className="rounded-md bg-paper-2 px-2 py-0.5 text-xs capitalize text-ink/80"
                >
                  {u}
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
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
                  className={`rounded-md px-2 py-0.5 text-xs capitalize ${
                    i === 0
                      ? "bg-accent-soft text-accent font-medium"
                      : "bg-paper-2 text-ink/80"
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
        <div className="mt-4 border-t border-line/60 pt-4">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            Must-have specs
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(r.mustHaveSpecs).map(([k, v]) => (
              <span
                key={k}
                className="rounded-md border border-line bg-paper-2/50 px-2 py-1 text-xs text-ink/80"
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
