import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { useAuth } from "@/contexts/AuthContext";

type DocGroup = "Start" | "Build" | "Connect" | "Operate";

type DocTable = {
  headers: string[];
  rows: string[][];
};

type DocSection = {
  id: string;
  title: string;
  body?: string;
  bullets?: string[];
  code?: string;
  table?: DocTable;
  callout?: string;
};

type DocPageContent = {
  slug: string;
  group: DocGroup;
  title: string;
  description: string;
  status: "Stable" | "Preview" | "Beta";
  version: string;
  updated: string;
  heroCode?: string;
  sections: DocSection[];
};

const productVersions = [
  ["XMem API", "v1 stable, v2 async preview", "Bearer API key", "Production memory ingestion, retrieval, search, scraping"],
  ["XMem Python package", "0.1.0", "Python 3.11+", "Local pipeline, FastAPI service, scanner, storage adapters"],
  ["xmem local package", "0.1.0", "Node 20+", "Local-first setup, dev, verify, context import/export scripts"],
  ["xmem-ai TypeScript SDK", "^2.0.1", "Node or Bun", "Client used by OpenCode and agent tooling"],
  ["xmem-mcp", "latest via uvx", "MCP stdio", "Shared memory tools for coding agents and MCP clients"],
  ["xmem-* connectors", "1.0.0", "npm/npx", "Claude Code, Codex, Cursor, Hermes, OpenClaw, OpenCode"],
  ["Chrome extension", "packaged dist", "Chromium", "Browser memory for ChatGPT, Claude, Gemini, Perplexity, DeepSeek"],
];

const connectorMatrix = [
  ["Claude Code", "xmem-claude-code", "npx xmem-claude-code@latest install", ".mcp.json and .claude commands"],
  ["Codex", "xmem-codex", "npx xmem-codex@latest install", ".codex/config.toml, AGENTS.md, plugin files"],
  ["Cursor", "xmem-cursor", "npx xmem-cursor@latest install", ".cursor/mcp.json and Cursor rule"],
  ["Hermes", "xmem-hermes", "npx xmem-hermes@latest install", ".hermes/config.yaml and HERMES.md"],
  ["OpenClaw", "xmem-openclaw", "npx xmem-openclaw@latest install", "openclaw.plugin.json and .mcp.json"],
  ["OpenCode", "opencode-xmem", "bunx opencode-xmem@latest install", "OpenCode plugin, slash commands, xmem tool"],
];

const docs: DocPageContent[] = [
  {
    slug: "overview",
    group: "Start",
    title: "XMem Documentation",
    description:
      "The complete guide to XMem memory infrastructure: SDKs, REST APIs, MCP, coding-agent connectors, browser extension, source connectors, scanner, and the main agentic pipeline.",
    status: "Stable",
    version: "Docs suite 2026.05",
    updated: "May 29, 2026",
    heroCode: `// one memory loop: write only when the Judge approves
await xmem.ingest({
  user_query: "Remember that I prefer React, TS, and Vite.",
  agent_response: "Saved for future agent sessions.",
  user_id: "vedant"
});

const context = await xmem.retrieve({
  query: "What frontend stack should I use?",
  user_id: "vedant",
  top_k: 5
});`,
    sections: [
      {
        id: "what-is-xmem",
        title: "What XMem is",
        body:
          "XMem is persistent memory infrastructure for AI agents. It ingests conversation turns, browser context, repository structure, and connector data, classifies each signal into memory domains, runs a judge-before-write pass, and retrieves the right context before an agent answers.",
        bullets: [
          "Use the REST API when you want direct control from any language.",
          "Use SDKs when your app wants typed client methods and fewer HTTP details.",
          "Use MCP when a local agent client needs memory tools over stdio.",
          "Use the extension when memory should follow the user across web AI products.",
          "Use scanner and code memory when agents need repository-aware recall.",
        ],
      },
      {
        id: "versions",
        title: "Version matrix",
        body:
          "The public docs now pin the current service and connector versions so developers know which surface they are integrating with.",
        table: {
          headers: ["Surface", "Current version", "Runtime", "Use it for"],
          rows: productVersions,
        },
      },
      {
        id: "system-map",
        title: "System map",
        body:
          "XMem is arranged around a small set of durable contracts: ingestion, retrieval, search, code query, MCP tools, and connector installation. Everything else is a client-specific way to reach those contracts.",
        bullets: [
          "API gateway: FastAPI routes under /v1 and /v2.",
          "Pipeline: classifier, domain agents, judge, weaver, retrieval synthesizer.",
          "Storage: vector memory, graph memory, code graph, document metadata.",
          "Clients: TypeScript SDK, Python runtime, MCP server, browser extension, npm connectors.",
        ],
      },
    ],
  },
  {
    slug: "quickstart",
    group: "Start",
    title: "Quickstart",
    description:
      "Get from a clean machine to a running memory service, one saved memory, and one retrieved answer.",
    status: "Stable",
    version: "API v1",
    updated: "May 29, 2026",
    heroCode: `git clone https://github.com/XortexAI/XMem
cd XMem
cp templates/xmem.env.local .env
npm run setup
npm run dev`,
    sections: [
      {
        id: "local",
        title: "Run locally",
        body:
          "The local package starts the backend, local storage dependencies, and extension workspace. It is the fastest path when you want the full XMem pipeline on your machine.",
        code: `git clone https://github.com/XortexAI/XMem
cd XMem
cp templates/xmem.env.local .env
npm run setup
npm run dev

# health check
curl http://localhost:8000/health`,
      },
      {
        id: "cloud-api",
        title: "Use the hosted API",
        body:
          "For hosted usage, create an API key in XMem, keep it server-side, and send every call with a Bearer token.",
        code: `curl https://api.xmem.in/v1/memory/ingest \\
  -H "Authorization: Bearer xmem_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_query": "I prefer Prisma migrations.",
    "agent_response": "I'll remember that for future database work.",
    "user_id": "vedant"
  }'`,
      },
      {
        id: "first-retrieval",
        title: "Retrieve memory before the agent answers",
        body:
          "Call retrieve with the user's next task. XMem searches memory domains and returns a synthesized answer plus source records for inspection.",
        code: `curl https://api.xmem.in/v1/memory/retrieve \\
  -H "Authorization: Bearer xmem_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What database migration style does this user prefer?",
    "user_id": "vedant",
    "top_k": 5
  }'`,
      },
    ],
  },
  {
    slug: "rest-api",
    group: "Build",
    title: "REST API Reference",
    description:
      "Production endpoint reference for memory ingestion, retrieval, search, transcript parsing, code query, scanner, and connector OAuth.",
    status: "Stable",
    version: "v1 stable, v2 durable jobs preview",
    updated: "May 29, 2026",
    sections: [
      {
        id: "auth",
        title: "Authentication",
        body:
          "API routes use Bearer API keys. In local development a static key user can scope calls with user_id; hosted calls resolve to the authenticated user identity.",
        code: `Authorization: Bearer xmem_...`,
      },
      {
        id: "memory",
        title: "Memory endpoints",
        table: {
          headers: ["Method", "Path", "Status", "Purpose"],
          rows: [
            ["POST", "/v1/memory/ingest", "Stable", "Synchronously run the ingest pipeline for one turn."],
            ["POST", "/v2/memory/ingest", "Preview", "Queue a durable async ingest job."],
            ["GET", "/v2/memory/ingest/{job_id}", "Preview", "Read a durable ingest job by id."],
            ["GET", "/v2/memory/jobs/{job_id}/status", "Preview", "Read normalized job status."],
            ["POST", "/v1/memory/batch-ingest", "Stable", "Ingest up to 100 turns in one request."],
            ["POST", "/v2/memory/batch-ingest", "Preview", "Queue durable batch ingest."],
            ["POST", "/v1/memory/retrieve", "Stable", "Answer a query from stored memories."],
            ["POST", "/v1/memory/search", "Stable", "Return raw source records by domain."],
            ["POST", "/v1/memory/scrape", "Stable", "Parse public shared chat links."],
            ["POST", "/v1/memory/upload", "Stable", "Parse uploaded transcript files."],
          ],
        },
      },
      {
        id: "payloads",
        title: "Core request shapes",
        body:
          "Every public endpoint returns the standard envelope: status, request_id, data, error, and elapsed_ms.",
        code: `{
  "status": "ok",
  "request_id": "req_...",
  "data": {},
  "error": null,
  "elapsed_ms": 82.4
}`,
      },
      {
        id: "code-and-scanner",
        title: "Code and scanner endpoints",
        table: {
          headers: ["Method", "Path", "Purpose"],
          rows: [
            ["POST", "/v1/code/query", "Ask an indexed repository a code question."],
            ["POST", "/v1/code/query_stream", "Stream a code answer."],
            ["POST", "/api/scanner/scan", "Start scanning a GitHub repository."],
            ["GET", "/api/scanner/status", "Read scan status for an org/repo."],
            ["POST", "/api/scanner/pause", "Pause a running scan."],
            ["POST", "/api/scanner/resume", "Resume a paused scan."],
            ["GET", "/api/scanner/repos", "List repositories scanned by the authenticated user."],
            ["POST", "/api/scanner/chat", "Chat with an indexed codebase."],
          ],
        },
      },
      {
        id: "source-connectors",
        title: "Source connector endpoints",
        body:
          "Notion and Google Drive OAuth start/status routes are exposed today. Token exchange and sync storage are deliberately staged as follow-up work, so the status endpoint reports pending or not_connected until that storage path is enabled.",
        table: {
          headers: ["Method", "Path", "Purpose"],
          rows: [
            ["GET", "/api/connectors", "List available source connectors."],
            ["GET", "/api/connectors/{connector_id}/status", "Read connector state."],
            ["POST", "/api/connectors/{connector_id}/oauth/start", "Create a short-lived OAuth state and authorization URL."],
            ["GET", "/api/connectors/{connector_id}/oauth/callback", "Receive OAuth authorization callback."],
            ["POST", "/api/connectors/{connector_id}/disconnect", "Disconnect a source connector."],
          ],
        },
      },
    ],
  },
  {
    slug: "sdks",
    group: "Build",
    title: "SDKs",
    description:
      "Use XMem from TypeScript, JavaScript, Python, or direct REST calls without reimplementing request envelopes.",
    status: "Stable",
    version: "xmem-ai ^2.0.1, Python 0.1.0",
    updated: "May 29, 2026",
    heroCode: `import { XMemClient } from "xmem-ai";

const xmem = new XMemClient({
  apiKey: process.env.XMEM_API_KEY!,
  apiUrl: process.env.XMEM_API_URL || "https://api.xmem.in",
  userId: process.env.XMEM_USERNAME!,
});`,
    sections: [
      {
        id: "typescript",
        title: "TypeScript SDK",
        body:
          "The TypeScript SDK powers the OpenCode plugin and is the recommended client for Node, Bun, and agent tooling.",
        code: `import { XMemClient } from "xmem-ai";

const xmem = new XMemClient({
  apiKey: process.env.XMEM_API_KEY!,
  apiUrl: "https://api.xmem.in",
  userId: "vedant",
});

await xmem.ingest("Remember this repo uses Vite.", "vedant");
const answer = await xmem.retrieve("What bundler does this repo use?", "vedant", 5);
const results = await xmem.search("frontend stack", "vedant", 10);`,
      },
      {
        id: "python",
        title: "Python runtime",
        body:
          "The Python package contains the FastAPI application, agents, pipeline implementations, scanner, graph clients, storage adapters, and local development entry points.",
        code: `pip install -e .
uvicorn src.api.app:create_app --factory --host 0.0.0.0 --port 8000

# package metadata
# name: Xmem
# version: 0.1.0
# requires-python: >=3.11`,
      },
      {
        id: "contract",
        title: "SDK contract",
        bullets: [
          "ingest stores a user turn after classification, domain extraction, judge, and weaver steps.",
          "retrieve returns a synthesized answer with source records and confidence.",
          "search returns raw matching records without asking the model to synthesize an answer.",
          "code query requires org_id, repo, query, user_id, and top_k.",
        ],
      },
    ],
  },
  {
    slug: "agentic-pipeline",
    group: "Build",
    title: "Main Agentic Pipeline",
    description:
      "How XMem turns messy conversation and code signals into clean, versionable, queryable memory.",
    status: "Stable",
    version: "Pipeline 0.1.0",
    updated: "May 29, 2026",
    sections: [
      {
        id: "flow",
        title: "Ingest flow",
        body:
          "The pipeline is intentionally agentic: specialized agents make focused claims, and a Judge validates whether each claim should be added, updated, deleted, or skipped before storage is touched.",
        table: {
          headers: ["Stage", "Responsibility", "Output"],
          rows: [
            ["Classifier", "Decides which domains should inspect the turn.", "Profile, temporal, summary, code, snippet, image labels."],
            ["Domain agents", "Extract structured candidate memories from the turn.", "Candidate facts, events, summaries, snippets, image observations."],
            ["Judge", "Compares candidates against existing memory.", "add, update, delete, skip operations with reasons."],
            ["Weaver", "Applies approved operations to storage.", "Succeeded, skipped, and failed operation counts."],
            ["Retrieval synthesizer", "Searches domains and writes an answer with citations.", "Answer, sources, confidence."],
          ],
        },
      },
      {
        id: "domains",
        title: "Memory domains",
        bullets: [
          "Profile: durable user preferences, identity, traits, and recurring instructions.",
          "Temporal: dated events, plans, changes, and time-sensitive commitments.",
          "Summary: compressed session takeaways and project state.",
          "Code: repository symbols, files, imports, calls, annotations, and code explanations.",
          "Snippet: reusable code patterns, commands, and implementation recipes.",
          "Image: visual observations saved from URLs or data URIs.",
        ],
      },
      {
        id: "why-judge",
        title: "Why judge-before-write matters",
        body:
          "Most memory systems write too eagerly. XMem makes the write path deliberate: the Judge can merge facts, reject duplicates, delete stale claims, and explain every mutation. That makes memory safer for long-running agents that act over weeks instead of a single chat window.",
        callout:
          "The practical difference: every memory update has a reason. That reason is part of the system's debugging surface, not an invisible side effect.",
      },
    ],
  },
  {
    slug: "mcp-server",
    group: "Connect",
    title: "xmem-mcp",
    description:
      "Connect local coding agents to XMem using the Model Context Protocol and stdio transport.",
    status: "Stable",
    version: "latest via uvx",
    updated: "May 29, 2026",
    heroCode: `{
  "mcpServers": {
    "xmem": {
      "command": "uvx",
      "args": ["xmem-mcp"],
      "env": {
        "XMEM_API_URL": "https://api.xmem.in",
        "XMEM_API_KEY": "\${XMEM_API_KEY}",
        "XMEM_USERNAME": "\${XMEM_USERNAME}"
      }
    }
  }
}`,
    sections: [
      {
        id: "when",
        title: "When to use MCP",
        bullets: [
          "Use MCP when the host client supports local tools over stdio.",
          "Use npm connectors when you want the installer to write the exact client config.",
          "Use the TypeScript SDK when you are building the agent runtime yourself.",
        ],
      },
      {
        id: "environment",
        title: "Environment variables",
        table: {
          headers: ["Variable", "Required", "Description"],
          rows: [
            ["XMEM_API_URL", "Yes", "Hosted or local API base URL."],
            ["XMEM_API_KEY", "Yes", "Bearer API key. Keep it in environment or secret storage."],
            ["XMEM_USERNAME", "Yes", "Stable XMem username or user id for memory scoping."],
          ],
        },
      },
      {
        id: "tools",
        title: "Tool behavior",
        body:
          "Connectors expose memory add, recall, search, and code query operations through the MCP server. Code query requires an indexed repository and org/repo identifiers.",
      },
    ],
  },
  {
    slug: "agent-connectors",
    group: "Connect",
    title: "xmem-* Agent Connectors",
    description:
      "Install memory into Claude Code, Codex, Cursor, Hermes, OpenClaw, and OpenCode without hand-editing every client config.",
    status: "Stable",
    version: "1.0.0 connector line",
    updated: "May 29, 2026",
    sections: [
      {
        id: "matrix",
        title: "Connector matrix",
        table: {
          headers: ["Client", "Package", "Install", "Writes"],
          rows: connectorMatrix,
        },
      },
      {
        id: "credentials",
        title: "Authentication model",
        body:
          "All MCP-backed connectors keep secrets out of generated config files. They write ${XMEM_API_KEY} placeholders and expect credentials in the shell, OS secret store, or client launch environment.",
        code: `export XMEM_API_URL="https://api.xmem.in"
export XMEM_API_KEY="xmem_..."
export XMEM_USERNAME="your-xmem-username"`,
      },
      {
        id: "doctor",
        title: "Verify a connector",
        body:
          "Each npm connector ships doctor and smoke-test commands. The smoke test uses a low-risk search call and never prints the API key.",
        code: `npx xmem-codex@latest doctor
XMEM_API_KEY="xmem_..." XMEM_USERNAME="connector-test" npm run smoke`,
      },
      {
        id: "opencode",
        title: "OpenCode plugin",
        body:
          "OpenCode uses a plugin package instead of only writing MCP config. It registers the xmem tool, adds /xmem-init, /xmem-login, /xmem-logout commands, auto-recalls context, detects remember-this requests, and saves summaries before compaction.",
        code: `bunx opencode-xmem@latest install
bunx opencode-xmem@latest login`,
      },
    ],
  },
  {
    slug: "chrome-extension",
    group: "Connect",
    title: "Chrome Extension",
    description:
      "Bring XMem into browser AI workflows across ChatGPT, Claude, Gemini, Perplexity, DeepSeek, and regular text inputs.",
    status: "Beta",
    version: "packaged dist",
    updated: "May 29, 2026",
    sections: [
      {
        id: "install",
        title: "Install unpacked",
        bullets: [
          "Download xmem-extension-dist.zip from the landing page.",
          "Unzip it locally.",
          "Open chrome://extensions.",
          "Enable Developer mode.",
          "Click Load unpacked and select the dist folder.",
          "Open the XMem extension, set API URL, API key, and User ID, then test the connection.",
        ],
      },
      {
        id: "features",
        title: "Browser features",
        bullets: [
          "Detects supported AI chat text boxes.",
          "Searches memory while the user writes.",
          "Shows inline ghost suggestions when relevant.",
          "Can save outgoing messages to XMem.",
          "Works with hosted or local API URLs.",
        ],
      },
      {
        id: "download",
        title: "Download",
        body:
          "The current packaged extension is served from the landing app so developers can install it without building from source.",
        code: `https://xmem.in/xmem-extension-dist.zip`,
      },
    ],
  },
  {
    slug: "scanner-code-memory",
    group: "Build",
    title: "Scanner and Code Memory",
    description:
      "Index repositories into code graph memory so agents can query symbols, files, imports, call relationships, annotations, and implementation context.",
    status: "Preview",
    version: "Scanner v2",
    updated: "May 29, 2026",
    sections: [
      {
        id: "scan",
        title: "Start a scan",
        body:
          "The scanner clones or reads a GitHub repository, parses supported languages with deterministic parsers, enriches code chunks, and stores repository structure for later code query.",
        code: `curl https://api.xmem.in/api/scanner/scan \\
  -H "Authorization: Bearer xmem_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "github_url": "https://github.com/org/repo",
    "branch": "main",
    "visibility": "private"
  }'`,
      },
      {
        id: "query",
        title: "Query indexed code",
        code: `curl https://api.xmem.in/v1/code/query \\
  -H "Authorization: Bearer xmem_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "org_id": "org",
    "repo": "repo",
    "query": "Where is authentication enforced?",
    "user_id": "vedant",
    "top_k": 10
  }'`,
      },
      {
        id: "catalog",
        title: "Community catalog",
        body:
          "Scanner indexes can be private or shared. Community endpoints expose browsable public indexes and star counts for repos that owners have chosen to share.",
      },
    ],
  },
  {
    slug: "source-connectors",
    group: "Connect",
    title: "Source Connectors",
    description:
      "OAuth connectors for external knowledge sources such as Notion and Google Drive.",
    status: "Preview",
    version: "Connectors API preview",
    updated: "May 29, 2026",
    sections: [
      {
        id: "available",
        title: "Available connectors",
        table: {
          headers: ["Connector", "State", "Scopes"],
          rows: [
            ["Notion", "OAuth start and callback available", "Workspace authorization via Notion OAuth"],
            ["Google Drive", "OAuth start and callback available", "drive.readonly, documents.readonly"],
          ],
        },
      },
      {
        id: "start",
        title: "Start OAuth",
        body:
          "The start route validates the configured client ID, creates a 10-minute state token, and returns the provider authorization URL.",
        code: `curl -X POST https://api.xmem.in/api/connectors/google-drive/oauth/start \\
  -H "Authorization: Bearer <session token>"`,
      },
      {
        id: "current-limits",
        title: "Current limits",
        callout:
          "The API intentionally does not mark source connectors connected until token exchange, encrypted credential storage, and source ingestion are enabled.",
      },
    ],
  },
  {
    slug: "configuration",
    group: "Operate",
    title: "Configuration and Operations",
    description:
      "Environment variables, provider fallback, local-first setup, rate limits, observability, and deployment expectations.",
    status: "Stable",
    version: "Ops 0.1.0",
    updated: "May 29, 2026",
    sections: [
      {
        id: "runtime",
        title: "Runtime requirements",
        table: {
          headers: ["Component", "Requirement"],
          rows: [
            ["Python backend", "Python >=3.11"],
            ["Local package scripts", "Node >=20"],
            ["Connector installers", "Node/npm or Bun for OpenCode"],
            ["Hosted API", "Bearer API key and stable user identity"],
            ["MCP clients", "uvx xmem-mcp available on PATH"],
          ],
        },
      },
      {
        id: "providers",
        title: "Model provider fallback",
        body:
          "The backend supports multiple model providers and fallback ordering for production resilience.",
        code: `FALLBACK_ORDER=openrouter,gemini,claude,openai
XMEM_API_URL=https://api.xmem.in
XMEM_API_KEY=xmem_...
XMEM_USERNAME=your-xmem-username`,
      },
      {
        id: "security",
        title: "Security posture",
        bullets: [
          "Generated connector config files reference environment placeholders instead of copying secrets.",
          "API responses include request_id for support/debugging.",
          "Hosted errors avoid leaking internal exception details in production.",
          "Rate-limit metadata is returned through X-RateLimit-Remaining when available.",
        ],
      },
    ],
  },
  {
    slug: "versioning",
    group: "Operate",
    title: "Versioning and Release Notes",
    description:
      "How to read XMem versions across the API, Python package, local package, SDK, connector line, and docs.",
    status: "Stable",
    version: "2026.05",
    updated: "May 29, 2026",
    sections: [
      {
        id: "policy",
        title: "Version policy",
        bullets: [
          "API v1 is the stable synchronous contract for memory operations.",
          "API v2 introduces durable async jobs and should be treated as preview until job semantics are frozen.",
          "The Python package and local package are currently 0.1.0.",
          "Agent connector packages are currently 1.0.0.",
          "The TypeScript SDK dependency line used by the agent tooling is xmem-ai ^2.0.1.",
        ],
      },
      {
        id: "compatibility",
        title: "Compatibility guide",
        table: {
          headers: ["If you use", "Pin"],
          rows: [
            ["Direct REST calls", "Base path and request schema: /v1 for stable, /v2 for durable jobs preview."],
            ["MCP connectors", "Connector package major version and xmem-mcp runtime."],
            ["OpenCode plugin", "opencode-xmem package version and xmem-ai dependency line."],
            ["Self-hosted backend", "Python package version plus storage/provider environment."],
          ],
        },
      },
    ],
  },
];

const groupOrder: DocGroup[] = ["Start", "Build", "Connect", "Operate"];

function slugFromLocation(location: string) {
  const parts = location.split("?")[0].split("/").filter(Boolean);
  return parts[0] === "docs" && parts[1] ? parts[1] : "overview";
}

function CodeBlock({ code, copyCode = code }: { code: string; copyCode?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-md border border-white/10 bg-[#050505]">
      <button
        onClick={copy}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
        title="Copy code"
      >
        <span className="text-[11px] font-medium">{copied ? "Done" : "Copy"}</span>
      </button>
      <pre className="overflow-x-auto p-5 pr-14 text-sm leading-relaxed text-white/72">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DocsTable({ table }: { table: DocTable }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase text-white/45">
            <tr>
              {table.headers.map((header) => (
                <th key={header} className="border-b border-white/10 px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.join("|")} className="border-b border-white/8 last:border-b-0">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="px-4 py-3 align-top text-white/58">
                    {index === 0 ? <span className="font-medium text-white/82">{cell}</span> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: DocSection }) {
  return (
    <section id={section.id} className="scroll-mt-28 border-t border-white/10 py-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-semibold text-white">{section.title}</h2>
      {section.body && <p className="mt-4 max-w-3xl text-base leading-8 text-white/58">{section.body}</p>}
      {section.bullets && (
        <div className="mt-5 grid gap-3">
          {section.bullets.map((item) => (
            <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.025] p-4">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8ff65]/80" />
              <p className="text-sm leading-6 text-white/62">{item}</p>
            </div>
          ))}
        </div>
      )}
      {section.table && (
        <div className="mt-6">
          <DocsTable table={section.table} />
        </div>
      )}
      {section.code && (
        <div className="mt-6">
          <CodeBlock code={section.code} />
        </div>
      )}
      {section.callout && (
        <div className="mt-6 rounded-md border border-[#b8ff65]/20 bg-[#b8ff65]/[0.055] p-5 text-sm leading-7 text-white/72">
          {section.callout}
        </div>
      )}
    </section>
  );
}

export default function DocsPage() {
  const [location] = useLocation();
  const slug = slugFromLocation(location);
  const page = docs.find((item) => item.slug === slug) || docs[0];
  const { isAuthenticated, token } = useAuth();

  const groupedDocs = useMemo(
    () =>
      groupOrder.map((group) => ({
        group,
        items: docs.filter((item) => item.group === group),
      })),
    [],
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed left-1/2 top-0 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-[#b8ff65]/5 blur-[120px] pointer-events-none" />

      <main className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)_220px] lg:pt-32">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-md border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
            <Link href="/docs" className="mb-4 flex items-center rounded-md bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white">
              Documentation
            </Link>
            <nav className="space-y-5">
              {groupedDocs.map(({ group, items }) => (
                <div key={group}>
                  <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/32">{group}</div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const active = item.slug === page.slug;
                      return (
                        <Link
                          key={item.slug}
                          href={item.slug === "overview" ? "/docs" : `/docs/${item.slug}`}
                          className={`block rounded-md px-2.5 py-2 text-sm transition ${
                            active ? "bg-white text-black" : "text-white/52 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <span className="min-w-0 truncate">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="border-b border-white/10 pb-10"
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/62">
                {page.group}
              </span>
              <span className="rounded-md border border-[#b8ff65]/20 bg-[#b8ff65]/[0.06] px-3 py-1.5 text-xs font-medium text-[#d8ffad]">
                {page.status}
              </span>
              <span className="rounded-md border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-xs text-white/46">
                {page.version}
              </span>
            </div>
            <h1 className="font-display max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/58">{page.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#b8ff65]"
              >
                Quickstart
              </Link>
              <Link
                href="/docs/agent-connectors"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
              >
                Connect an agent
              </Link>
            </div>
            <div className="mt-6 text-sm text-white/38">Updated {page.updated}</div>
          </motion.header>

          <div className="my-6 rounded-md border border-white/10 bg-black/35 p-4 lg:hidden">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Browse docs</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {docs.map((item) => {
                const active = item.slug === page.slug;
                return (
                  <Link
                    key={item.slug}
                    href={item.slug === "overview" ? "/docs" : `/docs/${item.slug}`}
                    className={`block rounded-md px-3 py-2 text-sm transition ${
                      active ? "bg-white text-black" : "bg-white/[0.035] text-white/58 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {page.slug === "overview" && (
            <div className="my-8 grid gap-3 md:grid-cols-3">
              {[
                ["Memory writes", "Judge-approved add, update, delete, and skip operations."],
                ["Agent clients", "MCP and npm connectors for coding assistants."],
                ["Code context", "Scanner, graph memory, and repository-aware retrieval."],
              ].map(([title, text], index) => (
                <div key={title as string} className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 font-mono text-xs text-[#b8ff65]/80">{String(index + 1).padStart(2, "0")}</div>
                  <div className="text-sm font-semibold text-white">{title as string}</div>
                  <p className="mt-2 text-sm leading-6 text-white/48">{text as string}</p>
                </div>
              ))}
            </div>
          )}

          {page.heroCode && (
            <div className="my-8">
              <CodeBlock code={page.heroCode} />
            </div>
          )}

          {isAuthenticated && page.slug === "rest-api" && token && (
            <div className="my-8 rounded-md border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 text-sm font-semibold text-white">
                Active API header
              </div>
              <CodeBlock
                code={`Authorization: Bearer ${token.substring(0, 24)}...`}
                copyCode={`Authorization: Bearer ${token}`}
              />
            </div>
          )}

          <div className="mt-8">
            {page.sections.map((section) => (
              <SectionBlock key={section.id} section={section} />
            ))}
          </div>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-28 space-y-5">
            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                On this page
              </div>
              <nav className="space-y-1">
                {page.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-sm font-semibold text-white">
                Secure by default
              </div>
              <p className="text-sm leading-6 text-white/48">
                Keep API keys in environment variables or secret stores. The connector installers write placeholders, not raw secrets.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
