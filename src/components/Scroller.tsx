import { useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
import { useRef } from "react";
import { Layers, MessageSquareText, Gauge, Trophy, ArrowRight } from "lucide-react";

interface ScrollerProps {
  onScrollToInput?: () => void;
}

export function Scroller({ onScrollToInput }: ScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const handleCtaClick = () => {
    if (onScrollToInput) {
      onScrollToInput();
    } else {
      const inputSection = document.getElementById("shopping-input");
      if (inputSection) {
        inputSection.scrollIntoView({ behavior: "smooth", block: "start" });
        const textarea = inputSection.querySelector<HTMLTextAreaElement>("textarea");
        if (textarea) {
          setTimeout(() => textarea.focus(), 450);
        }
      } else {
        const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
        if (textarea) {
          textarea.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => textarea.focus(), 400);
        }
      }
    }
  };

  return (
    <section ref={containerRef} className="relative h-[340vh] bg-ink text-paper">
      {/* Sticky Viewport Stage: Exactly 100vh pinned */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
        {/* Subtle background ambient light */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[450px] w-[450px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        {/* Scene Navigation Counter (01 / 04) */}
        <div className="absolute top-8 z-30">
          <ActiveCounter progress={scrollYProgress} />
        </div>

        {/* Cinematic Scene Stage (Fixed footprint with strictly isolated scenes) */}
        <div className="relative z-10 mx-auto flex h-[500px] w-full max-w-2xl items-center justify-center">
          <Scene01 progress={scrollYProgress} />
          <Scene02 progress={scrollYProgress} />
          <Scene03 progress={scrollYProgress} />
          <Scene04 progress={scrollYProgress} onCta={handleCtaClick} />
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-6 z-20 text-[11px] font-medium uppercase tracking-[0.2em] text-paper/40">
          Scroll to explore
        </div>
      </div>
    </section>
  );
}

function ActiveCounter({ progress }: { progress: MotionValue<number> }) {
  const [activeStep, setActiveStep] = useState("01");

  useMotionValueEvent(progress, "change", (latest) => {
    if (latest < 0.25) {
      setActiveStep("01");
    } else if (latest < 0.50) {
      setActiveStep("02");
    } else if (latest < 0.75) {
      setActiveStep("03");
    } else {
      setActiveStep("04");
    }
  });

  return (
    <div className="flex items-center gap-3 rounded-full border border-paper/20 bg-ink/90 px-4 py-1.5 shadow-lg backdrop-blur-md">
      <span className="font-mono text-xs font-bold tracking-wider text-paper">
        {activeStep} <span className="text-paper/40">/ 04</span>
      </span>
      <div className="flex items-center gap-1.5 border-l border-paper/20 pl-3">
        {["01", "02", "03", "04"].map((num) => (
          <div
            key={num}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeStep === num ? "w-5 bg-accent" : "w-1.5 bg-paper/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SCENE 01: Too many choices (0.00 → 0.25)
// ==========================================
function Scene01({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.00, 0.17, 0.24], [1, 1, 0]);
  const y = useTransform(progress, [0.00, 0.17, 0.24], [0, 0, -25]);
  const scale = useTransform(progress, [0.00, 0.17, 0.24], [1, 1, 0.96]);
  const display = useTransform(progress, (v) => (v < 0.25 ? "flex" : "none"));

  return (
    <motion.div
      style={{ opacity, y, scale, display }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-paper/20 bg-paper/5 shadow-inner">
        <Layers className="h-6 w-6 text-paper/80" />
      </div>
      <div className="mb-2 font-mono text-xs font-semibold tracking-[0.25em] text-paper/50 uppercase">
        01 / Too Many Choices
      </div>
      <h2 className="mb-3.5 font-display text-3xl font-medium leading-tight text-paper sm:text-4xl md:text-5xl">
        Too many choices
      </h2>
      <p className="mx-auto max-w-lg text-pretty text-sm leading-relaxed text-paper/70 sm:text-base">
        Endless product lists, conflicting specs, and review fatigue. Finding the right tech takes more guesswork and time than it should.
      </p>

      {/* Visual Demo */}
      <div className="mt-7 flex flex-wrap justify-center gap-2 max-w-md opacity-75">
        {["6.7\" AMOLED", "5000mAh", "120Hz", "Snapdragon 8", "₹39,999", "108MP", "5ATM"].map((spec, i) => (
          <div
            key={i}
            className="rounded-lg border border-paper/15 bg-paper/5 px-3 py-1.5 font-mono text-xs text-paper/80 shadow-2xs"
          >
            {spec}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 02: Tell Pickwise what matters (0.25 → 0.50)
// ==========================================
function Scene02({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.26, 0.32, 0.43, 0.49], [0, 1, 1, 0]);
  const y = useTransform(progress, [0.26, 0.32, 0.43, 0.49], [25, 0, 0, -25]);
  const scale = useTransform(progress, [0.26, 0.32, 0.43, 0.49], [0.96, 1, 1, 0.96]);
  const display = useTransform(progress, (v) => (v >= 0.25 && v < 0.50 ? "flex" : "none"));

  return (
    <motion.div
      style={{ opacity, y, scale, display }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10 shadow-inner">
        <MessageSquareText className="h-6 w-6 text-accent" />
      </div>
      <div className="mb-2 font-mono text-xs font-semibold tracking-[0.25em] text-accent uppercase">
        02 / Tell Pickwise What Matters
      </div>
      <h2 className="mb-3.5 font-display text-3xl font-medium leading-tight text-paper sm:text-4xl md:text-5xl">
        Tell Pickwise what matters
      </h2>
      <p className="mx-auto max-w-lg text-pretty text-sm leading-relaxed text-paper/70 sm:text-base">
        Describe what you need in plain words — your budget in ₹, your use cases, and what matters most to you.
      </p>

      {/* Visual Demo */}
      <div className="mt-7 w-full max-w-md rounded-2xl border border-paper/20 bg-paper/5 p-4 text-left backdrop-blur-sm shadow-md">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
          Your Natural Language Request
        </div>
        <p className="mt-1.5 font-display text-sm italic text-paper/90 leading-relaxed">
          "I need a smartphone under ₹40,000 for gaming and college. Battery matters more than camera."
        </p>
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 03: We score every option (0.50 → 0.75)
// ==========================================
function Scene03({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.51, 0.57, 0.68, 0.74], [0, 1, 1, 0]);
  const y = useTransform(progress, [0.51, 0.57, 0.68, 0.74], [25, 0, 0, -25]);
  const scale = useTransform(progress, [0.51, 0.57, 0.68, 0.74], [0.96, 1, 1, 0.96]);
  const display = useTransform(progress, (v) => (v >= 0.50 && v < 0.75 ? "flex" : "none"));

  return (
    <motion.div
      style={{ opacity, y, scale, display }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10 shadow-inner">
        <Gauge className="h-6 w-6 text-accent" />
      </div>
      <div className="mb-2 font-mono text-xs font-semibold tracking-[0.25em] text-accent uppercase">
        03 / We Score Every Option
      </div>
      <h2 className="mb-3.5 font-display text-3xl font-medium leading-tight text-paper sm:text-4xl md:text-5xl">
        We score every option
      </h2>
      <p className="mx-auto max-w-lg text-pretty text-sm leading-relaxed text-paper/70 sm:text-base">
        Pickwise extracts your priorities. Our transparent scoring engine mathematically ranks every option against your exact requirements.
      </p>

      {/* Visual Demo */}
      <div className="mx-auto mt-7 w-full max-w-xs space-y-2.5 rounded-2xl border border-paper/15 bg-paper/5 p-4 text-left shadow-md">
        {[
          { label: "Budget fit (≤ ₹40k)", v: 92 },
          { label: "Priority match (Battery)", v: 88 },
          { label: "Use-case fit (Gaming)", v: 85 },
          { label: "Rating & Specs", v: 90 },
        ].map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-xs text-paper/75">
              <span className="font-medium">{row.label}</span>
              <span className="font-mono text-accent font-semibold">{row.v}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper/10">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${row.v}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 04: Your best match (0.75 → 1.00)
// ==========================================
function Scene04({ progress, onCta }: { progress: MotionValue<number>; onCta: () => void }) {
  const opacity = useTransform(progress, [0.76, 0.82, 1.00], [0, 1, 1]);
  const y = useTransform(progress, [0.76, 0.82, 1.00], [25, 0, 0]);
  const scale = useTransform(progress, [0.76, 0.82, 1.00], [0.96, 1, 1]);
  const display = useTransform(progress, (v) => (v >= 0.75 ? "flex" : "none"));

  // CTA button fades in near the end of Scene 04
  const ctaOpacity = useTransform(progress, [0.84, 0.92], [0, 1]);
  const ctaY = useTransform(progress, [0.84, 0.92], [15, 0]);

  return (
    <motion.div
      style={{ opacity, y, scale, display }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-success/40 bg-success/10 shadow-inner">
        <Trophy className="h-6 w-6 text-success" />
      </div>
      <div className="mb-2 font-mono text-xs font-semibold tracking-[0.25em] text-success uppercase">
        04 / Your Best Match
      </div>
      <h2 className="mb-2 font-display text-3xl font-medium leading-tight text-paper sm:text-4xl md:text-5xl">
        Not more choices.
        <br />
        <span className="italic text-accent">The right one.</span>
      </h2>
      <p className="mx-auto max-w-lg text-pretty text-sm leading-relaxed text-paper/70 sm:text-base">
        One clear recommendation with visible score breakdown and exact reasons why it won your priorities.
      </p>

      {/* Visual Demo */}
      <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-accent/50 bg-paper/10 p-4 shadow-[0_8px_30px_rgba(200,84,26,0.2)] backdrop-blur-md text-left">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
            Best Match
          </span>
          <span className="font-display text-sm font-bold text-accent">
            92% Match
          </span>
        </div>
        <div className="mt-2 font-display text-lg font-semibold text-paper">
          Samsung Galaxy A55 5G
        </div>
        <div className="mt-1 flex items-baseline justify-between text-xs text-paper/70">
          <span className="font-bold text-paper text-sm">₹34,999</span>
          <span className="font-mono text-success font-medium">5000mAh · 120Hz</span>
        </div>
      </div>

      {/* Scene 04 End CTA: Smoothly scrolls to main query input */}
      <motion.div
        style={{ opacity: ctaOpacity, y: ctaY }}
        className="mt-6 flex justify-center"
      >
        <button
          type="button"
          onClick={onCta}
          className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-lg transition-all hover:bg-accent/90 hover:scale-105 active:scale-95 cursor-pointer"
        >
          Find my match
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
