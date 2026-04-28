import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  X,
  Circle,
  GitBranch,
  Lock,
  MessageSquare,
  Search,
  Globe,
  Star,
  Copy,
  Menu,
  AlertTriangle,
  Pause,
  Play,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

function authBearerHeaders(token: string | null): HeadersInit {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function authJsonHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

interface RepoEntry {
  org: string;
  repo: string;
  phase1_status: string;
  phase2_status: string;
  /** When true, any scanner user may query this index (saves re-scan cost for others). */
  share_index_publicly?: boolean;
  stats?: any;
  phase2_stats?: any;
  error?: string;
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
  toolCalls?: any[];
  isError?: boolean;
}

interface CommunityItem {
  org: string;
  repo: string;
  star_count: number;
  starred_by_me: boolean;
}

function StatusDot({ status }: { status: string }) {
  if (status === "complete")
    return <div className="w-2 h-2 rounded-full bg-white" />;
  if (status === "running")
    return <Loader2 className="w-3 h-3 text-white/60 animate-spin" />;
  if (status === "failed")
    return <X className="w-3 h-3 text-red-400/80" />;
  if (status === "paused")
    return <Pause className="w-3 h-3 text-yellow-400/80" />;
  return <Circle className="w-2 h-2 text-white/20" />;
}

function LoginPromptScreen() {
  const loginHref = `/login?returnUrl=${encodeURIComponent("/scanner")}`;

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
            Sign in to index repositories and chat with your codebase using your account.
          </p>
        </div>

        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <a
            href={loginHref}
            className="inline-flex w-full justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200"
            style={{
              background: "white",
              color: "black",
            }}
          >
            Sign in
          </a>
          <p className="mt-4 text-[11px] text-white/35 leading-relaxed">
            The scanner uses your authenticated session and API access. Anonymous display names are no longer supported here.
          </p>
        </div>

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
  const { user, token, logout: authLogout, isAuthenticated, isLoading } =
    useAuth();

  const username = user?.username ?? user?.name ?? "";

  const [githubUrl, setGithubUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [validating, setValidating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [inputError, setInputError] = useState("");
  const [scanError, setScanError] = useState("");
  const [estimates, setEstimates] = useState<ScanEstimates | null>(null);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);

  const [repos, setRepos] = useState<RepoEntry[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepoEntry | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [sharingSaving, setSharingSaving] = useState(false);
  const [scannerTab, setScannerTab] = useState<"mine" | "community">("mine");
  const [communityItems, setCommunityItems] = useState<CommunityItem[]>([]);
  const [communityTotal, setCommunityTotal] = useState(0);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [communitySort, setCommunitySort] = useState<"stars" | "recent">("stars");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const indexingRepos = useMemo(() => {
    const pred = (r: RepoEntry) =>
      r.phase1_status === "running" ||
      r.phase2_status === "running" ||
      r.phase2_status === "pending";
    const fromList = repos.filter(pred);
    const keys = new Set(fromList.map((r) => `${r.org}/${r.repo}`));
    if (
      activeRepo &&
      pred(activeRepo) &&
      !keys.has(`${activeRepo.org}/${activeRepo.repo}`)
    ) {
      return [...fromList, activeRepo];
    }
    return fromList;
  }, [repos, activeRepo]);

  const visibleRepos = useMemo(
    () => repos.filter((r) => r.phase1_status !== "failed"),
    [repos],
  );

  // ── Load persisted repos from API ─────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !token || !username.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(
          `${API_URL}/v1/scanner/repos?username=${encodeURIComponent(username)}`,
          { headers: authBearerHeaders(token) },
        );
        const data = await resp.json();
        if (cancelled || data.status !== "ok" || !Array.isArray(data.repos)) return;
        setRepos(
          data.repos.map((r: RepoEntry) => ({
            org: r.org,
            repo: r.repo,
            phase1_status: r.phase1_status || "not_started",
            phase2_status: r.phase2_status || "not_started",
            share_index_publicly:
              r.share_index_publicly !== undefined ? r.share_index_publicly : true,
          })),
        );
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, username]);

  // ── Community catalog ───────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !token || !username.trim() || scannerTab !== "community")
      return;

    let cancelled = false;
    (async () => {
      setCommunityLoading(true);
      try {
        const params = new URLSearchParams({
          username: username.trim(),
          q: communitySearch.trim(),
          sort: communitySort,
          limit: "80",
          offset: "0",
        });
        const resp = await fetch(`${API_URL}/v1/scanner/community?${params}`, {
          headers: authBearerHeaders(token),
        });
        const data = await resp.json();
        if (cancelled || data.status !== "ok") return;
        setCommunityItems(Array.isArray(data.items) ? data.items : []);
        setCommunityTotal(typeof data.total === "number" ? data.total : 0);
      } catch {
        if (!cancelled) setCommunityItems([]);
      } finally {
        if (!cancelled) setCommunityLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, username, scannerTab, communitySearch, communitySort]);

  // ── Poll in-progress scans (catalog-aware) ──────────────────────────

  useEffect(() => {
    if (!token || !username || indexingRepos.length === 0) return;

    const interval = setInterval(async () => {
      for (const repo of indexingRepos) {
        try {
          const resp = await fetch(
            `${API_URL}/v1/scanner/catalog-status?username=${encodeURIComponent(username)}&org_id=${encodeURIComponent(repo.org)}&repo=${encodeURIComponent(repo.repo)}`,
            { headers: authBearerHeaders(token) },
          );
          const data = await resp.json();

          setRepos((prev) =>
            prev.map((r) =>
              r.org === repo.org && r.repo === repo.repo
                ? {
                    ...r,
                    phase1_status: data.phase1_status,
                    phase2_status: data.phase2_status,
                    stats: data.stats,
                    phase2_stats: data.phase2_stats,
                    error: data.error || undefined,
                    share_index_publicly:
                      data.share_index_publicly !== undefined
                        ? data.share_index_publicly
                        : r.share_index_publicly,
                  }
                : r,
            ),
          );

          setActiveRepo((prev) => {
            if (prev?.org === repo.org && prev?.repo === repo.repo) {
              const updatedRepo = {
                ...prev,
                phase1_status: data.phase1_status,
                phase2_status: data.phase2_status,
                stats: data.stats,
                phase2_stats: data.phase2_stats,
                error: data.error || undefined,
                share_index_publicly:
                  data.share_index_publicly !== undefined
                    ? data.share_index_publicly
                    : prev.share_index_publicly,
              };

              if (
                data.phase1_status === "complete" &&
                prev.phase1_status === "running"
              ) {
                setMessages((msgs) => [
                  ...msgs,
                  {
                    id: `status-ready-${Date.now()}`,
                    role: "status",
                    content: `Phase 1 complete. ${repo.org}/${repo.repo} is now searchable. Ask anything about the codebase.`,
                  },
                ]);
              }

              if (
                data.phase1_status === "failed" &&
                prev.phase1_status === "running"
              ) {
                const errMsg = data.error || "Scan failed unexpectedly.";
                setScanError(errMsg);
                setEstimates(null);
                setMessages((msgs) => [
                  ...msgs,
                  {
                    id: `status-fail-${Date.now()}`,
                    role: "status",
                    content: `Scan failed: ${errMsg}`,
                  },
                ]);
              }

              if (
                data.phase2_status === "failed" &&
                prev.phase2_status === "running"
              ) {
                const errMsg = data.error || "Phase 2 enrichment failed.";
                setScanError(errMsg);
              }

              // Clear estimates when both phases are done
              if (
                data.phase1_status === "complete" &&
                (data.phase2_status === "complete" || data.phase2_status === "failed")
              ) {
                setEstimates(null);
              }

              return updatedRepo;
            }
            return prev;
          });
        } catch {
          /* silently ignore polling errors */
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [indexingRepos, username, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auth ─────────────────────────────────────────────────────────────

  const handleLogout = () => {
    authLogout();
    setRepos([]);
    setActiveRepo(null);
    setMessages([]);
    setScannerTab("mine");
    setCommunityItems([]);
  };

  const fetchBranches = async (url: string) => {
    if (!url.trim() || !token) return;
    setBranchesLoading(true);
    setAvailableBranches([]);
    try {
      const params = new URLSearchParams({
        github_url: url.trim(),
        pat: pat.trim(),
      });
      const resp = await fetch(
        `${API_URL}/v1/scanner/branches?${params}`,
        { headers: authBearerHeaders(token) },
      );
      const data = await resp.json();
      if (data.status === "ok" && Array.isArray(data.branches)) {
        setAvailableBranches(data.branches);
        if (data.default_branch) setBranch(data.default_branch);
      }
    } catch {
      // Fall back to manual text input (availableBranches stays empty)
    } finally {
      setBranchesLoading(false);
    }
  };

  const handlePauseScan = async () => {
    if (!activeRepo || !username) return;
    setPausing(true);
    try {
      const resp = await fetch(`${API_URL}/v1/scanner/pause`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          username,
          org_id: activeRepo.org,
          repo: activeRepo.repo,
        }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        const update = (r: RepoEntry) =>
          r.org === activeRepo.org && r.repo === activeRepo.repo
            ? { ...r, phase1_status: data.phase1_status || "paused", phase2_status: data.phase2_status || r.phase2_status }
            : r;
        setRepos((prev) => prev.map(update));
        setActiveRepo((prev) => prev ? update(prev) : prev);
        setMessages((msgs) => [
          ...msgs,
          { id: `paused-${Date.now()}`, role: "status", content: "Indexing paused." },
        ]);
      } else {
        setScanError(data.error || "Failed to pause scan.");
      }
    } catch {
      setScanError("Network error while pausing scan.");
    } finally {
      setPausing(false);
    }
  };

  const handleResumeScan = async () => {
    if (!activeRepo || !username) return;
    setResuming(true);
    setScanError("");
    try {
      const resp = await fetch(`${API_URL}/v1/scanner/resume`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          username,
          org_id: activeRepo.org,
          repo: activeRepo.repo,
        }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        const update = (r: RepoEntry) =>
          r.org === activeRepo.org && r.repo === activeRepo.repo
            ? { ...r, phase1_status: data.phase1_status || r.phase1_status, phase2_status: data.phase2_status || r.phase2_status, error: undefined }
            : r;
        setRepos((prev) => prev.map(update));
        setActiveRepo((prev) => prev ? update(prev) : prev);
        setMessages((msgs) => [
          ...msgs,
          { id: `resumed-${Date.now()}`, role: "status", content: "Indexing resumed." },
        ]);
      } else {
        setScanError(data.error || "Failed to resume scan.");
      }
    } catch {
      setScanError("Network error while resuming scan.");
    } finally {
      setResuming(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('```').map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const lang = lines.shift();
        return (
          <pre key={index} className="bg-black/30 p-4 rounded-lg my-3 overflow-x-auto border border-white/5 shadow-inner">
            {lang && <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 select-none">{lang}</div>}
            <code className="text-[13px] font-mono text-white/80 leading-relaxed font-light">{lines.join('\n')}</code>
          </pre>
        );
      }
      
      let html = part
        .replace(/^#### (.*?)$/gm, '<h4 class="text-base font-bold text-white mt-3 mb-1">$1</h4>')
        .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-white mt-5 mb-3">$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
        .replace(/^---+\s*$/gm, '<hr class="border-white/10 my-6" />')
        // table row parsing
        .replace(/^\|(.*?)\| ?$/gm, (match, p1) => {
          if (p1.replace(/[-:\s|]/g, '').length === 0) return '';
          const cells = p1.split('|').map((c: string) => `<td class="border-b border-white/5 bg-white/[0.01] px-4 py-2.5 text-white/80 whitespace-normal align-top leading-relaxed">${c.trim()}</td>`).join('');
          return `<tr class="hover:bg-white/[0.03] transition-colors">${cells}</tr>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-white">$1</strong>')
        .replace(/`([^`\n]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono text-white/90">$1</code>')
        .replace(/^[\*-] (.*?)$/gm, '<li class="ml-4 list-disc mt-1">$1</li>')
        .replace(/\n/g, '<br/>')
        .replace(/<\/h1><br\/>/g, '</h1>')
        .replace(/<\/h2><br\/>/g, '</h2>')
        .replace(/<\/h3><br\/>/g, '</h3>')
        .replace(/<\/h4><br\/>/g, '</h4>')
        .replace(/<hr class="border-white\/10 my-6" \/><br\/>/g, '<hr class="border-white/10 my-6" />')
        .replace(/<\/li><br\/>/g, '</li>')
        // aggregate table rows into a full table
        .replace(/(<tr class="hover:bg-white\/\[0\.03\] transition-colors">.*?<\/tr>(?:<br\/>)*)+/g, (match) => {
          const cleanMatch = match.replace(/<br\/>/g, '');
          return `<div class="rounded-xl overflow-x-auto border border-white/10 my-6 bg-black/40"><table class="w-full text-left text-sm border-collapse"><tbody>${cleanMatch}</tbody></table></div>`;
        });

      return <span key={index} className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  // ── Scan ─────────────────────────────────────────────────────────────

  const triggerScan = async (overrideBranch?: string) => {
    if (!githubUrl.trim()) return;
    setInputError("");
    setScanning(true);

    const effectiveBranch = (overrideBranch ?? branch).trim() || "main";

    try {
      const resp = await fetch(`${API_URL}/v1/scanner/scan`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          github_url: githubUrl.trim(),
          username,
          pat: pat.trim(),
          branch: effectiveBranch,
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
        share_index_publicly: true,
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
      // Keep estimates visible during scan — cleared when both phases complete

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
        headers: authJsonHeaders(token),
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
        const effectiveBranch = data.default_branch || branch;
        if (data.default_branch) setBranch(data.default_branch);
        if (data.estimates) setEstimates(data.estimates as ScanEstimates);
        // Yield so the estimate panel can paint before the long-running scan starts.
        await new Promise((r) => setTimeout(r, 80));
        await triggerScan(effectiveBranch);
        return;
      }

      setInputError(data.error || "Could not access repository");
    } catch {
      setInputError("Network error. Is the API server running?");
    } finally {
      setValidating(false);
    }
  };

  // ── Community index sharing (catalog visibility) ─────────────────────

  const setShareIndexPublicly = async (next: boolean) => {
    if (!activeRepo || activeRepo.phase1_status !== "complete") return;
    setSharingSaving(true);
    try {
      const resp = await fetch(`${API_URL}/v1/scanner/index-visibility`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          username,
          org_id: activeRepo.org,
          repo: activeRepo.repo,
          share_index_publicly: next,
        }),
      });
      const data = await resp.json();
      if (data.status === "error") {
        setMessages((m) => [
          ...m,
          {
            id: `share-err-${Date.now()}`,
            role: "status",
            content: data.error || "Could not update sharing.",
          },
        ]);
        return;
      }
      const v = Boolean(data.share_index_publicly);
      setActiveRepo((p) => (p ? { ...p, share_index_publicly: v } : p));
      setRepos((prev) =>
        prev.map((r) =>
          r.org === activeRepo.org && r.repo === activeRepo.repo
            ? { ...r, share_index_publicly: v }
            : r,
        ),
      );
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `share-net-${Date.now()}`,
          role: "status",
          content: "Network error updating sharing.",
        },
      ]);
    } finally {
      setSharingSaving(false);
    }
  };

  const openCommunityRepo = async (org: string, repoName: string) => {
    try {
      const resp = await fetch(
        `${API_URL}/v1/scanner/catalog-status?username=${encodeURIComponent(username)}&org_id=${encodeURIComponent(org)}&repo=${encodeURIComponent(repoName)}`,
        { headers: authBearerHeaders(token) },
      );
      const data = await resp.json();
      const entry: RepoEntry = {
        org,
        repo: repoName,
        phase1_status: data.phase1_status || "not_started",
        phase2_status: data.phase2_status || "not_started",
        share_index_publicly: data.share_index_publicly !== false,
        stats: data.stats,
        phase2_stats: data.phase2_stats,
      };
      setActiveRepo(entry);
      setMessages([
        {
          id: `comm-open-${Date.now()}`,
          role: "status",
          content: `Opened ${org}/${repoName} from the community catalog. Ask questions about this codebase.`,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `comm-fail-${Date.now()}`,
          role: "status",
          content: "Could not load repository status. Try again.",
        },
      ]);
    }
  };

  const toggleCommunityStar = async (
    org: string,
    repoName: string,
    nextStarred: boolean,
  ) => {
    setCommunityItems((prev) =>
      prev.map((it) =>
        it.org === org && it.repo === repoName
          ? {
              ...it,
              starred_by_me: nextStarred,
              star_count: Math.max(
                0,
                it.star_count + (nextStarred ? 1 : -1),
              ),
            }
          : it,
      ),
    );
    try {
      const resp = await fetch(`${API_URL}/v1/scanner/community/star`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          username,
          org_id: org,
          repo: repoName,
          starred: nextStarred,
        }),
      });
      const data = await resp.json();
      if (data.status === "error") {
        setCommunityItems((prev) =>
          prev.map((it) =>
            it.org === org && it.repo === repoName
              ? {
                  ...it,
                  starred_by_me: !nextStarred,
                  star_count: Math.max(
                    0,
                    it.star_count + (nextStarred ? -1 : 1),
                  ),
                }
              : it,
          ),
        );
        return;
      }
      if (typeof data.star_count === "number") {
        setCommunityItems((prev) =>
          prev.map((it) =>
            it.org === org && it.repo === repoName
              ? {
                  ...it,
                  star_count: data.star_count,
                  starred_by_me: data.starred,
                }
              : it,
          ),
        );
      }
    } catch {
      setCommunityItems((prev) =>
        prev.map((it) =>
          it.org === org && it.repo === repoName
            ? {
                ...it,
                starred_by_me: !nextStarred,
                star_count: Math.max(
                  0,
                  it.star_count + (nextStarred ? -1 : 1),
                ),
              }
            : it,
        ),
      );
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
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          org_id: activeRepo.org,
          repo: activeRepo.repo,
          query: userMsg.content,
          username,
          top_k: 10,
        }),
      });

      if (!resp.ok) {
        let msg = "You do not have access to chat on this index.";
        try {
          const errBody = await resp.json();
          if (errBody?.error && typeof errBody.error === "string") {
            msg = errBody.error;
          }
        } catch {
          /* use default */
        }
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.id === assistantId) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: msg },
            ];
          }
          return prev;
        });
        return;
      }

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
            
            if (chunk.type === "status") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `status-${Date.now()}`,
                  role: "status",
                  content: chunk.content,
                },
              ]);
            } else if (chunk.type === "error") {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last.id === assistantId) {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...last,
                      content: "Server is busy, please try again later.",
                      isError: true,
                    },
                  ];
                }
                return prev;
              });
            } else if (chunk.type === "tool_calls") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, toolCalls: [...(m.toolCalls || []), ...chunk.tools] } : m
                )
              );
            } else if (chunk.type === "chunk") {
              const textToAdd = chunk.text || "";
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
    setScanError("");

    if (repo.phase1_status === "complete") {
      setMessages([
        {
          id: `status-select-${Date.now()}`,
          role: "status",
          content: `Connected to ${repo.org}/${repo.repo}. Ask anything about the codebase.${
            repo.phase2_status === "failed"
              ? " (Warning: AI enrichment failed, falling back to AST summaries)"
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

  if (isLoading) {
    return (
      <div
        className="dark min-h-screen flex items-center justify-center"
        style={{ background: "#080808" }}
      >
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <LoginPromptScreen />;
  }

  const canChat = activeRepo?.phase1_status === "complete" && 
                  activeRepo?.phase2_status !== "running" && 
                  activeRepo?.phase2_status !== "pending";

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ background: "#080808" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-white/70 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <a href="/">
            <img src="/logo.png" alt="XMem" className="h-6 md:h-7 w-auto invert" />
          </a>
          <div className="hidden md:block w-px h-5 bg-white/10" />
          <span className="hidden md:inline text-xs text-white/40 uppercase tracking-widest">
            Scanner
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <span className="text-xs md:text-sm text-white/50 truncate max-w-[100px] md:max-w-none">
            {user?.username ?? user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        {/* ── Left Panel ──────────────────────────────────────────── */}
        <aside
          className={`absolute md:relative z-50 w-72 md:w-80 h-full flex-shrink-0 flex flex-col min-h-0 overflow-hidden bg-[#0a0a0a] transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="flex-shrink-0 flex gap-1 p-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              onClick={() => setScannerTab("mine")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                scannerTab === "mine"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              My catalog
            </button>
            <button
              type="button"
              onClick={() => setScannerTab("community")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                scannerTab === "community"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Community
            </button>
          </div>

          {scannerTab === "mine" ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
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
                setAvailableBranches([]);
                setBranch("");
              }}
              onBlur={() => {
                if (githubUrl.trim()) fetchBranches(githubUrl);
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
              {branchesLoading ? (
                <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5">
                  <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                  <span className="text-xs text-white/30">Loading branches...</span>
                </div>
              ) : availableBranches.length > 0 ? (
                <div className="flex-1 relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-white/25 transition-colors pr-7 cursor-pointer"
                  >
                    {availableBranches.map((b) => (
                      <option key={b} value={b} className="bg-[#111] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-white/30 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
                />
              )}
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
              <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300/90 leading-relaxed">{inputError}</p>
              </div>
            )}


          </form>

          {/* Repositories */}
          <div className="flex-1 p-5">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Repositories
            </div>

            {visibleRepos.length === 0 ? (
              <p className="text-xs text-white/20">
                No repositories scanned yet
              </p>
            ) : (
              <div className="space-y-1">
                {visibleRepos.map((r) => {
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
                          {(r.share_index_publicly !== false) && (
                            <span className="shrink-0" aria-label="Community index sharing on">
                              <Globe className="w-3 h-3 text-emerald-400/80" />
                            </span>
                          )}
                          {r.share_index_publicly === false && (
                            <span className="shrink-0" aria-label="Index private to scanners of this repo">
                              <Lock className="w-3 h-3 text-white/25" />
                            </span>
                          )}
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
          </div>
          ) : (
          <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">
            <p className="text-[10px] text-white/35 leading-relaxed">
              Public indexes anyone can open — star repos you care about. No link required.
            </p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/25 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                placeholder="Search org or repo…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCommunitySort("stars")}
                className={`flex-1 rounded-md px-2 py-1.5 text-[10px] uppercase tracking-wider ${
                  communitySort === "stars"
                    ? "bg-white/12 text-white"
                    : "bg-white/5 text-white/40 hover:text-white/65"
                }`}
              >
                Most stars
              </button>
              <button
                type="button"
                onClick={() => setCommunitySort("recent")}
                className={`flex-1 rounded-md px-2 py-1.5 text-[10px] uppercase tracking-wider ${
                  communitySort === "recent"
                    ? "bg-white/12 text-white"
                    : "bg-white/5 text-white/40 hover:text-white/65"
                }`}
              >
                Recent
              </button>
            </div>
            <p className="text-[10px] text-white/30">
              {communityLoading ? "Loading…" : `${communityTotal} in catalog`}
            </p>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1">
              {communityLoading && communityItems.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : (
                communityItems.map((it) => {
                  const isActive =
                    activeRepo?.org === it.org && activeRepo?.repo === it.repo;
                  return (
                    <div
                      key={`${it.org}/${it.repo}`}
                      className="rounded-lg border border-white/6 px-2 py-2"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openCommunityRepo(it.org, it.repo)}
                          className="flex-1 text-left min-w-0"
                        >
                          <span className="text-white/85 font-mono text-[11px] block truncate">
                            {it.org}/{it.repo}
                          </span>
                          <span className="text-[10px] text-white/35">
                            Tap to chat
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCommunityStar(it.org, it.repo, !it.starred_by_me);
                          }}
                          className={`flex flex-col items-center shrink-0 rounded-md px-1.5 py-1 transition-colors ${
                            it.starred_by_me
                              ? "text-amber-400/90"
                              : "text-white/35 hover:text-white/55"
                          }`}
                          title={it.starred_by_me ? "Unstar" : "Star"}
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={it.starred_by_me ? "currentColor" : "none"}
                          />
                          <span className="text-[9px] tabular-nums mt-0.5">
                            {it.star_count}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              {!communityLoading && communityItems.length === 0 && (
                <p className="text-xs text-white/25 py-6 text-center px-2">
                  No public indexes yet. Scan a repo and enable community sharing, or wait for
                  indexes to finish indexing.
                </p>
              )}
            </div>
          </div>
          )}
        </aside>

        {/* ── Right Panel — Chat ──────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Scan error banner */}
          {scanError && (
            <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-300/90 truncate">{scanError}</p>
              </div>
              <button
                onClick={() => setScanError("")}
                className="text-red-400/60 hover:text-red-300 transition-colors shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!activeRepo ? (
            <div className="flex-1 flex flex-col items-center p-8 bg-[#0A0A0A] overflow-y-auto custom-scrollbar">
              <div className="w-full max-w-3xl mt-12 mb-8">
                <h2 className="text-3xl text-white/90 font-medium mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Indexed Repositories</h2>
                <p className="text-white/40 text-sm mb-8">
                  Select a repository from <span className="text-white/55">My catalog</span>, or open the{" "}
                  <span className="text-white/55">Community</span> tab to browse public indexes, star repos, and chat without sharing links.
                </p>
                
                <div className="relative mb-6 leading-none">
                  <Search className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search your analyzed repositories..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="grid gap-3">
                  {visibleRepos.filter(r => r.repo.toLowerCase().includes(repoSearch.toLowerCase()) || r.org.toLowerCase().includes(repoSearch.toLowerCase())).map((repo) => (
                    <div
                      key={`${repo.org}/${repo.repo}`}
                      onClick={() => { setActiveRepo(repo); setMessages([]); }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl cursor-pointer transition-all duration-300"
                    >
                      <div>
                        <div className="text-white/90 font-medium flex items-center gap-2">
                          <span className="text-white/30 font-normal">{repo.org}</span>
                          <span className="text-white/30">/</span>
                          <span className="">{repo.repo}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0">
                         <span className={`text-[10px] px-3 py-1 uppercase tracking-wider rounded-full ${repo.phase1_status === 'complete' ? 'bg-[#ff3366]/10 text-[#ff3366]' : 'bg-yellow-500/10 text-yellow-500'}`}>P1: {repo.phase1_status}</span>
                         <span className={`text-[10px] px-3 py-1 uppercase tracking-wider rounded-full ${repo.phase2_status === 'complete' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'bg-yellow-500/10 text-yellow-500'}`}>P2: {repo.phase2_status}</span>
                      </div>
                    </div>
                  ))}
                  {repos.length === 0 && <div className="text-white/20 text-sm py-12 text-center rounded-xl bg-white/[0.01] border border-white/5 border-dashed">No repositories found. Paste a link on the left to scan one.</div>}
                </div>
              </div>
            </div>
          ) : !canChat && !scanError && (
              activeRepo.phase1_status === "paused" ||
              activeRepo.phase2_status === "paused"
          ) ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/20">
               <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
                 <Pause className="w-8 h-8 text-yellow-400" />
               </div>
               <h2 className="text-2xl font-medium text-white/90 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 Indexing Paused
               </h2>
               <p className="text-sm text-white/40 mb-2 max-w-md text-center leading-relaxed">
                 {activeRepo.org}/{activeRepo.repo}
               </p>
               <p className="text-xs text-white/30 mb-6 max-w-md text-center">
                 {activeRepo.phase1_status === "paused"
                   ? "Phase 1 (AST indexing) was paused. Resume to continue from where it stopped."
                   : "Phase 2 (LLM enrichment) was paused. Resume to continue from where it stopped."}
               </p>

               <button
                 onClick={handleResumeScan}
                 disabled={resuming}
                 className="mb-4 flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
               >
                 {resuming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                 Continue Indexing
               </button>
               <button
                 onClick={() => { setActiveRepo(null); setScanError(""); }}
                 className="px-4 py-2 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
               >
                 Back to repositories
               </button>
             </div>
          ) : !canChat && !scanError && (
              activeRepo.phase1_status === "running" || 
              activeRepo.phase1_status === "pending" || 
              activeRepo.phase2_status === "running" || 
              activeRepo.phase2_status === "pending"
          ) ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/20">
               <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-6" />
               <h2 className="text-2xl font-medium text-white/90 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 {activeRepo.phase1_status !== "complete" ? "Indexing Repository" : "Enriching via LLM"}
               </h2>
               <p className="text-sm text-white/40 mb-4 max-w-md text-center leading-relaxed">
                 {activeRepo.phase1_status !== "complete" 
                   ? "Parsing ASTs, generating code embeddings, and extracting symbol definitions." 
                   : "Generating AI-powered summaries for all codebase files and symbols."}
               </p>

               {/* Pause button */}
               <button
                 onClick={handlePauseScan}
                 disabled={pausing}
                 className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
               >
                 {pausing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                 Pause Indexing
               </button>

               {/* Scan Estimates Panel */}
               {estimates && (
                 <div
                   className="w-full max-w-md rounded-xl p-5 mb-6 border border-white/5 shadow-2xl"
                   style={{ background: "rgba(255,255,255,0.02)" }}
                 >
                   <div className="text-xs text-white/30 uppercase tracking-widest mb-4 pb-3 border-b border-white/5">Scan Estimates</div>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                     <span className="text-white/40">Phase 1 (est.)</span>
                     <span className="text-white/60 text-right font-mono">~{estimates.estimated_phase1_seconds}s</span>
                     <span className="text-white/40">Embedding tokens</span>
                     <span className="text-white/60 text-right font-mono">~{estimates.estimated_embedding_tokens.toLocaleString()}</span>
                     <span className="text-white/40">Phase 2 LLM tokens</span>
                     <span className="text-white/60 text-right font-mono">~{estimates.estimated_phase2_llm_tokens.toLocaleString()}</span>
                   </div>
                   <p className="text-[10px] text-white/25 mt-3 leading-snug">{estimates.estimate_disclaimer}</p>
                 </div>
               )}
               
               {activeRepo.phase1_status !== "complete" ? (
                 <div className="w-full max-w-md bg-white/[0.02] rounded-xl p-6 border border-white/5 shadow-2xl">
                 <div className="flex justify-between text-xs text-white/30 uppercase tracking-widest mb-6 pb-4 border-b border-white/5">
                   <span>Progress Stats</span>
                   <span>Phase 1</span>
                 </div>
                 <div className="space-y-5">
                   <div className="flex justify-between items-center group">
                     <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Files Processed</span>
                     <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">
                       {activeRepo.stats?.files_processed || 0}
                       {activeRepo.stats?.total_files_to_process ? ` / ${activeRepo.stats.total_files_to_process}` : ''}
                     </span>
                   </div>
                   
                   {activeRepo.stats?.total_files_to_process && (
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 mb-3">
                       <div 
                         className="h-full bg-white/40 transition-all duration-500 ease-out" 
                         style={{ width: `${Math.min(100, Math.round(((activeRepo.stats?.files_processed || 0) / activeRepo.stats.total_files_to_process) * 100))}%` }}
                       />
                     </div>
                   )}
                   <div className="flex justify-between items-center group">
                     <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Symbols Indexed</span>
                     <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">{activeRepo.stats?.symbols_indexed || 0}</span>
                   </div>
                   <div className="flex justify-between items-center group">
                     <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Files Written</span>
                     <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">{activeRepo.stats?.files_written || 0}</span>
                   </div>
                   <div className="flex justify-between items-center group">
                     <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Call Edges Created</span>
                     <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">{activeRepo.stats?.call_edges_created || 0}</span>
                   </div>
                 </div>
               </div>
               ) : (
                 // PHASE 2 DASHBOARD
                 <div className="w-full max-w-md bg-white/[0.02] rounded-xl p-6 border border-white/5 shadow-2xl">
                   <div className="flex justify-between text-xs text-white/30 uppercase tracking-widest mb-6 pb-4 border-b border-white/5">
                     <span>Progress Stats</span>
                     <span>Phase 2</span>
                   </div>
                   <div className="space-y-5">
                     <div className="flex justify-between items-center group">
                       <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Files Enriched</span>
                       <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">
                         {activeRepo.phase2_stats?.files_enriched || 0}
                         {activeRepo.phase2_stats?.total_files_to_enrich ? ` / ${activeRepo.phase2_stats.total_files_to_enrich}` : ''}
                       </span>
                     </div>
                     {activeRepo.phase2_stats?.total_files_to_enrich && (
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 mb-3">
                         <div 
                           className="h-full bg-white/40 transition-all duration-500 ease-out" 
                           style={{ width: `${Math.min(100, Math.round(((activeRepo.phase2_stats?.files_enriched || 0) / activeRepo.phase2_stats.total_files_to_enrich) * 100))}%` }}
                         />
                       </div>
                     )}
                     <div className="flex justify-between items-center group">
                       <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Symbols Enriched</span>
                       <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">
                         {activeRepo.phase2_stats?.symbols_enriched || 0}
                         {activeRepo.phase2_stats?.total_symbols_to_enrich ? ` / ${activeRepo.phase2_stats.total_symbols_to_enrich}` : ''}
                       </span>
                     </div>
                     {activeRepo.phase2_stats?.total_symbols_to_enrich && (
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 mb-3">
                         <div 
                           className="h-full bg-white/40 transition-all duration-500 ease-out" 
                           style={{ width: `${Math.min(100, Math.round(((activeRepo.phase2_stats?.symbols_enriched || 0) / activeRepo.phase2_stats.total_symbols_to_enrich) * 100))}%` }}
                         />
                       </div>
                     )}
                     <div className="flex justify-between items-center group">
                       <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Directories Enriched</span>
                       <span className="text-white/90 font-mono text-sm bg-white/5 px-2 py-1 rounded">
                         {activeRepo.phase2_stats?.directories_enriched || 0}
                         {activeRepo.phase2_stats?.total_directories_to_enrich ? ` / ${activeRepo.phase2_stats.total_directories_to_enrich}` : ''}
                       </span>
                     </div>
                     {activeRepo.phase2_stats?.total_directories_to_enrich && (
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 mb-3">
                         <div 
                           className="h-full bg-white/40 transition-all duration-500 ease-out" 
                           style={{ width: `${Math.min(100, Math.round(((activeRepo.phase2_stats?.directories_enriched || 0) / activeRepo.phase2_stats.total_directories_to_enrich) * 100))}%` }}
                         />
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
          ) : activeRepo.phase1_status === "failed" || scanError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/20">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-medium text-white/90 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Scan Failed
              </h2>
              <p className="text-sm text-white/40 mb-2 max-w-md text-center leading-relaxed">
                {activeRepo.org}/{activeRepo.repo}
              </p>
              {(activeRepo.error || scanError) && (
                <div className="max-w-md w-full mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300/90 leading-relaxed break-words">{activeRepo.error || scanError}</p>
                </div>
              )}
              <button
                onClick={() => { setActiveRepo(null); setScanError(""); setEstimates(null); }}
                className="mt-6 px-5 py-2 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Back to repositories
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="border-b border-white/5 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-10 rounded-t-2xl">
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-medium flex items-center space-x-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <MessageSquare size={16} className="text-blue-400" />
                    <span>XMem Knowledge Graph</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-white/40">{activeRepo.org}/{activeRepo.repo}</p>
                    {activeRepo.phase1_status === "complete" && (
                      activeRepo.share_index_publicly !== false ? (
                        <Globe className="w-3 h-3 text-emerald-400/50" />
                      ) : (
                        <Lock className="w-3 h-3 text-white/20" />
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Share Toggle - Only for personal catalog */}
                  {activeRepo.phase1_status === "complete" && scannerTab === "mine" && (
                    <div className="flex items-center space-x-2 relative">
                      <span
                        onMouseEnter={() => setShowShareTooltip(true)}
                        onMouseLeave={() => setShowShareTooltip(false)}
                        className="text-[10px] text-white/40 uppercase tracking-widest font-bold cursor-default hover:text-white/60 transition-colors"
                      >
                        Public index
                      </span>

                      {showShareTooltip && (
                        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-[#111] border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-[60] pointer-events-none">
                          <div className="flex items-start gap-2">
                            {activeRepo.share_index_publicly !== false ? (
                              <Globe className="w-3.5 h-3.5 text-emerald-400/70 mt-0.5 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                            )}
                            <p className="text-[11px] text-white/70 leading-relaxed font-normal normal-case tracking-normal">
                              {activeRepo.share_index_publicly !== false
                                ? "Anyone can ask questions or chat with this repository on this revision without re-scanning (shared index catalog)."
                                : "Only users who have personally scanned this repository can query it. Enable sharing to let others reuse this index and save processing time."}
                            </p>
                          </div>
                          <div className="absolute top-0 right-10 -translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white/10" />
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={sharingSaving}
                        onMouseEnter={() => setShowShareTooltip(true)}
                        onMouseLeave={() => setShowShareTooltip(false)}
                        onClick={() => setShareIndexPublicly(activeRepo.share_index_publicly === false)}
                        className={`relative w-8 h-4 rounded-full transition-colors duration-200 disabled:opacity-50 ${activeRepo.share_index_publicly !== false ? "bg-emerald-500/80" : "bg-white/10"}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${activeRepo.share_index_publicly !== false ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  )}

                  {activeRepo.phase1_status === "complete" && scannerTab === "mine" && (
                    <div className="w-px h-3 bg-white/10" />
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Debug Mode</span>
                    <button 
                      onClick={() => setDebugMode(!debugMode)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${debugMode ? 'bg-blue-500/80' : 'bg-white/10'}`}
                    >
                      <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${debugMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <button
                    onClick={() => setActiveRepo(null)}
                    className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  
                  if (msg.role === "status") {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/30 uppercase tracking-widest">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isError = msg.isError;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          isUser
                            ? "bg-gradient-to-br from-blue-600/20 to-blue-500/10 text-white/90 border border-blue-500/20"
                            : isError
                              ? "bg-red-500/10 text-red-200 border border-red-500/30"
                              : "bg-white/5 text-white/80 border border-white/10"
                        }`}
                      >
                        <div className="text-sm font-light leading-relaxed">
                          {msg.content ? renderMarkdown(msg.content) : (chatLoading && !isUser && <Loader2 className="w-4 h-4 animate-spin text-white/30" />)}
                        </div>
                        
                        {!isUser && msg.content && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => navigator.clipboard.writeText(msg.content)}
                              className="text-white/20 hover:text-white/60 transition-colors p-1"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        
                        {debugMode && msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-2">
                             <span className="text-[10px] text-white/30 uppercase tracking-widest">Graph Tool Invocations ({msg.toolCalls.length})</span>
                             {msg.toolCalls.map((tc, idx) => (
                               <div key={idx} className="bg-black/40 rounded p-3 font-mono text-[11px] text-white/60 border border-white/5">
                                 <span className="text-purple-400">{tc.name}</span>
                                 <span className="text-white/30">(</span>
                                 <span className="text-blue-300/80">{JSON.stringify(tc.args)}</span>
                                 <span className="text-white/30">)</span>
                               </div>
                             ))}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
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
