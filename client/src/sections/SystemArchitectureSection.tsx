import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import {
  MessageSquare,
  Workflow,
  Search,
  Scale,
  Wrench,
  Database,
  ListPlus,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

function ArchStepCard({
  step,
  activeStep,
}: {
  step: { id: number; label: string; sub: string; color: string; icon: React.ElementType };
  activeStep: number;
}) {
  const isActive = activeStep === step.id;
  const isPast = activeStep > step.id;
  const Icon = step.icon;

  return (
    <motion.div
      className="relative flex flex-col items-center text-center gap-2.5 p-5 rounded-xl flex-shrink-0 w-36 backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      animate={{
        scale: isActive ? 1.08 : isPast ? 1 : 0.96,
        borderColor: isActive
          ? step.color
          : isPast
            ? `${step.color}40`
            : "rgba(255,255,255,0.06)",
        boxShadow: isActive
          ? `0 0 30px ${step.color}20, 0 0 60px ${step.color}08, inset 0 1px 0 ${step.color}15`
          : "0 0 0 transparent",
        opacity: isPast || isActive ? 1 : 0.3,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          background: isActive || isPast ? `${step.color}10` : "rgba(255,255,255,0.02)",
          border: `1px solid ${isActive || isPast ? `${step.color}20` : "rgba(255,255,255,0.04)"}`,
        }}
      >
        <Icon
          className="w-5 h-5 transition-colors duration-300"
          style={{ color: isActive || isPast ? step.color : "rgba(255,255,255,0.12)" }}
        />
      </div>
      <div>
        <div className="text-white font-medium text-[13px] leading-tight">{step.label}</div>
        <div className="text-white/20 text-[10px] mt-1 leading-tight">{step.sub}</div>
      </div>
      {isActive && (
        <motion.div
          className="absolute -inset-px rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${step.color}08 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

function ArchCurvedConnector({
  fromId,
  toColor,
  activeStep,
}: {
  fromId: number;
  toColor: string;
  activeStep: number;
}) {
  const active = activeStep > fromId;
  const pathD = "M 0 20 C 16 8, 40 32, 56 20";

  return (
    <div className="w-14 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 56 40" className="w-full h-10 overflow-visible">
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="4 4" />
        <motion.path
          d={pathD}
          fill="none"
          stroke={toColor}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.7 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${toColor})` }}
        />
        {active && (
          <circle r="2" fill="white" opacity="0.7" style={{ filter: `drop-shadow(0 0 3px ${toColor})` }}>
            <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
          </circle>
        )}
      </svg>
    </div>
  );
}

function ArchVerticalConnector({
  fromId,
  toColor,
  activeStep,
}: {
  fromId: number;
  toColor: string;
  activeStep: number;
}) {
  const active = activeStep > fromId;
  const pathD = "M 20 0 C 6 16, 34 28, 20 44";

  return (
    <div className="flex justify-center my-1">
      <svg viewBox="0 0 40 44" className="w-10 h-11 overflow-visible">
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="4 4" />
        <motion.path
          d={pathD}
          fill="none"
          stroke={toColor}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.7 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${toColor})` }}
        />
        {active && (
          <circle r="2" fill="white" opacity="0.7" style={{ filter: `drop-shadow(0 0 3px ${toColor})` }}>
            <animateMotion dur="1.5s" repeatCount="indefinite" path={pathD} />
          </circle>
        )}
      </svg>
    </div>
  );
}

export function SystemArchitectureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v: number) => {
      if (v < 0.05) {
        setActiveStep(-1);
        return;
      }
      setActiveStep(Math.min(9, Math.floor(v * 11)));
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const steps = [
    { id: 0, label: "Message In", sub: "User msg + LLM response", color: "#06b6d4", icon: MessageSquare },
    { id: 1, label: "Classifier", sub: "Routes to agents", color: "#3b82f6", icon: Workflow },
    { id: 2, label: "Extraction", sub: "Pulls structured facts", color: "#8b5cf6", icon: Search },
    { id: 3, label: "Judge Agent", sub: "Evaluates & formats", color: "#a855f7", icon: Scale },
    { id: 4, label: "Tool Call", sub: "ADD / UPDATE / DELETE", color: "#ec4899", icon: Wrench },
    { id: 5, label: "Knowledge Base", sub: "Vector + Graph DB", color: "#10b981", icon: Database },
    { id: 6, label: "User Query", sub: "Natural language", color: "#14b8a6", icon: MessageSquare },
    { id: 7, label: "Retrieval", sub: "Semantic + graph", color: "#22c55e", icon: Search },
    { id: 8, label: "Context", sub: "Ranks & merges", color: "#84cc16", icon: ListPlus },
    { id: 9, label: "Answer", sub: "Augmented response", color: "#eab308", icon: CheckCircle2 },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-[250vh]"
      style={{ background: "linear-gradient(180deg, #080808 0%, #060606 50%, #080808 100%)" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-[0.03]" />

      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-5xl w-full mx-auto px-6">

          <RevealSection className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-[11px] text-white/30 uppercase tracking-[0.2em]"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              Architecture
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Engineered for <span className="gradient-text">Cognition</span>
            </h2>
            <p className="text-sm text-white/25 max-w-md mx-auto">
              Scroll to trace how information flows through the system
            </p>
          </RevealSection>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full bg-cyan-500/30" />
              <span className="text-[11px] font-medium text-white/25 uppercase tracking-[0.15em]">
                Ingestion Pipeline
              </span>
            </div>

            <div className="flex items-center justify-center">
              <ArchStepCard step={steps[0]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={0} toColor={steps[1].color} activeStep={activeStep} />
              <ArchStepCard step={steps[1]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={1} toColor={steps[2].color} activeStep={activeStep} />
              <ArchStepCard step={steps[2]} activeStep={activeStep} />
            </div>

            <ArchVerticalConnector fromId={2} toColor={steps[3].color} activeStep={activeStep} />

            <div className="flex items-center justify-center">
              <ArchStepCard step={steps[3]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={3} toColor={steps[4].color} activeStep={activeStep} />
              <ArchStepCard step={steps[4]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={4} toColor={steps[5].color} activeStep={activeStep} />
              <ArchStepCard step={steps[5]} activeStep={activeStep} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 my-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              animate={{
                borderColor: activeStep >= 6 ? "#14b8a6" : "rgba(255,255,255,0.06)",
                boxShadow: activeStep >= 6 ? "0 0 16px rgba(20,184,166,0.15)" : "0 0 0 transparent",
              }}
            >
              <ChevronRight
                className="w-3 h-3 rotate-90 transition-colors duration-300"
                style={{ color: activeStep >= 6 ? "#14b8a6" : "rgba(255,255,255,0.12)" }}
              />
            </motion.div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full bg-emerald-500/30" />
              <span className="text-[11px] font-medium text-white/25 uppercase tracking-[0.15em]">
                Retrieval Pipeline
              </span>
            </div>

            <div className="flex items-center justify-center">
              <ArchStepCard step={steps[6]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={6} toColor={steps[7].color} activeStep={activeStep} />
              <ArchStepCard step={steps[7]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={7} toColor={steps[8].color} activeStep={activeStep} />
              <ArchStepCard step={steps[8]} activeStep={activeStep} />
              <ArchCurvedConnector fromId={8} toColor={steps[9].color} activeStep={activeStep} />
              <ArchStepCard step={steps[9]} activeStep={activeStep} />
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-1.5">
              {steps.map((s) => (
                <motion.div
                  key={s.id}
                  className="w-1.5 h-1.5 rounded-full"
                  animate={{
                    backgroundColor: activeStep >= s.id ? s.color : "rgba(255,255,255,0.06)",
                    scale: activeStep === s.id ? 1.6 : 1,
                    boxShadow: activeStep === s.id ? `0 0 8px ${s.color}` : "0 0 0 transparent",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
