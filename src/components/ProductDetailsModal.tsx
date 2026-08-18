import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Check, AlertTriangle, ExternalLink, ShieldCheck, Scale, Cpu, Search, Sparkles } from "lucide-react";
import type { RankedProduct } from "@/types";
import { formatINR, usdToInr } from "@/lib/currency";

interface ProductDetailsModalProps {
  product: RankedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const inrPrice = usdToInr(product.price);
  const originalUsd = product.discountPercentage > 0
    ? Math.round(product.price / (1 - product.discountPercentage / 100))
    : null;
  const originalInr = originalUsd ? usdToInr(originalUsd) : null;

  // Filter out internal and empty specs
  const displaySpecs = Object.entries(product.specs).filter(
    ([k, v]) => v && k !== "price" && typeof v === "string" && v.trim().length > 0
  );

  // Retailer safe search URLs (searching brand + title safely)
  const searchQuery = encodeURIComponent(`${product.brand} ${product.title}`);
  const amazonUrl = `https://www.amazon.in/s?k=${searchQuery}`;
  const flipkartUrl = `https://www.flipkart.com/search?q=${searchQuery}`;
  const googleUrl = `https://www.google.com/search?q=${searchQuery}+buy+online+india`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-paper p-6 shadow-2xl sm:p-8 hide-scrollbar text-ink"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full p-2 text-muted transition-colors hover:bg-paper-2 hover:text-ink cursor-pointer"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header / Brand info */}
            <div className="pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                  {product.brand}
                </span>
                <span className="text-muted/40">·</span>
                <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                {product.title}
              </h2>
            </div>

            {/* Main Visual & Score Section */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 items-start">
              {/* Product Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line/60 bg-paper-2/60 p-6 flex items-center justify-center shadow-inner">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Price & Match Metric */}
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="rounded-2xl border border-line/80 bg-paper-2/40 p-4 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    Estimated Price (INR)
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2.5">
                    <span className="font-display text-3xl font-bold text-ink">
                      {formatINR(inrPrice)}
                    </span>
                    {originalInr && (
                      <span className="text-sm text-muted line-through">
                        {formatINR(originalInr)}
                      </span>
                    )}
                  </div>
                  {product.discountPercentage > 0 && (
                    <div className="mt-1.5 inline-block rounded bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                      {Math.round(product.discountPercentage)}% estimated retail discount
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-ink/20 bg-paper-2/70 p-4 shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper font-display text-base font-bold shadow-xs">
                    {product.matchPercentage}%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Pickwise Match Score</div>
                    <div className="text-[11px] text-muted">Computed strictly from your stated priorities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Summary Section */}
            <div className="mt-6 rounded-2xl border border-ink/15 bg-paper-2/50 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Decision Summary
              </div>
              <p className="mt-2 text-xs sm:text-sm text-ink/85 leading-relaxed">
                {product.matchPercentage >= 80
                  ? `The ${product.brand} ${product.title} is an exceptional fit (${product.matchPercentage}% match), satisfying your budget constraint while delivering strong capability for your stated priorities.`
                  : product.matchPercentage >= 65
                    ? `The ${product.brand} ${product.title} is a solid contender (${product.matchPercentage}% match), providing a balanced compromise across your requested requirements.`
                    : `The ${product.brand} ${product.title} meets baseline requirements (${product.matchPercentage}% match), though higher-scoring alternatives may offer better alignment with your top priorities.`}
                {product.reasons.length > 0 && ` Noteworthy strength: ${product.reasons[0].label}.`}
              </p>
            </div>

            {/* Why Pickwise Recommends This */}
            <div className="mt-6 rounded-2xl border border-line bg-paper-2/30 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink">
                <ShieldCheck className="h-4 w-4 text-success" />
                Why Pickwise Picked This
              </div>
              <div className="mt-3 space-y-2">
                {product.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    {r.type === "positive" ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
                    ) : r.type === "warning" ? (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                    ) : (
                      <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
                    )}
                    <span className={r.type === "positive" ? "font-medium text-ink" : "text-muted"}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade-offs Section (Only shown when supported by data) */}
            {product.tradeoff && (
              <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/5 p-4.5 text-xs sm:text-sm shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-warning">
                  <Scale className="h-4 w-4 text-warning" />
                  Trade-off to Consider
                </div>
                <p className="mt-2 text-ink/85 leading-relaxed">
                  {product.tradeoff}
                </p>
              </div>
            )}

            {/* Key Specifications (Real specs only) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  <Cpu className="h-3.5 w-3.5" />
                  Key Specifications
                </div>
                <span className="text-[10px] font-medium text-muted/70">
                  {product.dataQuality === "high"
                    ? "Verified catalog data"
                    : "Based on available catalog data"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {displaySpecs.map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-line bg-paper-2/40 p-3 shadow-2xs"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                      {k.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm font-semibold text-ink leading-snug">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Where to Buy / Retailer Discovery Section */}
            <div className="mt-7 border-t border-line/60 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-ink">
                    Where to Buy / Find This Product
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Search major retailers directly for current pricing and availability:
                  </p>
                </div>
              </div>

              <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-xs font-semibold text-ink transition-all hover:border-ink hover:bg-paper-2 hover:scale-[1.01] active:scale-98 shadow-2xs group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
                    Amazon India
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted/70 group-hover:text-ink" />
                </a>

                <a
                  href={flipkartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-xs font-semibold text-ink transition-all hover:border-ink hover:bg-paper-2 hover:scale-[1.01] active:scale-98 shadow-2xs group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
                    Flipkart
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted/70 group-hover:text-ink" />
                </a>

                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-xs font-semibold text-ink transition-all hover:border-ink hover:bg-paper-2 hover:scale-[1.01] active:scale-98 shadow-2xs group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
                    Google Shopping
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted/70 group-hover:text-ink" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
