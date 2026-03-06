import { motion } from "framer-motion";
import { Brain, Cpu, Terminal, Network, Globe, ArrowRight } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

export function UseCasesSection() {
  const cases = [
    {
      icon: Brain,
      title: "AI Copilots",
      desc: "Build copilots that remember every interaction, preference, and context — creating deeply personalized experiences.",
    },
    {
      icon: Cpu,
      title: "Personal AI",
      desc: "Consumer AI assistants with continuous memory — your AI grows with you over months and years.",
    },
    {
      icon: Terminal,
      title: "Dev Agents",
      desc: "Coding agents that remember your codebase, patterns, and decisions across every project and session.",
    },
    {
      icon: Network,
      title: "Autonomous Pipelines",
      desc: "Long-running automation pipelines that accumulate knowledge and improve with every execution.",
    },
    {
      icon: Globe,
      title: "Enterprise AI Workflows",
      desc: "Organization-wide AI with shared institutional memory, knowledge bases, and audit trails.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#060606" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Use Cases
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Who builds with
            <br />
            <span className="text-white/30">Xmem?</span>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{
                  y: -10,
                  rotateX: 2,
                  rotateY: -2,
                  boxShadow:
                    "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)",
                }}
                className="p-8 rounded-xl h-full transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <c.icon className="w-6 h-6 text-white/70" />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {c.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}

          <RevealSection delay={0.5}>
            <motion.div
              whileHover={{
                y: -10,
                boxShadow:
                  "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.2)",
              }}
              className="p-8 rounded-xl h-full transition-all duration-300 flex flex-col items-center justify-center text-center gap-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                minHeight: "220px",
              }}
            >
              <div className="text-white/30 text-sm uppercase tracking-widest">
                Your use case
              </div>
              <h3 className="text-xl font-bold text-white">
                Building something unique?
              </h3>
              <button className="text-sm text-white/60 flex items-center gap-1 hover:text-white transition-colors">
                Talk to us <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
