import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";

const primitives = [
  {
    eyebrow: "01",
    title: "Persistent Memory",
    copy: "Store preferences, project context, decisions, snippets, and temporal events as durable memory objects.",
  },
  {
    eyebrow: "02",
    title: "Judge Before Write",
    copy: "Classify, merge, contradict, and promote memories before they pollute your agent context.",
  },
  {
    eyebrow: "03",
    title: "Codebase Scanner",
    copy: "Index repositories into queryable code memory so assistants answer with source-aware context.",
  },
  {
    eyebrow: "04",
    title: "Context Importer",
    copy: "Turn shared AI chats, notes, and long conversations into reusable memory for every next session.",
  },
  {
    eyebrow: "05",
    title: "MCP Ready",
    copy: "Bring memory into Claude, Cursor, Codex, OpenCode, browser workflows, and custom agent runtimes.",
  },
  {
    eyebrow: "06",
    title: "Memory Domains",
    copy: "Profile, temporal, summary, code, and snippet domains keep retrieval precise instead of mushy.",
  },
];

const stackRows = [
  ["State", "Threads, users, tools, and handoffs persist without manual session plumbing."],
  ["Memory", "Facts evolve as users and projects change, with stale context retired instead of repeated."],
  ["Retrieval", "Hybrid recall gives agents the right memory object, not a random chunk dump."],
  ["Connectors", "Browser extension, MCP clients, imports, and scanner routes feed one memory plane."],
  ["Control", "Developers can inspect, edit, route, and govern what an agent is allowed to remember."],
];

const oldStack = [
  "Vector DB for chunks",
  "Redis for session state",
  "Custom prompt stuffing",
  "Separate browser extension",
  "Manual contradiction logic",
  "No shared agent profile",
];

const newStack = [
  "One API for ingest and recall",
  "Memory domains built in",
  "Judge-before-write pipeline",
  "Code and chat importers",
  "MCP and extension surface",
  "Queryable profile layer",
];

const useCases = [
  {
    title: "Coding agents",
    copy: "Remember repo architecture, implementation decisions, TODOs, and the user's preferred review style.",
  },
  {
    title: "Research assistants",
    copy: "Carry source trails, entities, claims, and open questions across long-running investigations.",
  },
  {
    title: "Support copilots",
    copy: "Recall customer preferences, account state, prior resolutions, and unresolved blockers.",
  },
  {
    title: "Personal AI stacks",
    copy: "Share a coherent memory across ChatGPT, Claude, Cursor, Codex, and your own tools.",
  },
];

const metrics = [
  ["5", "memory domains"],
  ["1", "shared context plane"],
  ["MCP", "agent interface"],
  ["OSS", "developer owned"],
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex rounded-sm border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
      {children}
    </div>
  );
}

function HeroMemoryMap() {
  const memoryLines = [
    ["profile", "Prefers terse PR notes and direct implementation."],
    ["code", "Scanner route uses repository-aware retrieval."],
    ["temporal", "Deprecate stale onboarding steps after release."],
    ["summary", "Current project: landing-page polish for merge."],
  ];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 xmem-grid opacity-45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(184,255,101,0.18),transparent_31%),linear-gradient(180deg,rgba(5,5,5,0.24),#050505_86%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#050505] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050505] to-transparent" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[45%] hidden w-[min(92vw,1050px)] -translate-x-1/2 -translate-y-1/2 opacity-80 lg:block"
      >
        <div className="grid grid-cols-[0.9fr_1.2fr_0.9fr] gap-4">
          <div className="space-y-4 pt-16">
            <div className="rounded-md border border-white/10 bg-black/45 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.18em] text-white/[0.35]">ingest</div>
              <div className="mt-4 space-y-3">
                {["repo scan", "chat import", "browser note"].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-sm text-white/[0.65]">
                    <span>{item}</span>
                    <span className="text-[#b8ff65]/80">queued</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-10 h-px bg-gradient-to-r from-transparent via-[#b8ff65]/40 to-transparent" />
          </div>

          <div className="rounded-md border border-[#b8ff65]/25 bg-[#070907]/70 p-5 shadow-2xl shadow-black/50 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs uppercase tracking-[0.18em] text-white/[0.35]">
              <span>memory plane</span>
              <span className="text-[#b8ff65]">live</span>
            </div>
            <div className="mt-5 space-y-3">
              {memoryLines.map(([domain, copy]) => (
                <div key={domain} className="grid grid-cols-[84px_1fr] gap-4 rounded-sm border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm">
                  <span className="font-mono text-[#b8ff65]/80">{domain}</span>
                  <span className="text-white/[0.68]">{copy}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs uppercase tracking-[0.14em] text-white/[0.38]">
              <div className="rounded-sm border border-white/[0.08] bg-black/[0.35] py-3">judge</div>
              <div className="rounded-sm border border-white/[0.08] bg-black/[0.35] py-3">merge</div>
              <div className="rounded-sm border border-white/[0.08] bg-black/[0.35] py-3">recall</div>
            </div>
          </div>

          <div className="space-y-4 pt-24">
            <div className="mr-10 h-px bg-gradient-to-r from-transparent via-[#3dd8ff]/[0.35] to-transparent" />
            <div className="rounded-md border border-white/10 bg-black/45 p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.18em] text-white/[0.35]">serve</div>
              <div className="mt-4 space-y-3 text-sm text-white/[0.65]">
                <div className="rounded-sm bg-white/[0.04] px-3 py-2">Codex</div>
                <div className="rounded-sm bg-white/[0.04] px-3 py-2">Cursor</div>
                <div className="rounded-sm bg-white/[0.04] px-3 py-2">Claude via MCP</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-[#050505] px-5 pb-16 pt-28 text-white sm:px-8">
      <HeroMemoryMap />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <div
          className="mb-5 inline-flex max-w-[18rem] rounded-sm border border-[#b8ff65]/25 bg-[#b8ff65]/10 px-3 py-1.5 text-center text-sm font-medium leading-5 text-[#dfffaa] sm:max-w-none"
        >
          Open-source memory infrastructure for agents
        </div>

        <h1
          className="w-full max-w-5xl break-words font-display font-semibold leading-none text-white"
        >
          <span className="block text-4xl sm:text-7xl lg:text-8xl">XMem</span>
          <span className="mx-auto mt-3 block max-w-[10ch] text-4xl text-white/[0.62] sm:max-w-none sm:text-6xl lg:text-7xl">
            memory that follows every agent.
          </span>
        </h1>

        <p
          className="mt-6 max-w-[18rem] text-sm leading-7 text-white/70 sm:max-w-3xl sm:text-lg sm:leading-8"
        >
          A unified memory plane for LLM apps, coding agents, MCP clients, and browser workflows. XMem stores the durable context, judges what should change, and retrieves the exact memory your agent needs next.
        </p>

        <div
          className="mt-9 flex w-full max-w-[18rem] flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row"
        >
          <Link
            href="/scanner"
            data-testid="button-start-building"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#b8ff65] px-5 text-sm font-semibold text-black transition hover:bg-[#d9ff9b] sm:w-auto"
          >
            Start building
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            data-testid="button-read-docs"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
          >
            Read docs
            <ChevronRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/XortexAI/Xmem"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-black/40 px-5 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:text-white sm:w-auto"
          >
            View GitHub
          </a>
        </div>

        <div
          className="mt-10 w-full max-w-[18rem] overflow-hidden rounded-md border border-white/15 bg-black/70 text-left shadow-2xl shadow-black/50 backdrop-blur-md sm:max-w-3xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/45">
            <span>quickstart.ts</span>
            <span>memory.create</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-7 text-white/80 sm:whitespace-pre">
            <code>{`import { XMem } from "@xmem/sdk";

const memory = new XMem({ apiKey: process.env.XMEM_API_KEY });

await memory.remember({
  user: "ishaan",
  domain: "code",
  text: "The scanner route uses repository-aware retrieval."
});

const context = await memory.recall("What should Codex know before editing?");`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function MetricsBand() {
  return (
    <section className="border-y border-white/10 bg-[#0b0d0c] px-5 py-6 sm:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-4">
        {metrics.map(([value, label]) => (
          <div key={label} className="bg-[#090a09] p-5">
            <div className="font-display text-3xl font-semibold text-white">{value}</div>
            <div className="mt-1 text-sm text-white/50">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrimitiveSection() {
  return (
    <section id="stack" className="bg-[#f5f1e8] px-5 py-24 text-[#111] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-black/60">
              Product primitives
            </div>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Memory should be infrastructure, not a prompt hack.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-black/60 lg:justify-self-end">
            XMem gives builders the pieces they usually stitch together themselves: ingest sources, judge updates, store durable facts, retrieve the right context, and share it across every agent surface.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-black/10 bg-black/10 md:grid-cols-2 xl:grid-cols-3">
          {primitives.map(({ eyebrow, title, copy }) => (
            <article key={title} className="group bg-[#fbf8f0] p-6 transition hover:bg-white">
              <div className="mb-9 flex items-start justify-between gap-4">
                <div className="text-sm font-semibold text-black/35">{eyebrow}</div>
                <div className="mt-2 h-px w-16 bg-black/15 transition group-hover:bg-black/30" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-black/60">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackComparisonSection() {
  return (
    <section id="architecture" className="bg-[#050505] px-5 py-24 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionLabel>Unified API</SectionLabel>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Replace the context glue with one memory control plane.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/60">
              Most teams wire together state, RAG, memory, tools, and browser context by hand. XMem turns those moving pieces into one inspectable graph with one API.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold">DIY memory stack</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-[#ff6b4a]">before</span>
              </div>
              <div className="space-y-3">
                {oldStack.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-sm border border-white/10 bg-black/30 p-3 text-sm text-white/55">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b4a]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-[#b8ff65]/25 bg-[#b8ff65]/[0.055] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold">XMem plane</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-[#b8ff65]">after</span>
              </div>
              <div className="space-y-3">
                {newStack.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-sm border border-[#b8ff65]/15 bg-black/30 p-3 text-sm text-white/70">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8ff65]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a]">
          <div className="grid gap-px bg-white/10 md:grid-cols-5">
            {stackRows.map(([label, copy], index) => (
              <div key={label} className="bg-[#080808] p-5">
                <div className="mb-4 font-mono text-sm text-[#3dd8ff]/80">{String(index + 1).padStart(2, "0")}</div>
                <h4 className="font-display text-xl font-semibold">{label}</h4>
                <p className="mt-3 text-sm leading-7 text-white/55">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="bg-[#10130f] px-5 py-24 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionLabel>Builder workflow</SectionLabel>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Import context once. Reuse it everywhere.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/60">
              Scan a repo, import conversations, attach MCP, and hand the next agent a clean memory bundle instead of a pasted wall of text.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["scan", "Index a repository"],
                ["remember", "Promote durable facts"],
                ["recall", "Retrieve current context"],
                ["handoff", "Share it with the next agent"],
              ].map(([cmd, copy]) => (
                <div key={cmd} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="font-mono text-sm text-[#b8ff65]">xmem {cmd}</div>
                  <p className="mt-2 text-sm text-white/55">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-white/15 bg-black shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/45">
              <span>XMem browser extension</span>
              <span>live asset</span>
            </div>
            <video
              className="aspect-video w-full bg-black object-cover"
              src="/Xmem.mp4"
              controls
              muted
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DeveloperSection() {
  return (
    <section id="developers" className="bg-[#f5f1e8] px-5 py-24 text-black sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-black/60">
              Developer surface
            </div>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              A memory layer developers can reason about.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/60">
              Work with concrete surfaces: commands, memory objects, domains, routing rules, and inspection tools that make agent context auditable.
            </p>
          </div>

          <div className="rounded-md border border-black/10 bg-[#111] text-white">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-white/45">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b4a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f7d56d]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#b8ff65]" />
              <span className="ml-auto">memory.json</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words p-5 font-mono text-sm leading-7 text-white/80 sm:whitespace-pre">
              <code>{`{
  "domain": "profile",
  "confidence": 0.92,
  "source": "context-importer",
  "memory": {
    "fact": "Prefers concise PR summaries.",
    "scope": "developer_workflow",
    "expires": null
  },
  "judge": "merge_with_existing"
}`}</code>
            </pre>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-black/10 bg-black/10 md:grid-cols-4">
          {useCases.map(({ title, copy }, index) => (
            <article key={title} className="bg-[#fbf8f0] p-6">
              <div className="mb-8 font-mono text-sm text-[#236b4a]">{String(index + 1).padStart(2, "0")}</div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-black/60">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="bg-[#050505] px-5 py-24 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <SectionLabel>Control</SectionLabel>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Memory is powerful only when teams can govern it.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/60">
            XMem keeps ownership with developers through open-source infrastructure, inspectable objects, domain routing, and structure that prevents agents from carrying the wrong context forever.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Open source", "Own the memory pipeline and deploy where your users need it."],
            ["Inspectable", "Search, edit, and reason about memory objects instead of hidden state."],
            ["Portable", "Use the same context across agents, tools, and model providers."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-md border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-8 h-px w-14 bg-[#f7d56d]/60" />
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-[#b8ff65] px-5 py-20 text-black sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Stop resetting your agents to zero.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-black/70">
            Give your next coding assistant, support bot, or research agent a memory layer it can carry across sessions.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/scanner"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/85"
          >
            Start building
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-black/20 bg-transparent px-5 text-sm font-semibold text-black transition hover:bg-black/10"
          >
            Read docs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main>
        <HeroSection />
        <MetricsBand />
        <PrimitiveSection />
        <StackComparisonSection />
        <DemoSection />
        <DeveloperSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
