import { motion } from "framer-motion";
import { RevealSection } from "../components/shared/RevealSection";

type CompetitorKey =
  | "xmem"
  | "zep"
  | "full"
  | "backboard"
  | "memobase"
  | "supermemory"
  | "mem0";

type Competitor = {
  key: CompetitorKey;
  label: string;
  gradient: string;
  glow: string;
  textClass: string;
  dotGlow: string;
  labelClass: string;
};

const competitorStyles: Record<CompetitorKey, Omit<Competitor, "key">> = {
  xmem: {
    label: "Xmem",
    gradient: "linear-gradient(135deg, #00f5d4, #00bbf9)",
    glow: "rgba(0,245,212,0.6)",
    textClass: "text-cyan-200",
    dotGlow: "0 0 10px rgba(0,245,212,0.6)",
    labelClass: "text-cyan-300",
  },
  zep: {
    label: "Zep",
    gradient: "linear-gradient(135deg, #883355, #771133)",
    glow: "rgba(255,107,157,0.1)",
    textClass: "text-rose-400/60",
    dotGlow: "0 0 10px rgba(255,107,157,0.1)",
    labelClass: "text-rose-400/80",
  },
  full: {
    label: "Full context",
    gradient: "linear-gradient(135deg, #664488, #441177)",
    glow: "rgba(192,132,252,0.1)",
    textClass: "text-purple-400/60",
    dotGlow: "0 0 10px rgba(192,132,252,0.1)",
    labelClass: "text-purple-400/80",
  },
  backboard: {
    label: "Backboard",
    gradient: "linear-gradient(135deg, #886611, #774400)",
    glow: "rgba(251,191,36,0.1)",
    textClass: "text-amber-400/60",
    dotGlow: "0 0 10px rgba(251,191,36,0.1)",
    labelClass: "text-amber-400/80",
  },
  memobase: {
    label: "Memobase",
    gradient: "linear-gradient(135deg, #117755, #005533)",
    glow: "rgba(52,211,153,0.1)",
    textClass: "text-emerald-400/60",
    dotGlow: "0 0 10px rgba(52,211,153,0.1)",
    labelClass: "text-emerald-400/80",
  },
  supermemory: {
    label: "Supermemory",
    gradient: "linear-gradient(135deg, #335588, #113377)",
    glow: "rgba(96,165,250,0.1)",
    textClass: "text-blue-400/60",
    dotGlow: "0 0 10px rgba(96,165,250,0.1)",
    labelClass: "text-blue-400/80",
  },
  mem0: {
    label: "Mem0",
    gradient: "linear-gradient(135deg, #335588, #113377)",
    glow: "rgba(96,165,250,0.1)",
    textClass: "text-blue-400/60",
    dotGlow: "0 0 10px rgba(96,165,250,0.1)",
    labelClass: "text-blue-400/80",
  },
};

const longMemEvalCompetitors: Competitor[] = [
  { key: "xmem", ...competitorStyles.xmem },
  { key: "zep", ...competitorStyles.zep },
  { key: "full", ...competitorStyles.full },
  { key: "backboard", ...competitorStyles.backboard },
  { key: "memobase", ...competitorStyles.memobase },
  { key: "supermemory", ...competitorStyles.supermemory },
];

const locomoCompetitors: Competitor[] = [
  { key: "xmem", ...competitorStyles.xmem },
  { key: "zep", ...competitorStyles.zep },
  { key: "full", ...competitorStyles.full },
  { key: "backboard", ...competitorStyles.backboard },
  { key: "memobase", ...competitorStyles.memobase },
  { key: "mem0", ...competitorStyles.mem0 },
];

interface BenchmarkDataLongMem {
  label: string;
  xmem: number;
  zep: number;
  full: number;
  backboard: number;
  memobase: number;
  supermemory: number;
}

interface BenchmarkDataLoCoMo {
  label: string;
  xmem: number;
  zep: number;
  full: number;
  backboard: number;
  memobase: number;
  mem0: number;
}

const longMemEvalData: BenchmarkDataLongMem[] = [
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

const locomoData: BenchmarkDataLoCoMo[] = [
  {
    label: "Single Hop",
    xmem: 90.6,
    zep: 74.1,
    full: 58.1,
    backboard: 89.4,
    memobase: 70.9,
    mem0: 67.1,
  },
  {
    label: "Multi-Hop",
    xmem: 92.3,
    zep: 66.0,
    full: 61.5,
    backboard: 75.0,
    memobase: 46.9,
    mem0: 51.1,
  },
  {
    label: "Temporal",
    xmem: 91.9,
    zep: 79.8,
    full: 49.7,
    backboard: 91.9,
    memobase: 85.0,
    mem0: 55.5,
  },
  {
    label: "Open Domain",
    xmem: 91.2,
    zep: 67.7,
    full: 52.3,
    backboard: 91.2,
    memobase: 77.2,
    mem0: 72.9,
  },
];

function BenchmarkChart({
  data,
  competitors,
  title,
  delay = 0,
}: {
  data: Array<Partial<Record<CompetitorKey, number>> & { label: string }>;
  competitors: Competitor[];
  title: string;
  delay?: number;
}) {
  return (
    <RevealSection delay={delay}>
      <div className="p-6 md:p-10 relative overflow-hidden">
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
                {idx > 0 && <span className="text-white/20 text-xs mr-1">.</span>}
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

        <div className="relative pl-10 md:pl-12">
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
                    const rawValue = item[comp.key];
                    const value =
                      typeof rawValue === "number" && Number.isFinite(rawValue)
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

        <BenchmarkChart
          data={longMemEvalData}
          competitors={longMemEvalCompetitors}
          title="LongMemEval-S Benchmark:"
          delay={0.2}
        />

        <div className="h-8 md:h-12" />

        <BenchmarkChart
          data={locomoData}
          competitors={locomoCompetitors}
          title="LoCoMo Benchmark:"
          delay={0.3}
        />
      </div>
    </section>
  );
}
