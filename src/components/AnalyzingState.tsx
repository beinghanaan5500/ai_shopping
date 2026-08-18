import { motion } from "framer-motion";

const STEPS = [
  "Understanding what matters to you",
  "Extracting priorities and budget in ₹",
  "Searching product catalog",
  "Mathematically scoring against your priorities",
  "Finding your best match",
];

export function AnalyzingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-7 h-20 w-20">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-sm font-bold tracking-tight text-ink">
            PW
          </span>
        </div>
      </div>

      <h3 className="font-display text-xl font-medium text-ink mb-4">
        Pickwise is evaluating options
      </h3>

      <div className="space-y-2.5 text-left max-w-xs mx-auto">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35, duration: 0.4 }}
            className="flex items-center gap-3 text-xs sm:text-sm"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
            <span className="text-muted">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
