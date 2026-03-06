import { motion } from "framer-motion";
import { RevealSection } from "../components/shared/RevealSection";

export function ProblemSection() {
  const problems = [
    {
      icon: "⊘",
      title: "AI forgets between sessions",
      desc: "Every conversation starts from zero. No continuity, no learning, no growth.",
    },
    {
      icon: "⊡",
      title: "Context windows are limited",
      desc: "Models are bottlenecked by token limits. Long-term state gets truncated and lost.",
    },
    {
      icon: "⊛",
      title: "Agent systems lose state",
      desc: "Autonomous agents can't maintain long-running task context across loops.",
    },
    {
      icon: "⊕",
      title: "Memory is fragmented",
      desc: "Data scattered across databases, files, embeddings — no unified memory layer.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-30 z-0" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060606] opacity-80"
        style={{ zIndex: -1 }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            The Problem
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AI Has Intelligence.
            <br />
            <span className="text-white/30">It Doesn't Have Memory.</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto">
            The gap between narrow AI tools and truly autonomous systems is not
            intelligence — it's memory.
          </p>
        </RevealSection>

        <RevealSection delay={0.2} className="mb-20">
          <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap">
            {[
              { label: "User", sub: "Input" },
              { label: "→", sub: "", arrow: true },
              { label: "AI Model", sub: "Processing" },
              { label: "→", sub: "", arrow: true },
              { label: "Lost State", sub: "❌ No Memory", broken: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-6">
                {item.arrow ? (
                  <div className="text-white/20 text-3xl font-thin">—</div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`px-6 py-4 rounded-lg text-center min-w-[120px] ${
                      item.broken ? "opacity-40" : ""
                    }`}
                    style={{
                      background: item.broken
                        ? "rgba(255,50,50,0.05)"
                        : "rgba(255,255,255,0.04)",
                      border: item.broken
                        ? "1px solid rgba(255,50,50,0.2)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="text-white font-semibold text-sm">
                      {item.label}
                    </div>
                    <div className="text-white/40 text-xs mt-1">{item.sub}</div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4 text-xs text-white/20 uppercase tracking-widest">
            Traditional AI Pipeline — Stateless
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((p, i) => (
            <RevealSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                className="p-8 rounded-xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="text-3xl mb-4 text-white/30 font-light">
                  {p.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
