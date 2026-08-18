import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Layers, MessageSquareText, Gauge, Trophy } from "lucide-react";

const SCENES = [
  {
    num: "01",
    icon: Layers,
    title: "Too many choices",
    body: "Endless product lists, conflicting specs, and review fatigue. Shopping for anything takes more time than it should.",
    accent: "text-muted",
  },
  {
    num: "02",
    icon: MessageSquareText,
    title: "Tell us what matters",
    body: "Describe what you need in plain words — your budget, your use cases, and what matters most to you.",
    accent: "text-ink",
  },
  {
    num: "03",
    icon: Gauge,
    title: "We score what matters to you",
    body: "The AI extracts your priorities. Our scoring engine ranks every product against those priorities — transparently.",
    accent: "text-accent",
  },
  {
    num: "04",
    icon: Trophy,
    title: "Your best match",
    body: "One clear recommendation, with a visible score breakdown and the reasons it fits your specific needs.",
    accent: "text-success",
  },
];

export function Scroller() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    // Tall scroll track: one viewport-height of scroll per scene, plus a little
    // extra so the last scene has room to settle before the section ends.
    <section
      ref={ref}
      className="relative bg-ink text-paper"
      style={{ height: `${SCENES.length * 100}vh` }}
    >
      {/* Inner stage pins to the top of the viewport while the track scrolls past. */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Progress rail */}
        <div className="pointer-events-none absolute left-1/2 top-8 z-10 flex -translate-x-1/2 gap-1.5">
          {SCENES.map((s, i) => (
            <Tick key={s.num} index={i} total={SCENES.length} progress={scrollYProgress} />
          ))}
        </div>

        {SCENES.map((scene, i) => (
          <Scene
            key={scene.num}
            scene={scene}
            index={i}
            total={SCENES.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

function Tick({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const step = 1 / total;
  const center = (index + 0.5) * step;
  const opacity = useTransform(
    progress,
    [center - step * 0.5, center, center + step * 0.5],
    [0.3, 1, 0.3],
  );
  const scaleX = useTransform(
    progress,
    [center - step * 0.5, center, center + step * 0.5],
    [1, 2.4, 1],
  );
  return (
    <motion.span
      style={{ opacity, scaleX }}
      className="h-1 w-6 origin-center rounded-full bg-paper"
    />
  );
}

interface SceneProps {
  scene: (typeof SCENES)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function Scene({ scene, index, total, progress }: SceneProps) {
  const step = 1 / total;
  const center = (index + 0.5) * step;

  // Overlapping fade windows so adjacent scenes cross-fade — never a blank gap.
  const fadeInStart = center - step * 0.7;
  const fadeInEnd = center - step * 0.2;
  const fadeOutStart = center + step * 0.2;
  const fadeOutEnd = center + step * 0.7;

  const opacity = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [fadeInStart, center, fadeOutEnd], [48, 0, -48]);
  const scale = useTransform(
    progress,
    [fadeInStart, center, fadeOutEnd],
    [0.97, 1, 0.97],
  );

  const Icon = scene.icon;

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="absolute inset-0 flex items-center justify-center px-6"
    >
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-paper/20">
          <Icon className={`h-6 w-6 ${scene.accent}`} />
        </div>
        <div className="mb-3 font-mono text-xs tracking-[0.3em] text-paper/40">
          {scene.num}
        </div>
        <h2 className="mb-5 font-display text-3xl font-medium leading-tight text-paper sm:text-4xl md:text-5xl">
          {scene.title}
        </h2>
        <p className="mx-auto max-w-lg text-pretty text-base leading-relaxed text-paper/60 sm:text-lg">
          {scene.body}
        </p>

        {index === 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2 opacity-50">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-14 rounded-lg border border-paper/15 bg-paper/5 sm:h-24 sm:w-16"
              />
            ))}
          </div>
        )}
        {index === 1 && (
          <div className="mx-auto mt-10 max-w-md rounded-xl border border-paper/15 bg-paper/5 px-5 py-4 text-left text-sm text-paper/70">
            "I need a phone under $400 for gaming and college. Battery matters
            more than camera."
          </div>
        )}
        {index === 2 && (
          <div className="mx-auto mt-10 max-w-xs space-y-2 text-left">
            {[
              { label: "Budget fit", v: 90 },
              { label: "Priority match", v: 85 },
              { label: "Use-case fit", v: 80 },
              { label: "Rating", v: 92 },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs text-paper/50">
                  <span>{row.label}</span>
                  <span className="font-mono">{row.v}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper/10">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.v}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {index === 3 && (
          <div className="mx-auto mt-10 max-w-xs rounded-xl border border-accent/40 bg-accent/10 px-5 py-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Best Match
            </div>
            <div className="mt-1 font-display text-xl font-medium text-paper">
              Galaxy A55 5G
            </div>
            <div className="text-sm text-paper/60">92% match · $349</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
