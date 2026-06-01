import { Link } from "wouter";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";

const agentLogos = ["Claude", "Gemini", "Perplexity", "DeepSeek", "Cursor"];

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

const benchmarkSets = [
  {
    eyebrow: "Long-term recall",
    name: "LongMemEval-S",
    score: "94.2",
    summary:
      "Measures whether memory stays useful across user, assistant, preference, temporal, and multi-session tasks.",
    rows: [
      ["Single-Session User", 97.1, "Peer range 68.5-97.1"],
      ["Single-Session Assistant", 90, "Backboard 98.2"],
      ["Single-Session Preference", 100, "+10 vs top peer"],
      ["Knowledge Update", 88.4, "Membase 93.6"],
      ["Temporal Reasoning", 100, "+8.3 vs top peer"],
      ["Multi-Session", 100, "+8.3 vs top peer"],
    ],
  },
  {
    eyebrow: "Conversational memory",
    name: "LoCoMo",
    score: "93.0",
    summary:
      "Tests single-hop, multi-hop, temporal, and open-domain recall when answers depend on prior context.",
    rows: [
      ["Single Hop", 90.6, "+1.2 vs top peer"],
      ["Multi-Hop", 92.3, "+17.3 vs top peer"],
      ["Temporal", 91.9, "Tied top peer"],
      ["Open Domain", 91.2, "Membase 95.2"],
    ],
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    summary: "For builders validating memory workflows.",
    note: "30 days of core platform access",
    cta: "Start free",
    href: "/scanner",
    features: [
      "Full XMem dashboard access",
      "Chrome extension included",
      "MCP server access included",
      "Python and TypeScript integration docs",
      "No credit card required",
    ],
  },
  {
    name: "Pro",
    price: "$1",
    summary: "For builders moving memory into production.",
    note: "Then pay as you go",
    cta: "Get Pro",
    href: "/scanner",
    featured: true,
    features: [
      "Everything in Free",
      "Production-ready API access",
      "Pay-as-you-go usage for higher volume",
      "Priority access to new connectors",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    summary: "For teams with security, scale, and deployment requirements.",
    note: "Custom usage and procurement",
    cta: "Talk to sales",
    href: "mailto:xmemlabs@gmail.com?subject=XMem%20Enterprise",
    features: [
      "Everything in Pro",
      "Custom usage limits",
      "Security and procurement support",
      "Dedicated onboarding",
      "Air-gapped self-hosting",
      "Custom contracts and DPA",
    ],
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex rounded-sm border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
      {children}
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 xmem-grid opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(50,205,115,0.22),transparent_28%),linear-gradient(180deg,#050805_0%,#050805_58%,#021008_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#020503] via-[#020503]/70 to-transparent" />
      <div className="absolute bottom-0 left-1/2 h-[360px] w-[130vw] -translate-x-1/2 origin-bottom skew-x-[-8deg] bg-[radial-gradient(circle,rgba(38,255,135,0.38)_1px,transparent_1.7px)] bg-[length:16px_16px] opacity-60 [mask-image:linear-gradient(to_top,black,transparent_88%)]" />
      <div className="absolute bottom-0 left-1/2 h-[360px] w-[130vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(38,255,135,0.20),transparent_62%)]" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-[#050805] px-5 pb-12 pt-28 text-white sm:px-8">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <div className="mb-6 inline-flex rounded-full border border-[#2bdc7a]/30 bg-[#2bdc7a]/10 px-3 py-1 text-xs font-semibold text-[#7dffad] shadow-[0_0_36px_rgba(43,220,122,0.18)]">
          Memory as a Service
        </div>

        <h1 className="w-full max-w-5xl break-words font-display text-5xl font-semibold leading-[0.96] text-white sm:text-7xl lg:text-8xl">
          Persistent memory
          <span className="block">
            for <span className="bg-gradient-to-r from-[#75e4ac] via-[#32d27f] to-[#b8ff65] bg-clip-text text-transparent">AI agents.</span>
          </span>
        </h1>

        <p className="mt-6 max-w-[21rem] text-sm leading-7 text-white/[0.62] sm:max-w-3xl sm:text-lg sm:leading-8">
          XMem captures decisions, preferences, code context, and source-backed facts so agents can recover the right context without asking teams to repeat themselves.
        </p>

        <div className="mt-9 flex w-full max-w-[19rem] flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link
            href="/scanner"
            data-testid="button-start-building"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.12)] transition hover:bg-[#d9ff9b] sm:w-auto"
          >
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            data-testid="button-read-docs"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-black/50 px-5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
          >
            Read docs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 inline-flex max-w-full items-center gap-3 rounded-md border border-white/20 bg-black/[0.55] px-4 py-3 font-mono text-sm text-white/80 shadow-2xl shadow-black/40 backdrop-blur-md">
          <span className="text-white/40">$</span>
          <span>npx create-xmem@latest</span>
          <span className="ml-2 rounded-sm border border-white/10 px-1.5 py-0.5 text-xs text-white/40">copy</span>
        </div>

        <div className="mt-12 flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-white/[0.42] sm:text-base">
          {agentLogos.map((name) => (
            <span key={name} className="tracking-tight transition hover:text-white/70">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenchmarkSection() {
  const activeBenchmark = benchmarkSets[0];

  return (
    <section id="benchmarks" className="relative overflow-hidden bg-[#050805] px-5 py-24 text-white sm:px-8">
      <div className="absolute inset-0 xmem-grid opacity-25" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_50%_0%,rgba(43,220,122,0.16),transparent_55%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            Proof, not promises.
          </h2>
          <div className="mx-auto mt-5 h-2 w-2 rounded-full bg-[#2bdc7a] shadow-[0_0_28px_rgba(43,220,122,0.8)]" />
        </div>

        <div className="mt-12 grid gap-5 rounded-lg border border-[#1f6f42]/45 bg-[#061009]/80 p-4 shadow-2xl shadow-black/50 backdrop-blur-md lg:grid-cols-[280px_1fr] lg:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {benchmarkSets.map((benchmark) => (
              <div
                key={benchmark.name}
                className={`rounded-md border p-5 ${benchmark.name === activeBenchmark.name ? "border-[#24d46f]/45 bg-[#112319]" : "border-white/10 bg-white/[0.035]"}`}
              >
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.42]">{benchmark.eyebrow}</div>
                <div className="mt-3 font-display text-2xl font-semibold text-white/[0.78]">{benchmark.name}</div>
                <div className="mt-2 font-display text-6xl font-semibold leading-none text-[#18b956]">{benchmark.score}</div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-[#061008]">
            <div className="grid gap-5 border-b border-white/10 p-5 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.42]">{activeBenchmark.eyebrow}</div>
                <h3 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{activeBenchmark.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/[0.56]">{activeBenchmark.summary}</p>
              </div>
              <div className="text-left md:text-right">
                <div className="font-display text-6xl font-semibold leading-none text-[#18b956]">{activeBenchmark.score}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/[0.46]">average score</div>
              </div>
            </div>

            <div className="space-y-1 p-5">
              <div className="mb-5 flex flex-wrap gap-4 text-xs text-white/45">
                {["Zep", "Membase", "Supermemory", "Backboard"].map((peer) => (
                  <span key={peer} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#18b956]" />
                    {peer}
                  </span>
                ))}
              </div>

              {activeBenchmark.rows.map(([label, value, note]) => (
                <div key={label} className="grid gap-3 border-t border-white/[0.06] py-3 text-sm md:grid-cols-[190px_48px_1fr_170px] md:items-center">
                  <div className="font-semibold text-white/[0.74]">{label}</div>
                  <div className="font-mono text-xs text-[#2bdc7a]">{value}</div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0d6c35] to-[#39e17e] shadow-[0_0_18px_rgba(43,220,122,0.42)]" style={{ width: `${value}%` }} />
                  </div>
                  <div className="text-xs leading-5 text-white/[0.48]">{note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-[#050805] px-5 py-24 text-white sm:px-8">
      <div className="absolute inset-0 xmem-grid opacity-20" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_50%_0%,rgba(43,220,122,0.18),transparent_58%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            Start free.
            <span className="block bg-gradient-to-r from-[#9beec5] via-[#2bdc7a] to-[#9ff46a] bg-clip-text text-transparent">
              $1 when you go live.
            </span>
          </h2>
          <div className="mx-auto mt-6 h-2 w-2 rounded-full bg-[#2bdc7a] shadow-[0_0_28px_rgba(43,220,122,0.8)]" />
        </div>

        <div className="mt-12 grid overflow-hidden rounded-lg border border-[#1f6f42]/45 bg-[#061009]/80 shadow-2xl shadow-black/50 backdrop-blur-md lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex min-h-[520px] flex-col border-b border-white/10 p-6 last:border-b-0 lg:border-b-0 lg:border-r last:lg:border-r-0 ${plan.featured ? "bg-[#0b1f13] shadow-[inset_0_2px_0_#41ee8b]" : "bg-black/10"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 min-h-[42px] text-sm leading-6 text-white/[0.52]">{plan.summary}</p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full bg-[#2bdc7a]/15 px-3 py-1 text-xs font-semibold text-[#7dffad]">Recommended</span>
                ) : null}
              </div>

              <div className="mt-10 font-display text-6xl font-semibold leading-none">{plan.price}</div>
              <div className="mt-5 text-sm font-semibold text-white">{plan.note}</div>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-white/[0.58]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-[#2bdc7a]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {plan.href.startsWith("/") ? (
                  <Link
                    href={plan.href}
                    className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition ${plan.featured ? "bg-[#2bdc7a] text-black hover:bg-[#7dffad]" : "border border-white/15 bg-black/30 text-white hover:border-white/25 hover:bg-white/[0.07]"}`}
                  >
                    {plan.cta}
                    {plan.featured ? <ArrowRight className="h-4 w-4" /> : null}
                  </Link>
                ) : (
                  <a
                    href={plan.href}
                    className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/15 bg-black/30 px-5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.07]"
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
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
        <BenchmarkSection />
        <PricingSection />
        <PrimitiveSection />
        <StackComparisonSection />
        <DemoSection />
        <DeveloperSection />
        <SecuritySection />
      </main>
      <Footer />
    </div>
  );
}
