import { motion } from "framer-motion";
import { RevealSection } from "../components/shared/RevealSection";

export function BenchmarkSection() {
  const data = [
    {
      label: "Single-Session\nUser (overall)",
      xmem: 97.1,
      zep: 92.9,
      full: 81.4,
    },
    { label: "Single-Session\nAssistant", xmem: 96.4, zep: 80.4, full: 94.6 },
    { label: "Single-Session\nPreference", xmem: 70.0, zep: 56.7, full: 20.0 },
    { label: "Knowledge\nUpdate", xmem: 88.4, zep: 83.3, full: 78.2 },
    { label: "Temporal\nReasoning", xmem: 76.7, zep: 62.4, full: 45.1 },
    { label: "Multi-Session", xmem: 71.4, zep: 57.9, full: 44.3 },
  ];

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
            Tested on the LongMemEval-S Benchmark. Xmem outperforms existing
            memory solutions and full-context models across all reasoning
            categories.
          </p>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="p-8 md:p-12 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-10">
              <span
                className="text-white font-bold text-lg md:text-xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                LongMemEval-S Benchmark:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #00f5d4, #00bbf9)",
                    boxShadow: "0 0 10px rgba(0,245,212,0.6)",
                  }}
                />
                <span className="text-cyan-300 font-semibold text-sm">
                  Xmem
                </span>
              </div>
              <span className="text-white/30 text-sm">vs</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #ff6b9d, #ff3366)",
                    boxShadow: "0 0 10px rgba(255,107,157,0.4)",
                  }}
                />
                <span className="text-rose-300 font-semibold text-sm">Zep</span>
              </div>
              <span className="text-white/30 text-sm">vs</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #c084fc, #9333ea)",
                    boxShadow: "0 0 10px rgba(192,132,252,0.4)",
                  }}
                />
                <span className="text-purple-300 font-semibold text-sm">
                  Full context
                </span>
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
                className="flex items-end justify-around gap-2 md:gap-6"
                style={{ height: "360px" }}
              >
                {data.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center flex-1 h-full justify-end"
                  >
                    <div className="flex items-end justify-center gap-[4px] md:gap-[6px] w-full h-full">
                      <div
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(18px, 3vw, 32px)" }}
                      >
                        <div
                          className="text-[9px] md:text-[10px] text-cyan-200 text-center mb-1 font-bold"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: "0 0 6px rgba(0,245,212,0.8)",
                          }}
                        >
                          {item.xmem.toFixed(1)}%
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.xmem}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08 }}
                          className="w-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #00f5d4 0%, #00bbf9 100%)",
                            boxShadow: "0 0 15px rgba(0,245,212,0.6)",
                          }}
                        />
                      </div>
                      <div
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(18px, 3vw, 32px)" }}
                      >
                        <div
                          className="text-[9px] md:text-[10px] text-rose-200 text-center mb-1 font-semibold"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: "0 0 6px rgba(255,107,157,0.6)",
                          }}
                        >
                          {item.zep.toFixed(1)}%
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.zep}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08 + 0.1 }}
                          className="w-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #ff6b9d 0%, #ff3366 100%)",
                            boxShadow: "0 0 10px rgba(255,107,157,0.4)",
                          }}
                        />
                      </div>
                      <div
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(18px, 3vw, 32px)" }}
                      >
                        <div
                          className="text-[9px] md:text-[10px] text-purple-200 text-center mb-1 font-semibold"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: "0 0 6px rgba(192,132,252,0.6)",
                          }}
                        >
                          {item.full.toFixed(1)}%
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.full}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08 + 0.2 }}
                          className="w-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #c084fc 0%, #9333ea 100%)",
                            boxShadow: "0 0 10px rgba(192,132,252,0.4)",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="text-[10px] md:text-xs text-center text-white/50 mt-3 leading-tight font-medium whitespace-pre-line"
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
      </div>
    </section>
  );
}
