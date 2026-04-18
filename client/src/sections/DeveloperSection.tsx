import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Terminal, Zap } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

export function DeveloperSection() {
  const [activeTab, setActiveTab] = useState<"sdk" | "cli" | "rest">("sdk");

  const code = {
    sdk: `import { Xmem } from "@xmem/sdk";

const memory = new Xmem({
  projectId: "proj_xyz",
  apiKey: process.env.XMEM_KEY,
});

// Store a memory
await memory.remember({
  content: "User prefers TypeScript over JavaScript",
  tags: ["preferences", "language"],
  agentId: "agent-001",
});

// Recall with semantic search
const recalled = await memory.recall({
  query: "programming language preferences",
  limit: 5,
  agentId: "agent-001",
});`,
    cli: `# Install the CLI
npm install -g @xmem/cli

# Authenticate
xmem auth login

# Create a new memory space
xmem spaces create --name "prod-agents"

# Inspect memory events
xmem memories list \\
  --agent agent-001 \\
  --since 24h \\
  --format json

# Export memory snapshot
xmem export --space prod-agents \\
  --output ./memory-backup.json`,
    rest: `# Store a memory event
curl -X POST https://api.xmem.dev/v1/memories \\
  -H "Authorization: Bearer $XMEM_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Completed task: refactor auth module",
    "type": "episodic",
    "agentId": "agent-001",
    "confidence": 0.99,
    "tags": ["task", "completion"]
  }'

# Semantic recall
curl "https://api.xmem.dev/v1/recall?q=auth+refactor" \\
  -H "Authorization: Bearer $XMEM_KEY"`,
  };

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Developer Experience
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Zero friction.
            <br />
            <span className="text-white/30">Maximum power.</span>
          </h2>
          <p className="text-xl text-white/40 max-w-xl mx-auto">
            From local prototype to production in minutes, not days.
          </p>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="flex items-center gap-0 px-6 pt-5 pb-0"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mr-6">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              {(["sdk", "cli", "rest"] as const).map((tab) => (
                <button
                  key={tab}
                  data-testid={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-widest transition-all duration-200 border-b-2 ${activeTab === tab ? "text-white border-white" : "text-white/30 border-transparent"}`}
                >
                  {tab === "sdk"
                    ? "TypeScript SDK"
                    : tab === "cli"
                      ? "CLI"
                      : "REST API"}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-8"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <pre
                className="text-sm text-white/70 leading-loose overflow-x-auto"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <code>{code[activeTab]}</code>
              </pre>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              {
                icon: Code2,
                title: "3 SDKs",
                desc: "TypeScript, Python, Go",
              },
              {
                icon: Terminal,
                title: "Extension",
                desc: "Full control from the Extension",
              },
              {
                icon: Zap,
                title: "REST",
                desc: "Works with any language or runtime",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 p-5 rounded-xl transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <f.icon className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {f.title}
                  </div>
                  <div className="text-white/40 text-xs">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
