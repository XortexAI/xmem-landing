import { motion } from "framer-motion";
import { Code2, Terminal, Puzzle, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { RevealSection } from "../components/shared/RevealSection";

const connectors = [
  {
    id: "opencode",
    icon: Code2,
    title: "OpenCode",
    description: "Persistent memory for OpenCode coding agents. Auto-recall, keyword detection, and session compaction.",
    href: "/docs#opencode",
    cta: "Install plugin",
    accent: "from-emerald-500/20 to-cyan-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "mcp",
    icon: Terminal,
    title: "MCP Server",
    description: "Connect Claude Desktop, ChatGPT, and other MCP clients to your XMem memory.",
    href: "/auth/mcp",
    cta: "Connect MCP",
    accent: "from-blue-500/20 to-purple-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "extension",
    icon: Puzzle,
    title: "Chrome Extension",
    description: "Inline memory suggestions and auto-save across ChatGPT, Claude, Gemini, and more.",
    href: "/docs#extension",
    cta: "Get extension",
    accent: "from-orange-500/20 to-pink-500/20",
    iconColor: "text-orange-400",
  },
  {
    id: "sdk",
    icon: BookOpen,
    title: "SDK & API",
    description: "TypeScript, Python SDKs, and REST API for building memory into your own agents.",
    href: "/docs#api",
    cta: "View docs",
    accent: "from-violet-500/20 to-indigo-500/20",
    iconColor: "text-violet-400",
  },
];

export function ConnectorsSection() {
  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Integrations
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: "#fafafa" }}
          >
            Connect XMem Everywhere
          </h2>
          <p className="text-lg text-white/45 max-w-2xl mx-auto">
            Plug persistent memory into your coding agents, chat tools, and custom applications.
          </p>
        </RevealSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {connectors.map((connector, index) => (
            <motion.div
              key={connector.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <Link href={connector.href}>
                <div
                  className="group h-full rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-white/20"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${connector.accent} mb-5`}
                  >
                    <connector.icon className={`h-6 w-6 ${connector.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {connector.title}
                  </h3>
                  <p className="text-sm text-white/45 leading-relaxed mb-5">
                    {connector.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors">
                    {connector.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <RevealSection className="mt-12 text-center">
          <p className="text-sm text-white/35">
            OpenCode users can also{" "}
            <Link href="/auth/connect?client=opencode" className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-2">
              re-authenticate manually
            </Link>
          </p>
        </RevealSection>
      </div>
    </section>
  );
}
