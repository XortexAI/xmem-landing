import { Link } from "wouter";
import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";
import {
  PRO_MONTHLY_CREDITS,
  detectBillingRegion,
  formatRegionalProPrice,
} from "@/lib/billing";

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
    price: "Rs 99",
    summary: "For builders moving memory into production.",
    note: "per month",
    cta: "Get Pro",
    href: "/scanner",
    featured: true,
    features: [
      "Everything in Free",
      "5,000 monthly Pro credits included",
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
      <div className="absolute inset-0 xmem-grid opacity-45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(184,255,101,0.17),transparent_30%),linear-gradient(180deg,#050505_0%,#050505_58%,#071008_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
      <div className="absolute bottom-0 left-1/2 h-[360px] w-[130vw] -translate-x-1/2 origin-bottom skew-x-[-8deg] bg-[radial-gradient(circle,rgba(184,255,101,0.34)_1px,transparent_1.7px)] bg-[length:16px_16px] opacity-60 [mask-image:linear-gradient(to_top,black,transparent_88%)]" />
      <div className="absolute bottom-0 left-1/2 h-[360px] w-[130vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(184,255,101,0.16),transparent_62%)]" />
    </div>
  );
}

function HeroSection() {
  const installCommand = "npx create-xmem@latest";
  const [copiedInstallCommand, setCopiedInstallCommand] = useState(false);

  const copyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopiedInstallCommand(true);
      window.setTimeout(() => setCopiedInstallCommand(false), 1600);
    } catch {
      setCopiedInstallCommand(false);
    }
  };

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-[#050505] px-5 pb-12 pt-28 text-white sm:px-8">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <div className="mb-6 inline-flex rounded-full border border-[#b8ff65]/30 bg-[#b8ff65]/10 px-3 py-1 text-xs font-semibold text-[#dfffaa] shadow-[0_0_36px_rgba(184,255,101,0.14)]">
          Open-source memory infrastructure
        </div>

        <h1 className="w-full max-w-5xl break-words font-display text-5xl font-semibold leading-[0.96] text-white sm:text-7xl lg:text-8xl">
          Persistent memory
          <span className="block">
            for <span className="bg-gradient-to-r from-[#dfffaa] via-[#b8ff65] to-[#3dd8ff] bg-clip-text text-transparent">AI agents.</span>
          </span>
        </h1>

        <p className="mt-6 max-w-[21rem] text-sm leading-7 text-white/[0.62] sm:max-w-3xl sm:text-lg sm:leading-8">
          XMem captures decisions, preferences, code context, and source-backed facts so agents can recover the right context without asking teams to repeat themselves.
        </p>

        <div className="mt-9 flex w-full max-w-[19rem] flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link
            href="/scanner"
            data-testid="button-start-building"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#b8ff65] px-5 text-sm font-semibold text-black shadow-[0_0_40px_rgba(184,255,101,0.16)] transition hover:bg-[#d9ff9b] sm:w-auto"
          >
            Start building
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
          <span>{installCommand}</span>
          <button
            type="button"
            onClick={copyInstallCommand}
            className="ml-2 rounded-sm border border-white/10 px-1.5 py-0.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
          >
            {copiedInstallCommand ? "copied" : "copy"}
          </button>
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
  const [activeBenchmarkIndex, setActiveBenchmarkIndex] = useState(0);
  const activeBenchmark = benchmarkSets[activeBenchmarkIndex];
  const benchmarkMaxScore = Math.max(...activeBenchmark.rows.map(([, value]) => Number(value)));

  return (
    <section id="benchmarks" className="relative overflow-hidden bg-[#050505] px-5 py-24 text-white sm:px-8">
      <div className="absolute inset-0 xmem-grid opacity-25" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_50%_0%,rgba(184,255,101,0.12),transparent_55%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <SectionLabel>Benchmarks</SectionLabel>
            <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Proof that memory survives more than one chat.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-white/60 lg:justify-self-end">
            Use the benchmark view as evidence, not decoration: compare recall quality across long-term and conversational memory tasks before wiring XMem into production agents.
          </p>
        </div>

        <div className="mt-12 grid gap-5 rounded-md border border-white/10 bg-[#090a09]/90 p-4 shadow-2xl shadow-black/50 backdrop-blur-md lg:grid-cols-[280px_1fr] lg:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {benchmarkSets.map((benchmark, index) => (
              <button
                type="button"
                key={benchmark.name}
                onClick={() => setActiveBenchmarkIndex(index)}
                aria-pressed={index === activeBenchmarkIndex}
                className={`rounded-md border p-5 text-left transition hover:border-[#b8ff65]/35 ${index === activeBenchmarkIndex ? "border-[#b8ff65]/45 bg-[#b8ff65]/[0.055]" : "border-white/10 bg-white/[0.035]"}`}
              >
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.42]">{benchmark.eyebrow}</div>
                <div className="mt-3 font-display text-2xl font-semibold text-white/[0.78]">{benchmark.name}</div>
                <div className="mt-2 font-display text-6xl font-semibold leading-none text-[#b8ff65]">{benchmark.score}</div>
              </button>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-[#050505]">
            <div className="grid gap-5 border-b border-white/10 p-5 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.42]">{activeBenchmark.eyebrow}</div>
                <h3 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{activeBenchmark.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/[0.56]">{activeBenchmark.summary}</p>
              </div>
              <div className="text-left md:text-right">
                <div className="font-display text-6xl font-semibold leading-none text-[#b8ff65]">{activeBenchmark.score}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/[0.46]">average score</div>
              </div>
            </div>

            <div className="space-y-1 p-5">
              <div className="mb-5 flex flex-wrap gap-4 text-xs text-white/45">
                {["Zep", "Membase", "Supermemory", "Backboard"].map((peer) => (
                  <span key={peer} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#b8ff65]" />
                    {peer}
                  </span>
                ))}
              </div>

              {activeBenchmark.rows.map(([label, value, note]) => (
                <div key={label} className="grid gap-3 border-t border-white/[0.06] py-3 text-sm md:grid-cols-[190px_48px_1fr_170px] md:items-center">
                  <div className="font-semibold text-white/[0.74]">{label}</div>
                  <div className="font-mono text-xs text-[#b8ff65]">{value}</div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#4f7c2f] to-[#b8ff65] shadow-[0_0_18px_rgba(184,255,101,0.34)]" style={{ width: `${(Number(value) / benchmarkMaxScore) * 100}%` }} />
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
  const [billingRegion] = useState(() => detectBillingRegion());
  const proPrice = formatRegionalProPrice(billingRegion);
  const proNote = `per month in ${billingRegion === "IN" ? "India" : "global regions"}`;

  return (
    <section id="pricing" className="bg-[#f5f1e8] px-5 py-24 text-black sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-sm border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-black/55">
              Pricing
            </div>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Start free. Go live when memory becomes core.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-black/60 lg:justify-self-end">
            Keep experimentation free while teams validate the workflow, then move to a simple production tier when agents need persistent recall at higher volume.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-md border border-black/10 bg-black/10 lg:grid-cols-3">
          {pricingPlans.map((plan) => {
            const displayPrice = plan.name === "Pro" ? proPrice : plan.price;
            const displayNote = plan.name === "Pro" ? proNote : plan.note;
            const features = plan.name === "Pro"
              ? plan.features.map((feature) =>
                  feature === "5,000 monthly Pro credits included"
                    ? `${PRO_MONTHLY_CREDITS.toLocaleString()} monthly Pro credits included`
                    : feature,
                )
              : plan.features;

            return (
            <article
              key={plan.name}
              className={`relative flex min-h-[500px] flex-col border-b border-black/10 p-6 last:border-b-0 lg:border-b-0 lg:border-r last:lg:border-r-0 ${plan.featured ? "bg-[#111] text-white shadow-[inset_0_2px_0_#b8ff65]" : "bg-[#fbf8f0] text-black"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                  <p className={`mt-2 min-h-[42px] text-sm leading-6 ${plan.featured ? "text-white/55" : "text-black/58"}`}>{plan.summary}</p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full bg-[#b8ff65]/15 px-3 py-1 text-xs font-semibold text-[#dfffaa]">Recommended</span>
                ) : null}
              </div>

              <div className="mt-10 font-display text-6xl font-semibold leading-none">{displayPrice}</div>
              <div className={`mt-5 text-sm font-semibold ${plan.featured ? "text-white" : "text-black"}`}>{displayNote}</div>

              <ul className={`mt-5 space-y-3 text-sm leading-6 ${plan.featured ? "text-white/58" : "text-black/60"}`}>
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-[#b8ff65]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {plan.href.startsWith("/") ? (
                  <Link
                    href={plan.href}
                    className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition ${plan.featured ? "bg-[#b8ff65] text-black hover:bg-[#d9ff9b]" : "border border-black/15 bg-transparent text-black hover:bg-black/5"}`}
                  >
                    {plan.cta}
                    {plan.featured ? <ArrowRight className="h-4 w-4" /> : null}
                  </Link>
                ) : (
                  <a
                    href={plan.href}
                    className="inline-flex h-12 w-full items-center justify-center rounded-md border border-black/15 bg-transparent px-5 text-sm font-semibold text-black transition hover:bg-black/5"
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            </article>
            );
          })}
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
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Stop resetting your agents to zero.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-black/70 sm:text-lg">
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
        <PrimitiveSection />
        <StackComparisonSection />
        <BenchmarkSection />
        <DemoSection />
        <DeveloperSection />
        <SecuritySection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
