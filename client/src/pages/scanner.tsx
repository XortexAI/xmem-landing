import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  X,
  Circle,
  GitBranch,
  Lock,
  MessageSquare,
} from "lucide-react";

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

interface RepoEntry {
  org: string;
  repo: string;
  phase1_status: string;
  phase2_status: string;
}

interface ScanEstimates {
  estimate_disclaimer: string;
  branch_used_for_label: string;
  repo_size_kb: number;
  estimated_phase1_seconds: number;
  estimated_embedding_api_calls: number;
  estimated_embedding_tokens: number;
  estimated_phase2_llm_tokens: number;
  estimated_cost_usd: number | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
}

function StatusDot({ status }: { status: string }) {
  if (status === "complete")
    return <div className="w-2 h-2 rounded-full bg-white" />;
  if (status === "running")
    return <Loader2 className="w-3 h-3 text-white/60 animate-spin" />;
  if (status === "failed")
    return <X className="w-3 h-3 text-white/40" />;
  return <Circle className="w-2 h-2 text-white/20" />;
}

function UsernameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div
      className="dark min-h-screen flex items-center justify-center"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="XMem"
            className="h-10 w-auto invert mx-auto mb-6"
          />
          <h1
            className="text-3xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Scanner Dashboard
          </h1>
          <p className="text-white/40 mt-3 text-sm">
            Index and explore any GitHub repository
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-xl p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <label className="block text-xs text-white/50 uppercase tracking-widest mb-3">
              Username
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="w-full mt-4 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: value.trim() ? "white" : "rgba(255,255,255,0.1)",
                color: value.trim() ? "black" : "rgba(255,255,255,0.3)",
              }}
            >
              Continue
            </button>
          </div>
        </form>

        <a
          href="/"
          className="flex items-center justify-center gap-2 mt-8 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to home
        </a>
      </div>
    </div>
  );
}

export default function Scanner() {
  const [username, setUsername] = useState(
    () => localStorage.getItem("xmem_username") || "",
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("xmem_username"),
  );

  const [githubUrl, setGithubUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [validating, setValidating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [inputError, setInputError] = useState("");
  const [estimates, setEstimates] = useState<ScanEstimates | null>(null);

  const [repos, setRepos] = useState<RepoEntry[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepoEntry | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Load persisted repos from API ─────────────────────────────────

  useEffect(() => {
    if (!isLoggedIn || !username.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(
          `${API_URL}/v1/scanner/repos?username=${encodeURIComponent(username)}`,
        );
        const data = await resp.json();
        if (cancelled || data.status !== "ok" || !Array.isArray(data.repos)) return;
        setRepos(
          data.repos.map((r: RepoEntry) => ({
            org: r.org,
            repo: r.repo,
            phase1_status: r.phase1_status || "not_started",
            phase2_status: r.phase2_status || "not_started",
          })),
        );
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, username]);

  // ── Poll running scans ──────────────────────────────────────────────

  useEffect(() => {
    const running = repos.filter(
      (r) => r.phase1_status === "running" || r.phase2_status === "running",
    );
    if (running.length === 0) return;

    const interval = setInterval(async () => {
      for (const repo of running) {
        try {
          const resp = await fetch(
            `${API_URL}/v1/scanner/status?username=${encodeURIComponent(username)}&org_id=${encodeURIComponent(repo.org)}&repo=${encodeURIComponent(repo.repo)}`,
          );
          const data = await resp.json();

          setRepos((prev) =>
            prev.map((r) =>
              r.org === repo.org && r.repo === repo.repo
                ? {
                    ...r,
                    phase1_status: data.phase1_status,
                    phase2_status: data.phase2_status,
                  }
                : r,
            ),
          );

          if (
            data.phase1_status === "complete" &&
            repo.phase1_status === "running"
          ) {
            setActiveRepo((prev) => {
              if (prev?.org === repo.org && prev?.repo === repo.repo) {
                return {
                  ...prev,
                  phase1_status: "complete",
                  phase2_status: data.phase2_status,
                };
              }
              return prev;
            });

            setMessages((prev) => [
              ...prev,
              {
                id: `status-ready-${Date.now()}`,
                role: "status",
                content: `Phase 1 complete. ${repo.org}/${repo.repo} is now searchable. Ask anything about the codebase.`,
              },
            ]);
          }

          if (
            data.phase2_status === "complete" &&
            repo.phase2_status === "running"
          ) {
            setActiveRepo((prev) => {
              if (prev?.org === repo.org && prev?.repo === repo.repo) {
                return { ...prev, phase2_status: "complete" };
              }
              return prev;
            });
          }
        } catch {
          /* silently ignore polling errors */
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [repos, username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auth ─────────────────────────────────────────────────────────────

  const handleLogin = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem("xmem_username", name);
  };

  const handleLogout = () => {
    setUsername("");
    setIsLoggedIn(false);
    localStorage.removeItem("xmem_username");
    setRepos([]);
    setActiveRepo(null);
    setMessages([]);
  };

  // ── Scan ─────────────────────────────────────────────────────────────

  const triggerScan = async () => {
    if (!githubUrl.trim()) return;
    setInputError("");
    setScanning(true);

    try {
      const resp = await fetch(`${API_URL}/v1/scanner/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: githubUrl.trim(),
          username,
          pat: pat.trim(),
          branch: branch.trim() || "main",
        }),
      });

      const data = await resp.json();
      if (data.status === "error") {
        setInputError(data.error || "Failed to start scan");
        return;
      }

      const newRepo: RepoEntry = {
        org: data.org,
        repo: data.repo,
        phase1_status: data.phase1_status || "running",
        phase2_status: data.phase2_status || "pending",
      };

      setRepos((prev) => {
        const exists = prev.find(
          (r) => r.org === newRepo.org && r.repo === newRepo.repo,
        );
        if (exists) {
          return prev.map((r) =>
            r.org === newRepo.org && r.repo === newRepo.repo ? newRepo : r,
          );
        }
        return [...prev, newRepo];
      });

      setActiveRepo(newRepo);
      setGithubUrl("");
      setPat("");
      setShowPat(false);
      setEstimates(null);

      if (data.reused) {
        setMessages([
          {
            id: `status-reused-${Date.now()}`,
            role: "status",
            content:
              data.message ||
              `${newRepo.org}/${newRepo.repo} is already indexed at this commit. You can chat now.`,
          },
        ]);
        return;
      }

      if (data.phase2_only) {
        setMessages([
          {
            id: `status-p2-${Date.now()}`,
            role: "status",
            content:
              data.message ||
              `Phase 1 data exists for ${newRepo.org}/${newRepo.repo}. Running Phase 2 (LLM enrichment) only. Chat is available while summaries update.`,
          },
        ]);
        return;
      }

      setMessages([
        {
          id: `status-scan-${Date.now()}`,
          role: "status",
          content: `Scanning ${newRepo.org}/${newRepo.repo}... Phase 1 (AST indexing) is running. You can chat once it completes.`,
        },
      ]);
    } catch {
      setInputError("Network error. Is the API server running?");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    if (showPat && pat.trim()) {
      await triggerScan();
      return;
    }

    setInputError("");
    setValidating(true);

    try {
      const resp = await fetch(`${API_URL}/v1/scanner/validate-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: githubUrl.trim(),
          pat: pat.trim(),
          branch: branch.trim() || "",
        }),
      });
      const data = await resp.json();

      if (data.status === "error") {
        setInputError(data.error);
        return;
      }

      if (data.needs_pat || data.auth_error) {
        setShowPat(true);
        setInputError(
          "Repository is private or not found. Please provide a Personal Access Token.",
        );
        return;
      }

      if (data.accessible) {
        if (data.default_branch) setBranch(data.default_branch);
        if (data.estimates) setEstimates(data.estimates as ScanEstimates);
        // Yield so the estimate panel can paint before the long-running scan starts.
        await new Promise((r) => setTimeout(r, 80));
        await triggerScan();
        return;
      }

      setInputError(data.error || "Could not access repository");
    } catch {
      setInputError("Network error. Is the API server running?");
    } finally {
      setValidating(false);
    }
  };

  // ── Chat ─────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeRepo || chatLoading) return;
    if (activeRepo.phase1_status !== "complete") return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: chatInput.trim(),
    };
    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const resp = await fetch(`${API_URL}/v1/scanner/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: activeRepo.org,
          repo: activeRepo.repo,
          query: userMsg.content,
          username,
          top_k: 10,
        }),
      });

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            
            // Helper to recursively extract text from potentially raw Gemini/Langchain payloads
            const extractText = (data: any): string => {
              if (!data) return "";
              
              if (typeof data === "string") {
                // Sometimes the string is literally a JSON payload
                if (data.startsWith("{") && data.includes('"candidates"')) {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.candidates) {
                      return extractText(parsed);
                    }
                  } catch {
                    // Ignore parse errors, just return the string
                  }
                }
                return data;
              }
              
              if (typeof data === "object") {
                if (data.candidates && Array.isArray(data.candidates)) {
                  const parts = data.candidates[0]?.content?.parts || [];
                  return parts.map((p: any) => p.text || "").join("");
                }
                if (data.text) {
                  return extractText(data.text);
                }
              }
              
              return "";
            };

            const textToAdd = extractText(chunk.type === "chunk" ? chunk.text : chunk);

            if (textToAdd) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last.id === assistantId) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + textToAdd },
                  ];
                }
                return prev;
              });
            }
          } catch {
            /* skip malformed lines */
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.id === assistantId) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: "Failed to get response. Please try again.",
            },
          ];
        }
        return prev;
      });
    } finally {
      setChatLoading(false);
    }
  };

  // ── Repo selection ───────────────────────────────────────────────────

  const selectRepo = (repo: RepoEntry) => {
    setActiveRepo(repo);
    setMessages([]);

    if (repo.phase1_status === "complete") {
      setMessages([
        {
          id: `status-select-${Date.now()}`,
          role: "status",
          content: `Connected to ${repo.org}/${repo.repo}. Ask anything about the codebase.${
            repo.phase2_status !== "complete"
              ? " (AI summaries are still generating in the background)"
              : ""
          }`,
        },
      ]);
    } else if (repo.phase1_status === "running") {
      setMessages([
        {
          id: `status-running-${Date.now()}`,
          role: "status",
          content: `Scanning ${repo.org}/${repo.repo}... Chat will be available once Phase 1 completes.`,
        },
      ]);
    } else {
      setMessages([
        {
          id: `status-pending-${Date.now()}`,
          role: "status",
          content: `${repo.org}/${repo.repo} is not indexed yet. Start a scan from the URL field.`,
        },
      ]);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return <UsernameScreen onSubmit={handleLogin} />;
  }

  const canChat = activeRepo?.phase1_status === "complete";

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ background: "#080808" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-4">
          <a href="/">
            <img src="/logo.png" alt="XMem" className="h-7 w-auto invert" />
          </a>
          <div className="w-px h-5 bg-white/10" />
          <span className="text-xs text-white/40 uppercase tracking-widest">
            Scanner
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/50">{username}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ──────────────────────────────────────────── */}
        <aside
          className="w-80 flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* URL Input */}
          <form
            onSubmit={handleSubmitUrl}
            className="p-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
              Repository URL
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                setInputError("");
                setShowPat(false);
                setEstimates(null);
              }}
              placeholder="https://github.com/org/repo"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors font-mono"
            />

            {showPat && (
              <div className="mt-3">
                <label className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-widest mb-2">
                  <Lock className="w-3 h-3" />
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors font-mono"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
              />
              <button
                type="submit"
                disabled={!githubUrl.trim() || scanning || validating}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: githubUrl.trim()
                    ? "white"
                    : "rgba(255,255,255,0.08)",
                  color: githubUrl.trim()
                    ? "black"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {scanning || validating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <GitBranch className="w-3 h-3" />
                )}
                Scan
              </button>
            </div>

            {inputError && (
              <p className="mt-2 text-xs text-white/50">{inputError}</p>
            )}

            {estimates && (
              <div
                className="mt-3 rounded-lg p-3 space-y-1.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[10px] text-white/35 leading-snug">
                  {estimates.estimate_disclaimer}
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-white/45">
                  <span>Phase 1 (est.)</span>
                  <span className="text-white/60 text-right">
                    ~{estimates.estimated_phase1_seconds}s
                  </span>
                  <span>Embedding tokens (est.)</span>
                  <span className="text-white/60 text-right">
                    ~{estimates.estimated_embedding_tokens.toLocaleString()}
                  </span>
                  <span>Phase 2 LLM tokens (est.)</span>
                  <span className="text-white/60 text-right">
                    ~{estimates.estimated_phase2_llm_tokens.toLocaleString()}
                  </span>
                  <span>Cost (est.)</span>
                  <span className="text-white/60 text-right">
                    {estimates.estimated_cost_usd != null
                      ? `~$${estimates.estimated_cost_usd.toFixed(4)}`
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </form>

          {/* Repositories */}
          <div className="flex-1 p-5">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Repositories
            </div>

            {repos.length === 0 ? (
              <p className="text-xs text-white/20">
                No repositories scanned yet
              </p>
            ) : (
              <div className="space-y-1">
                {repos.map((r) => {
                  const isActive =
                    activeRepo?.org === r.org &&
                    activeRepo?.repo === r.repo;

                  return (
                    <button
                      key={`${r.org}/${r.repo}`}
                      onClick={() => selectRepo(r)}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 font-medium text-xs truncate">
                          {r.org}/{r.repo}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={r.phase1_status} />
                          <StatusDot status={r.phase2_status} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/30" style={{ fontSize: "10px" }}>
                          P1: {r.phase1_status}
                        </span>
                        <span className="text-white/30" style={{ fontSize: "10px" }}>
                          P2: {r.phase2_status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── Right Panel — Chat ──────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          {!activeRepo ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h2
                  className="text-lg font-semibold text-white/30"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  No repository selected
                </h2>
                <p className="text-sm text-white/15 mt-2 max-w-sm">
                  Enter a GitHub URL on the left to scan a repository,
                  then chat with it here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div
                className="flex items-center justify-between px-6 py-3 flex-shrink-0"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white/70">
                    {activeRepo.org}/{activeRepo.repo}
                  </span>
                  <div
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <StatusDot status={activeRepo.phase1_status} />
                    <span className="text-white/40" style={{ fontSize: "10px" }}>
                      {activeRepo.phase1_status === "complete"
                        ? activeRepo.phase2_status === "complete"
                          ? "Fully indexed"
                          : "Searchable (enriching...)"
                        : activeRepo.phase1_status === "running"
                          ? "Scanning..."
                          : activeRepo.phase1_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-3xl ${msg.role === "user" ? "ml-auto" : ""}`}
                  >
                    {msg.role === "status" ? (
                      <div
                        className="flex items-start gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <Circle className="w-3 h-3 text-white/30 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-white/40">
                          {msg.content}
                        </span>
                      </div>
                    ) : msg.role === "user" ? (
                      <div
                        className="inline-block px-4 py-2.5 rounded-xl text-sm text-white"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                        }}
                      >
                        {msg.content}
                      </div>
                    ) : (
                      <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {msg.content ||
                          (chatLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                          ) : null)}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div
                className="px-6 py-4 flex-shrink-0"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      canChat
                        ? "Ask anything about the codebase..."
                        : "Waiting for scan to complete..."
                    }
                    disabled={!canChat || chatLoading}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-30"
                  />
                  <button
                    type="submit"
                    disabled={!canChat || !chatInput.trim() || chatLoading}
                    className="p-3 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    style={{
                      background:
                        canChat && chatInput.trim()
                          ? "white"
                          : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Send
                      className="w-4 h-4"
                      style={{
                        color:
                          canChat && chatInput.trim()
                            ? "black"
                            : "rgba(255,255,255,0.3)",
                      }}
                    />
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
