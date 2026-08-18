import { motion, useScroll, useTransform } from "framer-motion";
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
    <section ref={ref} className="relative bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-6">
        {SCENES.map((scene, i) => {
          const start = i / SCENES.length;
          const end = (i + 1) / SCENES.length;
          const mid = (start + end) / 2;

          return (
            <Scene
              key={scene.num}
              scene={scene}
              index={i}
              progress={scrollYProgress}
              start={start}
              mid={mid}
              end={end}
            />
          );
        })}
      </div>
    </section>
  );
}

interface SceneProps {
  scene: (typeof SCENES)[number];
  index: number;
  progress: any;
  start: number;
  mid: number;
  end: number;
}

function Scene({ scene, index, progress, start, mid, end }: SceneProps) {
  const opacity = useTransform(progress, [start, mid, end], [0, 1, 0]);
  const y = useTransform(progress, [start, mid, end], [60, 0, -60]);
  const scale = useTransform(progress, [start, mid, end], [0.96, 1, 0.96]);

  const Icon = scene.icon;

  return (
    <div className="sticky flex min-h-[70vh] items-center justify-center py-20">
      <motion.div
        style={{ opacity, y, scale }}
        className="max-w-2xl text-center"
      >
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
                className="h-24 w-16 rounded-lg border border-paper/15 bg-paper/5"
              />
            ))}
          </div>
        )}
        {index === 1 && (
          <div className="mt-10 rounded-xl border border-paper/15 bg-paper/5 px-5 py-4 text-left text-sm text-paper/70">
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
      </motion.div>
    </div>
  );
}
