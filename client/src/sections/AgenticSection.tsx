import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Cpu } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";
import { AgentNetworkScene } from "../components/three-d/AgentNetwork";

export function AgenticSection() {
  const features = [
    {
      title: "Multi-agent environments",
      desc: "Shared memory fabric across all spawned agents — no more memory silos.",
    },
    {
      title: "Autonomous task loops",
      desc: "Agents persist context across thousands of loop iterations without degradation.",
    },
    {
      title: "Long-running workflows",
      desc: "Resume any workflow exactly where it left off, days or weeks later.",
    },
    {
      title: "Memory portability",
      desc: "Export and import agent memory across platforms, models, and environments.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <RevealSection className="order-2 lg:order-1">
            <div
              className="h-[520px] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <AgentNetworkScene />
              </Canvas>
            </div>
          </RevealSection>

          <div className="order-1 lg:order-2">
            <RevealSection>
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Agentic Systems
              </div>
              <h2
                className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                The database layer
                <br />
                <span className="gradient-text">for AGI systems</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed mb-10">
                Xmem is engineered for the next wave of autonomous AI — systems
                that don't just process tasks but accumulate knowledge, build
                expertise, and maintain identity across time.
              </p>

              <div className="space-y-4">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <Cpu className="w-3 h-3 text-white/60" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm mb-1">
                        {f.title}
                      </div>
                      <div className="text-white/40 text-xs leading-relaxed">
                        {f.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </div>
    </section>
  );
}
