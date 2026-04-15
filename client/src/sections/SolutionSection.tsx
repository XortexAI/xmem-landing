import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Database, Layers, Globe, Network, GitBranch } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";
import { ArchitectureScene } from "../components/three-d/ArchitectureScene";

export function SolutionSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const isHeadingInView = useInView(headingRef, {
    once: false,
    margin: "-15% 0px -20% 0px",
  });

  const features = [
    {
      icon: Database,
      title: "Persistent Memory",
      desc: "Memory that outlives sessions, contexts, and deployments.",
    },
    {
      icon: Layers,
      title: "Structured Memory",
      desc: "Typed, versioned, queryable memory — not just raw embeddings.",
    },
    {
      icon: Globe,
      title: "Portable Memory",
      desc: "Your agents carry their memory across platforms and environments.",
    },
    {
      icon: Network,
      title: "Agent-Aware Memory",
      desc: "Built from the ground up for autonomous agent architectures.",
    },
    {
      icon: GitBranch,
      title: "Versioned Memory",
      desc: "Fork, merge, and roll back memory states like code commits.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <RevealSection>
              <div ref={headingRef}>
                <motion.div
                  initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                  animate={
                    isHeadingInView
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : { opacity: 0, y: 16, filter: "blur(10px)" }
                  }
                  transition={{
                    duration: 0.55,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs uppercase tracking-widest text-white/50"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  The Solution
                </motion.div>
                <h2
                  className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24, filter: "blur(18px)" }}
                    animate={
                      isHeadingInView
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : { opacity: 0, y: 24, filter: "blur(18px)" }
                    }
                    transition={{
                      duration: 0.7,
                      delay: 0.06,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                  >
                    Introducing
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 32, filter: "blur(22px)" }}
                    animate={
                      isHeadingInView
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : { opacity: 0, y: 32, filter: "blur(22px)" }
                    }
                    transition={{
                      duration: 0.8,
                      delay: 0.18,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="gradient-text"
                  >
                    Xmem
                  </motion.div>
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
                  animate={
                    isHeadingInView
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : { opacity: 0, y: 18, filter: "blur(12px)" }
                  }
                  transition={{
                    duration: 0.7,
                    delay: 0.28,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="mb-10 text-lg leading-relaxed text-white/40"
                >
                  The missing memory layer for autonomous AI. A persistent,
                  structured, and portable memory fabric that lives between your
                  agents and the world.
                </motion.p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Your App", sub: "Any framework, any language" },
                  {
                    label: "↓ Xmem Layer",
                    sub: "Persistent • Structured • Portable",
                    highlight: true,
                  },
                  {
                    label: "AI Model",
                    sub: "GPT-4, Claude, Gemini, Local LLMs",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 6 }}
                    className={`flex items-center justify-between rounded-lg px-5 py-4 transition-all duration-200 ${
                      item.highlight ? "feature-border-spin" : ""
                    }`}
                    style={{
                      background: item.highlight
                        ? "transparent"
                        : "rgba(255,255,255,0.02)",
                      border: item.highlight
                        ? "1px solid transparent"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      className={`font-semibold text-sm ${item.highlight ? "text-white" : "text-white/60"}`}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-white/30">{item.sub}</span>
                  </motion.div>
                ))}
              </div>
            </RevealSection>
          </div>

          <RevealSection delay={0.3}>
            <div
              className="h-[500px] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ArchitectureScene />
              </Canvas>
            </div>
          </RevealSection>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <RevealSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 24px 48px rgba(0,0,0,0.6), 0 0 34px rgba(88,120,255,0.16)",
                }}
                className="feature-border-spin h-full rounded-xl transition-all duration-300"
              >
                <div className="flex h-full flex-col gap-4 rounded-xl p-6">
                  <f.icon className="w-5 h-5 text-white/60" />
                  <h3 className="font-semibold text-white text-sm">
                    {f.title}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
