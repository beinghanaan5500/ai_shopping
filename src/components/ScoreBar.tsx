import { motion } from "framer-motion";

interface ScoreBarProps {
  label: string;
  value: number;
  weight: number;
  delay?: number;
}

export function ScoreBar({ label, value, weight, delay = 0 }: ScoreBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-ink/85">{label}</span>
        <span className="font-mono text-[11px] text-muted tabular-nums">
          <span className="font-bold text-ink">{pct}%</span>{" "}
          <span className="text-muted/60">({Math.round(weight * 100)}% weight)</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
        <motion.div
          className="h-full rounded-full bg-ink"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
