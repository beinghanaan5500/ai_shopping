import { motion, AnimatePresence } from "framer-motion";
import { SearchX, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { formatINR } from "@/lib/currency";

interface NoMatchModalProps {
  isOpen: boolean;
  category: string;
  maxBudget: number | null;
  hasCategoryProducts: boolean;
  onEditRequirements: () => void;
  onNewSearch: () => void;
  onClose: () => void;
}

export function NoMatchModal({
  isOpen,
  category,
  maxBudget,
  hasCategoryProducts,
  onEditRequirements,
  onNewSearch,
  onClose,
}: NoMatchModalProps) {
  if (!isOpen) return null;

  const formattedCat = category.replace(/-/g, " ").trim();
  const formattedBudget = maxBudget ? formatINR(maxBudget) : null;

  const message = hasCategoryProducts && formattedBudget
    ? `We couldn't find any ${formattedCat} within your ${formattedBudget} budget.`
    : `We couldn't find any ${formattedCat} in the available options.`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-paper p-6 sm:p-8 text-center shadow-2xl text-ink"
        >
          {/* Icon Header */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft text-accent shadow-xs">
            <SearchX className="h-7 w-7" />
          </div>

          <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
            No matching products found
          </h3>

          <p className="mt-3 text-sm text-muted leading-relaxed text-pretty">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row-reverse sm:justify-center">
            {/* Primary Action: Edit requirements */}
            <button
              type="button"
              onClick={onEditRequirements}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition-all hover:bg-ink/90 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              Edit requirements
            </button>

            {/* Secondary Action: New search */}
            <button
              type="button"
              onClick={onNewSearch}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-muted transition-all hover:border-ink hover:text-ink hover:bg-paper-2 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              New search
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
