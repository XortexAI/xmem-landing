import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      className="relative min-h-[92svh] flex items-center justify-center overflow-hidden pt-28 pb-16"
      style={{ background: "transparent" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-50 z-0" />

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pulse-glow pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        style={{ y, opacity, zIndex: 10 }}
        className="relative text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-medium text-white/70"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            letterSpacing: "0.1em",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          India's #1 Open-Source Memory Layer
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-8xl font-bold text-white mb-6 leading-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}
        >
          Open-Source
          <br />
          <span className="gradient-text">Memory Layer</span> for AI Agents
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          XMem is a persistent, multimodal memory layer for AI agents. It helps LLM apps remember user preferences, project context, temporal events, code knowledge, and conversation summaries across sessions, tools, and models.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/scanner"
            data-testid="button-start-building"
            className="flex items-center gap-2 px-8 py-4 rounded-md font-semibold text-black text-sm transition-all duration-200"
            style={{ background: "white" }}
          >
            Start Building
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            data-testid="button-read-docs"
            className="flex items-center gap-2 px-8 py-4 rounded-md font-medium text-white/80 text-sm transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Read the Docs
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-12"
        >
          {[
            ["<1ms", "Recall latency"],
            ["99.99%", "Uptime SLA"],
            ["∞", "Memory depth"],
            ["SOC 2", "Compliant"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {val}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </motion.div> */}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 10 }}
      >
        <div className="text-xs text-white/30 uppercase tracking-widest">
          Scroll
        </div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
