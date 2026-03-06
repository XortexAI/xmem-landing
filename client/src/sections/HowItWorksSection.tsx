import { motion } from "framer-motion";
import { RevealSection } from "../components/shared/RevealSection";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Capture",
      subtitle: "Store structured memory events",
      desc: "Emit memory events from any point in your system. Xmem captures structured facts, observations, and episodic memories with full context, metadata, and provenance.",
      code: `await xmem.remember({\n  type: "observation",\n  content: "User prefers dark mode",\n  tags: ["preference", "ui"],\n  confidence: 0.95\n})`,
    },
    {
      num: "02",
      title: "Retrieve",
      subtitle: "Intelligent contextual recall",
      desc: "Query memory with natural language or structured filters. Xmem semantically retrieves the most relevant memories, ranked by relevance, recency, and confidence.",
      code: `const memories = await xmem.recall({\n  query: "user interface preferences",\n  limit: 5,\n  minConfidence: 0.8\n})`,
    },
    {
      num: "03",
      title: "Evolve",
      subtitle: "Agents update memory autonomously",
      desc: "Your agents don't just read memory — they write back. Xmem lets agents refine, correct, merge, and deprecate memories as their understanding deepens.",
      code: `await xmem.update(memoryId, {\n  content: "User prefers high contrast",\n  confidence: 0.98,\n  reason: "Confirmed via settings"\n})`,
    },
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
            How It Works
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Three steps to
            <br />
            <span className="text-white/30">persistent intelligence</span>
          </h2>
        </RevealSection>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <RevealSection key={i} delay={i * 0.15}>
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 md:p-10 rounded-2xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <div
                    className="text-7xl font-bold text-white/08 mb-4 leading-none"
                    style={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    {step.num}
                  </div>
                  <h3
                    className="text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <div className="text-white/50 text-sm mb-4 font-medium">
                    {step.subtitle}
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <div className="code-block p-6 h-full rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <span className="ml-2 text-xs text-white/30">
                        xmem.ts
                      </span>
                    </div>
                    <pre
                      className="text-sm text-white/70 leading-relaxed overflow-x-auto"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
