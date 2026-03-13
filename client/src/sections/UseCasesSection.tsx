import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Cpu,
  Globe,
  Network,
  Terminal,
  Workflow,
} from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

type UseCaseItem = {
  icon: typeof Brain;
  eyebrow: string;
  title: string;
  desc: string;
  detail: string;
  tags: string[];
  signal: string;
};

function UseCaseCard({
  useCase,
  index,
}: {
  useCase: UseCaseItem;
  index: number;
}) {
  return (
    <div
      className="relative h-full overflow-hidden rounded-[32px] border p-8 md:p-10"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-8 rounded-full blur-3xl"
        style={{
          background:
            index % 2 === 0
              ? "radial-gradient(circle, rgba(80,140,255,0.14), transparent 72%)"
              : "radial-gradient(circle, rgba(255,255,255,0.08), transparent 72%)",
        }}
      />

      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[18px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <useCase.icon className="h-7 w-7 text-white/70" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/30">
                {useCase.eyebrow}
              </div>
              <h3
                className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {useCase.title}
              </h3>
            </div>
          </div>

          <p className="mt-8 text-base leading-relaxed text-white/40 md:text-lg">
            {useCase.desc}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/30 md:text-[15px]">
            {useCase.detail}
          </p>
        </div>

        <div className="text-[11px] uppercase tracking-[0.28em] text-white/20">
          0{index + 1}
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/30">
            Why Xmem fits
          </div>
          <div className="mt-4 space-y-3">
            {useCase.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-3 text-sm text-white/40"
              >
                <div className="h-2 w-2 rounded-full bg-white/40" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/30">
            Outcome
          </div>
          <div
            className="mt-4 text-xl font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {useCase.signal}
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-white/50">
            Memory as infrastructure
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollUseCaseCard({
  progress,
  casesLength,
  useCase,
  index,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  casesLength: number;
  useCase: UseCaseItem;
  index: number;
}) {
  const step = 1 / casesLength;
  const start = index * step;
  const end = start + step;
  const fadeTransition = step * 0.25;

  const range = [
    index === 0 ? -0.1 : start - fadeTransition,
    index === 0 ? 0 : start + fadeTransition,
    index === casesLength - 1 ? 1 : end - fadeTransition,
    index === casesLength - 1 ? 1.1 : end + fadeTransition,
  ];

  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [80, 0, 0, -80]);
  const scale = useTransform(progress, range, [0.92, 1, 1, 0.92]);
  const blur = useTransform(progress, range, [12, 0, 0, 12]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);

  return (
    <motion.div
      style={{
        opacity,
        y,
        scale,
        zIndex: casesLength - index,
        filter,
      }}
      className="absolute inset-0"
    >
      <UseCaseCard useCase={useCase} index={index} />
    </motion.div>
  );
}

export function UseCasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cases: UseCaseItem[] = [
    {
      icon: Brain,
      eyebrow: "Personalized assistance",
      title: "AI Copilots",
      desc: "Build copilots that remember every interaction, preference, and working context instead of starting cold each time.",
      detail:
        "Useful for product assistants, embedded support agents, onboarding flows, and long-running customer relationships.",
      tags: [
        "Preference memory",
        "Conversation continuity",
        "Personalized recall",
      ],
      signal: "Retains user-specific context across sessions",
    },
    {
      icon: Cpu,
      eyebrow: "Consumer intelligence",
      title: "Personal AI",
      desc: "Ship AI that grows with the user over months and years, not just within a single prompt window.",
      detail:
        "Ideal for everyday assistants, journaling tools, coaching products, and personal knowledge layers.",
      tags: ["Long-term growth", "Portable identity", "Cross-device memory"],
      signal: "Turns usage into persistent intelligence",
    },
    {
      icon: Terminal,
      eyebrow: "Developer tooling",
      title: "Dev Agents",
      desc: "Create coding agents that remember architecture choices, project conventions, and prior debugging decisions.",
      detail:
        "Strong fit for code review agents, repo copilots, and engineering workflows that need continuity between runs.",
      tags: ["Repo memory", "Decision history", "Workflow continuity"],
      signal: "Keeps engineering context alive between loops",
    },
    {
      icon: Network,
      eyebrow: "Agent orchestration",
      title: "Autonomous Pipelines",
      desc: "Let long-running pipelines accumulate knowledge over time instead of re-deriving the same state every cycle.",
      detail:
        "Useful for monitoring agents, workflow automation, data operations, and task systems that need durable state.",
      tags: ["Task persistence", "Loop memory", "Operational feedback"],
      signal: "Improves system behavior with every execution",
    },
    {
      icon: Globe,
      eyebrow: "Shared organizational memory",
      title: "Enterprise AI Workflows",
      desc: "Enable organization-wide AI workflows with shared memory, knowledge continuity, and controlled retrieval.",
      detail:
        "Works for internal copilots, knowledge systems, regulated teams, and memory-aware enterprise automation.",
      tags: ["Institutional memory", "Controlled access", "Knowledge reuse"],
      signal: "Makes memory a first-class enterprise primitive",
    },
    {
      icon: Workflow,
      eyebrow: "Custom systems",
      title: "New Memory-Native Products",
      desc: "If you are building a product category that depends on recall, Xmem becomes the layer that gives it continuity.",
      detail:
        "For founders and teams building something unusual, memory is often the differentiator rather than a feature.",
      tags: ["New categories", "Portable context", "Memory by design"],
      signal: "Build products that get better because they remember",
    },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-clip py-40"
      style={{ background: "#060606" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div
        className="absolute left-1/2 top-24 h-[520px] w-[880px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 40%, transparent 74%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <RevealSection className="max-w-xl">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs uppercase tracking-widest text-white/50"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Use Cases
              </div>
              <h2
                className="text-5xl font-bold tracking-tight text-white md:text-7xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Who builds with
                <br />
                <span className="text-white/30">Xmem?</span>
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-white/40">
                Teams building serious AI systems need memory that survives
                sessions, tools, environments, and loops. Scroll through the
                systems where Xmem stops context from collapsing.
              </p>

              <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/30">
                  Memory-native stack
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Persistent state across sessions",
                    "Portable context across runtimes",
                    "Shared memory across agents and teams",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-white/40"
                    >
                      <div className="h-2 w-2 rounded-full bg-white/40" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>

          <div className="relative min-h-[420vh] lg:min-h-[560vh]">
            <div className="sticky top-24 hidden h-[76vh] lg:block">
              {cases.map((useCase, index) => (
                <ScrollUseCaseCard
                  key={useCase.title}
                  progress={scrollYProgress}
                  casesLength={cases.length}
                  useCase={useCase}
                  index={index}
                />
              ))}
            </div>

            <div className="space-y-8 lg:hidden">
              {cases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 40, scale: 0.96, filter: "blur(18px)" }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    duration: 0.75,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="relative"
                >
                  <UseCaseCard useCase={useCase} index={index} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
