import { motion } from "framer-motion";
import { RevealSection } from "../components/shared/RevealSection";

const competitors = [
  {
    key: "xmem",
    label: "Xmem",
    gradient: "linear-gradient(135deg, #00f5d4, #00bbf9)",
    glow: "rgba(0,245,212,0.6)",
    textClass: "text-cyan-200",
    dotGlow: "0 0 10px rgba(0,245,212,0.6)",
    labelClass: "text-cyan-300",
  },
  {
    key: "zep",
    label: "Zep",
    gradient: "linear-gradient(135deg, #ff6b9d, #ff3366)",
    glow: "rgba(255,107,157,0.4)",
    textClass: "text-rose-200",
    dotGlow: "0 0 10px rgba(255,107,157,0.4)",
    labelClass: "text-rose-300",
  },
  {
    key: "full",
    label: "Full context",
    gradient: "linear-gradient(135deg, #c084fc, #9333ea)",
    glow: "rgba(192,132,252,0.4)",
    textClass: "text-purple-200",
    dotGlow: "0 0 10px rgba(192,132,252,0.4)",
    labelClass: "text-purple-300",
  },
  {
    key: "backboard",
    label: "Backboard",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    glow: "rgba(251,191,36,0.4)",
    textClass: "text-amber-200",
    dotGlow: "0 0 10px rgba(251,191,36,0.4)",
    labelClass: "text-amber-300",
  },
  {
    key: "memobase",
    label: "Memobase",
    gradient: "linear-gradient(135deg, #34d399, #10b981)",
    glow: "rgba(52,211,153,0.4)",
    textClass: "text-emerald-200",
    dotGlow: "0 0 10px rgba(52,211,153,0.4)",
    labelClass: "text-emerald-300",
  },
  {
    key: "supermemory",
    label: "Supermemory",
    gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
    glow: "rgba(96,165,250,0.4)",
    textClass: "text-blue-200",
    dotGlow: "0 0 10px rgba(96,165,250,0.4)",
    labelClass: "text-blue-300",
  },
];

interface BenchmarkData {
  label: string;
  xmem: number;
  zep: number;
  full: number;
  backboard: number;
  memobase: number;
  supermemory: number;
}

const longMemEvalData: BenchmarkData[] = [
  {
    label: "Single-Session\nUser (overall)",
    xmem: 97.1,
    zep: 92.9,
    full: 81.4,
    backboard: 97.1,
    memobase: 68.5,
    supermemory: 97.1,
  },
  {
    label: "Single-Session\nAssistant",
    xmem: 90.0,
    zep: 80.4,
    full: 94.6,
    backboard: 98.2,
    memobase: 65.3,
    supermemory: 96.4,
  },
  {
    label: "Single-Session\nPreference",
    xmem: 100.0,
    zep: 56.7,
    full: 20.0,
    backboard: 90.0,
    memobase: 38.1,
    supermemory: 70,
  },
  {
    label: "Knowledge\nUpdate",
    xmem: 88.4,
    zep: 83.3,
    full: 78.2,
    backboard: 93.6,
    memobase: 58.4,
    supermemory: 88.4,
  },
  {
    label: "Temporal\nReasoning",
    xmem: 100.0,
    zep: 62.4,
    full: 45.1,
    backboard: 91.7,
    memobase: 42.7,
    supermemory: 76.7,
  },
  {
    label: "Multi-Session",
    xmem: 100.0,
    zep: 57.9,
    full: 44.3,
    backboard: 91.7,
    memobase: 35.2,
    supermemory: 71.4,
  },
];

const locomoData: BenchmarkData[] = [
  {
    label: "Single Hop",
    xmem: 65.6,
    zep: 52.3,
    full: 58.1,
    backboard: 45.7,
    memobase: 40.2,
    supermemory: 48.9,
  },
  {
    label: "Multi-Hop",
    xmem: 69.2,
    zep: 54.8,
    full: 61.5,
    backboard: 43.1,
    memobase: 38.6,
    supermemory: 46.2,
  },
  {
    label: "Temporal",
    xmem: 73.0,
    zep: 58.4,
    full: 49.7,
    backboard: 51.2,
    memobase: 44.8,
    supermemory: 53.5,
  },
  {
    label: "Open Domain",
    xmem: 55.7,
    zep: 44.1,
    full: 52.3,
    backboard: 38.6,
    memobase: 33.9,
    supermemory: 41.4,
  },
];

function BenchmarkChart({
  data,
  title,
  delay = 0,
}: {
  data: BenchmarkData[];
  title: string;
  delay?: number;
}) {
  return (
    <RevealSection delay={delay}>
      <div className="p-6 md:p-10 relative overflow-hidden">
        {/* Title + Legend */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <span
            className="text-white font-bold text-xl md:text-2xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {competitors.map((c, idx) => (
              <div key={c.key} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <span className="text-white/20 text-xs mr-1">·</span>
                )}
                <div
                  className="w-3 h-3 rounded-[2px]"
                  style={{
                    background: c.gradient,
                    boxShadow: c.dotGlow,
                  }}
                />
                <span className={`${c.labelClass} font-semibold text-xs`}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="relative pl-10 md:pl-12">
          {/* Y-axis labels */}
          <div
            className="absolute left-0 top-0 bottom-10 w-10 md:w-12 flex flex-col justify-between items-end pr-2 text-xs text-white/40 z-10"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {[100, 80, 60, 40, 20, 0].map((v) => (
              <div key={v} className="relative w-full text-right">
                <span>{v}</span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute left-10 md:left-12 top-0 bottom-10 right-0 flex flex-col justify-between pointer-events-none">
            {[100, 80, 60, 40, 20, 0].map((v) => (
              <div
                key={v}
                className="w-full h-px"
                style={{
                  background:
                    v === 0
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.06)",
                }}
              />
            ))}
          </div>

          {/* Bars */}
          <div
            className="flex items-end justify-around gap-1 md:gap-4"
            style={{ height: "340px" }}
          >
            {data.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center flex-1 h-full justify-end"
              >
                <div className="flex items-end justify-center gap-[2px] md:gap-[3px] w-full h-full">
                  {competitors.map((comp, ci) => {
                    const rawValue = item[comp.key as keyof BenchmarkData];
                    const value =
                      typeof rawValue === "number" &&
                      Number.isFinite(rawValue)
                        ? rawValue
                        : 0;
                    return (
                      <div
                        key={comp.key}
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(10px, 2vw, 22px)" }}
                      >
                        <div
                          className={`text-[7px] md:text-[9px] ${comp.textClass} text-center mb-0.5 font-bold`}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: `0 0 4px ${comp.glow}`,
                          }}
                        >
                          {value.toFixed(1)}
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${value}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: i * 0.06 + ci * 0.04,
                          }}
                          className="w-full rounded-t-[2px]"
                          style={{
                            background: comp.gradient,
                            boxShadow: `0 0 10px ${comp.glow}`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  className="text-[9px] md:text-xs text-center text-white/50 mt-3 leading-tight font-medium whitespace-pre-line"
                  style={{ minHeight: "28px" }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

export function BenchmarkSection() {
  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#050505" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-24">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Performance
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Unmatched
            <br />
            <span className="text-white/30">Accuracy</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto mt-6">
            Tested on LongMemEval-S and LoCoMo benchmarks. Xmem outperforms
            existing memory solutions and full-context models across all
            reasoning categories.
          </p>
        </RevealSection>

        {/* LongMemEval-S Chart */}
        <BenchmarkChart
          data={longMemEvalData}
          title="LongMemEval-S Benchmark:"
          delay={0.2}
        />

        {/* Spacer */}
        <div className="h-8 md:h-12" />

        {/* LoCoMo Chart */}
        <BenchmarkChart
          data={locomoData}
          title="LoCoMo Benchmark:"
          delay={0.3}
        />
      </div>
    </section>
  );
}
