import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { RevealSection } from "../components/shared/RevealSection";

const problems = [
  {
    icon: "01",
    title: "AI forgets between sessions",
    desc: "Every conversation starts from zero. No continuity, no learning, no growth.",
  },
  {
    icon: "02",
    title: "Context windows are limited",
    desc: "Models are bottlenecked by token limits. Long-term state gets truncated and lost.",
  },
  {
    icon: "03",
    title: "Agent systems lose state",
    desc: "Autonomous agents cannot maintain long-running task context across loops.",
  },
  {
    icon: "04",
    title: "Memory is fragmented",
    desc: "Data scattered across databases, files, and embeddings creates no unified memory layer.",
  },
];

const flowSteps = [
  {
    label: "Prompt arrives",
    sub: "User intent enters the system",
    tone: "clean",
  },
  {
    label: "Model responds",
    sub: "It reasons only inside the active window",
    tone: "clean",
  },
  {
    label: "State collapses",
    sub: "Session memory disappears after the turn",
    tone: "broken",
  },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  
  const isHeadlineInView = useInView(headlineRef, {
    once: false,
    margin: "-20% 0px -20% 0px",
  });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 35%"],
  });

  // Animated path hooks for the scroll-driven arrows
  const arrow1Path = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const arrow1Head = useTransform(scrollYProgress, [0.3, 0.35], [0, 1]);
  
  const arrow2Path = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const arrow2Head = useTransform(scrollYProgress, [0.55, 0.6], [0, 1]);

  const collapseOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0.3, 1]);
  const collapseY = useTransform(scrollYProgress, [0.6, 0.8], [30, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-40"
      style={{ background: "transparent" }}
    >
      <div className="absolute inset-0 z-0 opacity-30 dot-pattern" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.07), transparent 42%), linear-gradient(180deg, rgba(6,6,6,0.05) 0%, rgba(6,6,6,0.92) 100%)",
          zIndex: -1,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div ref={headlineRef} className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={
              isHeadlineInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 18, filter: "blur(10px)" }
            }
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-white/50"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            The Problem
          </motion.div>

          <div
            className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-white md:text-7xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, filter: "blur(18px)" }}
              animate={
                isHeadlineInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 28, filter: "blur(18px)" }
              }
              transition={{ duration: 0.7, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              AI Has Intelligence.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 36, filter: "blur(22px)" }}
              animate={
                isHeadlineInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 36, filter: "blur(22px)" }
              }
              transition={{ duration: 0.8, delay: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-3 text-white/30"
            >
              It Doesn&apos;t Have Memory.
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(14px)" }}
            animate={
              isHeadlineInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 20, filter: "blur(14px)" }
            }
            transition={{ duration: 0.7, delay: 0.34, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-white/40"
          >
            The gap between narrow AI tools and truly autonomous systems is not
            intelligence. It is memory that persists after the scroll, the turn,
            and the session.
          </motion.p>
        </div>

        <RevealSection delay={0.15} className="mb-24">
          <div
            className="relative overflow-hidden rounded-[32px] border px-6 py-8 md:px-10 md:py-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
            }}
          >
            <div
              className="absolute inset-x-10 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)",
              }}
            />

            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                  Stateless flow
                </div>
                <div
                  className="mt-3 text-2xl font-semibold text-white md:text-3xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Input goes in. Output comes back. Nothing stays.
                </div>
              </div>
              <div className="hidden text-right text-sm leading-relaxed text-white/35 md:block">
                Traditional pipelines answer the prompt,
                <br />
                then drop the state that produced it.
              </div>
            </div>

            {/* Robust Flexbox layout with arrows injected between boxes */}
            <div className="flex flex-col md:flex-row md:items-center w-full">
              {flowSteps.map((step, index) => (
                <React.Fragment key={step.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.45 }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.12,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    whileHover={{ y: -4 }}
                    className="relative w-full flex-1 rounded-[24px] p-6 md:p-7 z-10"
                    style={{
                      background:
                        step.tone === "broken"
                          ? "linear-gradient(180deg, rgba(120,18,18,0.28) 0%, rgba(255,255,255,0.02) 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                      border:
                        step.tone === "broken"
                          ? "1px solid rgba(255,110,110,0.22)"
                          : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                        0{index + 1}
                      </div>
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background:
                            step.tone === "broken"
                              ? "rgba(255,110,110,0.9)"
                              : "rgba(255,255,255,0.7)",
                          boxShadow:
                            step.tone === "broken"
                              ? "0 0 22px rgba(255,80,80,0.45)"
                              : "0 0 18px rgba(255,255,255,0.2)",
                        }}
                      />
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {step.label}
                    </div>
                    {/* FIXED: Changed text-white/42 to text-white/50 */}
                    <div className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
                      {step.sub}
                    </div>
                  </motion.div>

                  {/* Scroll-driven Animated Arrows */}
                  {index < flowSteps.length - 1 && (
                    <div className="flex shrink-0 items-center justify-center py-4 md:py-0 md:px-4">
                      
                      {/* Desktop Horizontal Arrow */}
                      <svg className="hidden md:block" width="60" height="24" viewBox="0 0 60 24" fill="none">
                        {/* Faded background track */}
                        <path d="M0 12H56" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M48 6L56 12L48 18" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Animated fill that draws on scroll */}
                        <motion.path 
                          d="M0 12H56" 
                          stroke={index === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,90,90,0.7)"} 
                          strokeWidth="2" 
                          style={{ pathLength: index === 0 ? arrow1Path : arrow2Path }} 
                        />
                        <motion.path 
                          d="M48 6L56 12L48 18" 
                          stroke={index === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,90,90,0.7)"} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ opacity: index === 0 ? arrow1Head : arrow2Head }} 
                        />
                      </svg>

                      {/* Mobile Vertical Arrow */}
                      <svg className="block md:hidden" width="24" height="40" viewBox="0 0 24 40" fill="none">
                        <path d="M12 0V36" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M6 28L12 36L18 28" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        
                        <motion.path 
                          d="M12 0V36" 
                          stroke={index === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,90,90,0.7)"} 
                          strokeWidth="2" 
                          style={{ pathLength: index === 0 ? arrow1Path : arrow2Path }} 
                        />
                        <motion.path 
                          d="M6 28L12 36L18 28" 
                          stroke={index === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,90,90,0.7)"} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ opacity: index === 0 ? arrow1Head : arrow2Head }} 
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <motion.div
              style={{ opacity: collapseOpacity, y: collapseY }}
              className="mt-8 flex items-center justify-between gap-4 rounded-[24px] border px-5 py-4 text-sm text-white/42"
              transition={{ duration: 0.2 }}
            >
              <div className="uppercase tracking-[0.2em] text-white/28">
                Failure point
              </div>
              <div className="text-right md:text-left">
                Context dies at the end of the response. The next turn starts cold.
              </div>
            </motion.div>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {problems.map((problem, index) => (
            <RevealSection key={problem.title} delay={index * 0.1}>
              <motion.div
                whileHover={{
                  y: -6,
                  boxShadow: "0 24px 50px rgba(0,0,0,0.38)",
                }}
                className="rounded-[24px] p-8 transition-all duration-300 h-full"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div
                    className="text-3xl font-semibold text-white/22"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {problem.icon}
                  </div>
                  <div className="h-px w-16 bg-white/10" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  {problem.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/40">
                  {problem.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}