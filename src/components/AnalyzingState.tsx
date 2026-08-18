import { motion } from "framer-motion";

const STEPS = [
  "Understanding your request",
  "Extracting requirements",
  "Searching product catalog",
  "Scoring against your priorities",
  "Ranking matches",
];

export function AnalyzingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-8 h-20 w-20">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-line"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-semibold text-ink">AI</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35, duration: 0.4 }}
            className="flex items-center gap-3 text-sm"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-accent"
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
