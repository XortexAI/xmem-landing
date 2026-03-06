import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Activity, Server } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

export function EnterpriseSection() {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      desc: "AES-256 encryption at rest and in transit. Your memory data is cryptographically protected.",
    },
    {
      icon: Shield,
      title: "Access Control",
      desc: "Granular RBAC with namespace isolation. Define exactly who can read and write which memories.",
    },
    {
      icon: Server,
      title: "Memory Namespaces",
      desc: "Tenant isolation with namespace-level partitioning for multi-tenant deployments.",
    },
    {
      icon: FileText,
      title: "Audit Trails",
      desc: "Immutable audit logs for every memory operation. Full compliance and forensic capability.",
    },
    {
      icon: Eye,
      title: "Observability",
      desc: "Real-time metrics, traces, and dashboards. Full visibility into memory retrieval patterns.",
    },
    {
      icon: Activity,
      title: "SLA Monitoring",
      desc: "99.99% uptime SLA with automated failover, geo-replication, and disaster recovery.",
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
            Enterprise Ready
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Built for production.
            <br />
            <span className="text-white/30">Not prototypes.</span>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                }}
                className="p-8 rounded-xl transition-all duration-300 h-full"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <f.icon className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
