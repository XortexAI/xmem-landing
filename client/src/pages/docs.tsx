import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/sections/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Database,
  Download,
  GitBranch,
  Key,
  Layers,
  Puzzle,
  ScanSearch,
  Server,
  Terminal,
} from "lucide-react";

const extensionDemoUrl =
  "https://github.com/user-attachments/assets/8e3349ab-63c9-4046-821d-ca8097948440";
const extensionSetupUrl =
  "https://github.com/user-attachments/assets/72bf4e7d-2308-43ec-8da8-343f3293ac3a";

const endpoints = [
  {
    method: "POST",
    color: "text-green-300 bg-green-400/10",
    path: "/v1/memory/ingest",
    text: "Save conversation turns, facts, summaries, snippets, or other memory events.",
    body: `{
  "user_query": "I prefer React with TypeScript.",
  "agent_response": "Noted. I'll use React and TS going forward.",
  "user_id": "dev_42"
}`,
  },
  {
    method: "POST",
    color: "text-blue-300 bg-blue-400/10",
    path: "/v1/memory/retrieve",
    text: "Ask a natural-language question and receive a synthesized answer from stored memory.",
    body: `{
  "query": "What frontend stack did I say I preferred?",
  "user_id": "dev_42",
  "top_k": 5
}`,
  },
  {
    method: "POST",
    color: "text-purple-300 bg-purple-400/10",
    path: "/v1/memory/search",
    text: "Run semantic search across domains such as profile, temporal, summary, code, and snippet.",
    body: `{
  "query": "backend architecture decisions",
  "domains": ["profile", "summary"],
  "user_id": "dev_42"
}`,
  },
  {
    method: "POST",
    color: "text-cyan-300 bg-cyan-400/10",
    path: "/v1/scanner/scan",
    text: "Index a GitHub repository into the code graph and searchable code memory.",
    body: `{
  "github_url": "https://github.com/organization/repo",
  "branch": "main",
  "visibility": "private"
}`,
  },
];

const domains = [
  ["Profile", "Permanent user facts, preferences, traits, and identity."],
  ["Temporal", "Time-anchored events with date resolution and updates."],
  ["Summary", "Compressed conversation takeaways and session context."],
  ["Code", "Symbols, files, annotations, repo relationships, and code queries."],
  ["Snippet", "Reusable code patterns, personal utilities, and examples."],
  ["Image", "Visual observations and descriptions stored as memory."],
];

export default function DocsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(`Authorization: Bearer ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <Navbar />

      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-32 md:py-40">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 border-b border-white/10 pb-10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70">
            <BookOpen className="h-3.5 w-3.5" />
            Documentation
          </div>
          <h1
            className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}
          >
            Build persistent memory into agents, copilots, and AI workflows.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/55">
            XMem captures memory events, classifies them by domain, keeps them clean with a Judge-before-write pipeline, and retrieves the right context when your app needs it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#quickstart" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black">
              Quickstart
            </a>
            <a href="/xmem-extension-dist.zip" className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.08]">
              <Download className="h-4 w-4" />
              Download extension
            </a>
          </div>
        </motion.header>

        <section id="quickstart" className="mb-16 scroll-mt-28">
          <div className="mb-6 flex items-center gap-3">
            <Terminal className="h-5 w-5 text-white/65" />
            <h2 className="text-2xl font-semibold">Quickstart</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1. Start server", "Install the Python package, configure .env, then run the FastAPI app on port 8000."],
              ["2. Add memory", "Use the API or SDK to ingest conversation turns with a stable user_id."],
              ["3. Retrieve context", "Call retrieve or search before the agent answers so it can use persistent memory."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">{title}</div>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-white/10 bg-black/50 p-5">
            <pre className="overflow-x-auto text-sm leading-relaxed text-white/70">
{`pip install -e .
cp .env.example .env
uvicorn src.api.app:create_app --factory --host 0.0.0.0 --port 8000`}
            </pre>
          </div>
        </section>

        <section id="api" className="mb-16 scroll-mt-28">
          <div className="mb-6 flex items-center gap-3">
            <Key className="h-5 w-5 text-white/65" />
            <h2 className="text-2xl font-semibold">API Reference</h2>
          </div>

          <div className="mb-5 rounded-md border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm leading-relaxed text-white/55">
              Authenticate API calls with a Bearer token.
              {isAuthenticated ? " You are signed in, so your current header is shown below." : (
                <span> <Link href="/login" className="text-white hover:underline">Log in</Link> to view and manage keys.</span>
              )}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/50 px-4 py-3">
              <code className="min-w-0 truncate text-sm text-cyan-200">
                Authorization: Bearer {isAuthenticated ? `${token?.substring(0, 24)}...` : "<your-api-key>"}
              </code>
              {isAuthenticated && (
                <button
                  onClick={copyToClipboard}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-white/70 hover:bg-white/[0.08]"
                  title="Copy full header"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
            </div>
            {isAuthenticated && user?.username && (
              <div className="mt-3 text-xs text-white/45">
                Active username: <span className="font-mono text-white/70">{user.username}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div key={endpoint.path} className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className={`rounded px-2.5 py-1 text-xs font-bold ${endpoint.color}`}>{endpoint.method}</span>
                  <code className="text-sm text-white/90 md:text-base">{endpoint.path}</code>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-white/55">{endpoint.text}</p>
                <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/50 p-4 text-xs leading-relaxed text-white/65">
{endpoint.body}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section id="architecture" className="mb-16 scroll-mt-28">
          <div className="mb-6 flex items-center gap-3">
            <Layers className="h-5 w-5 text-white/65" />
            <h2 className="text-2xl font-semibold">Architecture</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-5">
              <Server className="mb-4 h-5 w-5 text-white/65" />
              <div className="text-sm font-semibold text-white">Agentic ingestion</div>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Input moves through Classifier, parallel domain agents, Judge, and Weaver. The Judge decides add, update, delete, or skip before storage is touched.
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-5">
              <Database className="mb-4 h-5 w-5 text-white/65" />
              <div className="text-sm font-semibold text-white">Purpose-built storage</div>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Pinecone handles vector similarity, Neo4j handles temporal and graph relationships, and MongoDB stores scanned code documents and metadata.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {domains.map(([name, text]) => (
              <div key={name} className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="text-sm font-semibold text-white">{name}</div>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="scanner" className="mb-16 scroll-mt-28">
          <div className="mb-6 flex items-center gap-3">
            <ScanSearch className="h-5 w-5 text-white/65" />
            <h2 className="text-2xl font-semibold">Scanner and Code Memory</h2>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm leading-relaxed text-white/55">
              The scanner indexes Python, TypeScript, and JavaScript repositories with deterministic AST parsing. It extracts files, functions, classes, imports, call relationships, and code annotations, then lets you query that codebase from the Scanner page.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/scanner" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black">
                Open Scanner
                <GitBranch className="h-4 w-4" />
              </Link>
              <a href="#api" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 hover:bg-white/[0.08]">
                Scanner endpoints
              </a>
            </div>
          </div>
        </section>

        <section id="extension" className="scroll-mt-28">
          <div className="mb-6 flex items-center gap-3">
            <Puzzle className="h-5 w-5 text-white/65" />
            <h2 className="text-2xl font-semibold">Chrome Extension</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm leading-relaxed text-white/55">
                XMem watches supported AI chat inputs, searches memory while you type, shows inline ghost suggestions, and can auto-save outgoing messages. It supports ChatGPT, Claude, Gemini, Perplexity, DeepSeek, and standard text inputs.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[
                  "Download xmem-extension-dist.zip and unzip it.",
                  "Open chrome://extensions and enable Developer mode.",
                  "Click Load unpacked and select the dist folder.",
                  "Open the XMem icon, set API URL, API key, and User ID, then Test.",
                ].map((step, index) => (
                  <div key={step} className="rounded-md border border-white/10 bg-black/35 p-4 text-sm text-white/55">
                    <span className="mr-2 text-white/80">{index + 1}.</span>
                    {step}
                  </div>
                ))}
              </div>
              <a
                href="/xmem-extension-dist.zip"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                <Download className="h-4 w-4" />
                Download dist package
              </a>
            </div>
            <div className="space-y-4">
              <div className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="mb-3 text-sm font-semibold text-white">Demo</div>
                <video className="aspect-video w-full rounded-md bg-black" src={extensionDemoUrl} controls preload="metadata" />
              </div>
              <div className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="mb-3 text-sm font-semibold text-white">Setup</div>
                <video className="aspect-video w-full rounded-md bg-black" src={extensionSetupUrl} controls preload="metadata" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
