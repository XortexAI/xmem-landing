import { motion } from "framer-motion";
import { Shield, Lock, FileText, Server } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

export function EnterpriseSection() {
  const pillars = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      desc: "AES-256 encryption at rest and in transit keeps memory protected across every environment.",
    },
    {
      icon: Shield,
      title: "Access Control",
      desc: "Granular RBAC and isolation rules let teams define exactly who can read and write memory.",
    },
    {
      icon: Server,
      title: "Memory Namespaces",
      desc: "Namespace-level partitioning creates clean tenant boundaries for multi-tenant deployments.",
    },
    {
      icon: FileText,
      title: "Audit Trails",
      desc: "Every operation is traceable with immutable logs for compliance, review, and forensic workflows.",
    },
  ];

  return (
    <section
      className="relative overflow-hidden py-40"
      style={{ background: "#060606" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div
        className="absolute left-1/2 top-32 h-[420px] w-[760px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 38%, transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <RevealSection className="mb-20 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs uppercase tracking-widest text-white/50"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Enterprise Ready
          </div>
          <h2
            className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Built for production.
            <br />
            <span className="text-white/30">Not prototypes.</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/40">
            Security, isolation, and predictable memory economics in one layer.
            Xmem is designed for teams shipping real systems, not one-off demos.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <RevealSection delay={0.08}>
            <motion.div
              whileHover={{
                y: -6,
                boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
              }}
              className="relative overflow-hidden rounded-[32px] border p-8 md:p-10"
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
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
              />

              <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Production control plane
                  </div>
                  <h3
                    className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Enterprise memory infrastructure with real boundaries.
                  </h3>
                </div>
                <div className="max-w-sm text-sm leading-relaxed text-white/35">
                  Four fundamentals matter here: encryption, access, tenant
                  isolation, and an auditable history of every memory operation.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pillars.map((pillar, index) => (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.65, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="rounded-[24px] border p-6"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      borderColor: "rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <pillar.icon className="h-5 w-5 text-white/70" />
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/25">
                        0{index + 1}
                      </div>
                    </div>
                    <h4 className="mb-3 text-lg font-semibold text-white">
                      {pillar.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-white/40">
                      {pillar.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </RevealSection>

          <RevealSection delay={0.16}>
            <motion.div
              whileHover={{
                y: -6,
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.55), 0 0 40px rgba(70,140,255,0.12)",
              }}
              className="feature-border-spin h-full rounded-[32px]"
            >
              <div className="flex h-full flex-col rounded-[32px] p-8 md:p-10">
                <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                  Usage economics
                </div>
                <h3
                  className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Predictable pricing for memory at scale.
                </h3>
                <p className="mt-5 text-sm leading-relaxed text-white/40">
                  Keep cost visible at the same level as security. Ingestion and
                  retrieval are simple to model and easy to reason about.
                </p>

                <div className="mt-10 space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/30">
                      Ingestion
                    </div>
                    <div
                      className="mt-3 text-4xl font-semibold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      $0.01
                    </div>
                    <div className="mt-2 text-sm text-white/40">
                      per 500 tokens written into memory
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/30">
                      Retrieval
                    </div>
                    <div
                      className="mt-3 text-4xl font-semibold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      $0.001
                    </div>
                    <div className="mt-2 text-sm text-white/40">
                      per query during memory recall
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[24px] border border-white/8 bg-white/[0.018] px-5 py-4 text-sm leading-relaxed text-white/35">
                  Price memory usage like infrastructure, not like guesswork.
                </div>
              </div>
            </motion.div>
          </RevealSection>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <RevealSection delay={0.22}>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-[24px] border px-6 py-5"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/28">
                Tenant Isolation
              </div>
              <div className="mt-3 text-sm leading-relaxed text-white/40">
                Separate memory cleanly across teams, customers, and agents
                without collapsing everything into one shared context pool.
              </div>
            </motion.div>
          </RevealSection>

          <RevealSection delay={0.28}>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-[24px] border px-6 py-5"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/28">
                Auditable Memory Lifecycle
              </div>
              <div className="mt-3 text-sm leading-relaxed text-white/40">
                Keep a reliable record of what entered memory, who touched it,
                and how it changed over time in production systems.
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
