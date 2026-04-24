import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  Users,
  Plus,
  Settings,
  MessageSquare,
  GitBranch,
  Search,
  FileText,
  AlertCircle,
  Lightbulb,
  Wrench,
  Info,
  X,
  ChevronRight,
  Shield,
  User,
  Crown,
  Code,
  Menu,
  CheckCircle,
  MoreVertical,
  Trash2,
  Edit3,
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

// Types
interface Project {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  repo: string;
  created_by: string;
  created_at: string;
  annotation_count: number;
  is_active: boolean;
}

interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  username: string;
  email?: string;
  role: "manager" | "staff_engineer" | "sde2" | "intern";
  added_at: string;
}

interface Annotation {
  id: string;
  content: string;
  annotation_type: "bug_report" | "fix" | "explanation" | "warning" | "feature_idea";
  author_name: string;
  author_role: string;
  severity?: "low" | "medium" | "high" | "critical";
  file_path?: string;
  symbol_name?: string;
  created_at: string;
  score?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "status" | "annotations";
  content: string;
  annotations?: Annotation[];
  toolCalls?: any[];
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { icon: any; color: string; label: string }> = {
    manager: { icon: Crown, color: "bg-purple-500/20 text-purple-400", label: "Manager" },
    staff_engineer: { icon: Shield, color: "bg-blue-500/20 text-blue-400", label: "Staff" },
    sde2: { icon: Code, color: "bg-emerald-500/20 text-emerald-400", label: "SDE2" },
    intern: { icon: User, color: "bg-gray-500/20 text-gray-400", label: "Intern" },
  };

  const config = roleConfig[role] || roleConfig.intern;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Annotation type icon
function AnnotationTypeIcon({ type }: { type: string }) {
  const iconConfig: Record<string, { icon: any; color: string }> = {
    bug_report: { icon: AlertCircle, color: "text-red-400" },
    fix: { icon: Wrench, color: "text-emerald-400" },
    explanation: { icon: Info, color: "text-blue-400" },
    warning: { icon: AlertCircle, color: "text-yellow-400" },
    feature_idea: { icon: Lightbulb, color: "text-purple-400" },
  };

  const config = iconConfig[type] || iconConfig.explanation;
  const Icon = config.icon;

  return <Icon className={`w-4 h-4 ${config.color}`} />;
}

export default function Enterprise() {
  const { user, token, logout: authLogout, isAuthenticated, isLoading } = useAuth();
  const username = user?.username ?? user?.name ?? "";
  const userId = user?.id ?? "";

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // UI state
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [showEditMember, setShowEditMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "annotations" | "team">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectGithubUrl, setNewProjectGithubUrl] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [githubUrlError, setGithubUrlError] = useState("");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMember["role"]>("intern");
  const [foundUser, setFoundUser] = useState<{id: string; username: string; email?: string; name?: string; picture?: string} | null>(null);
  const [userSearchError, setUserSearchError] = useState("");
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [newAnnotationContent, setNewAnnotationContent] = useState("");
  const [newAnnotationType, setNewAnnotationType] = useState<Annotation["annotation_type"]>("explanation");
  const [newAnnotationTarget, setNewAnnotationTarget] = useState("");

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<"idle" | "phase1" | "phase2" | "complete" | "failed">("idle");
  const [scanProgress, setScanProgress] = useState({ files_processed: 0, total_files: 0, symbols_indexed: 0 });
  const [scanError, setScanError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if user is manager
  const currentUserRole = useMemo(() => {
    if (!activeProject) return null;
    if (activeProject.created_by === userId) return "manager";
    const member = teamMembers.find(m => m.user_id === userId);
    return member?.role || null;
  }, [activeProject, teamMembers, userId]);

  // Permission hierarchy (higher = more permissions)
  const roleHierarchy: Record<TeamMember["role"], number> = {
    manager: 4,
    staff_engineer: 3,
    sde2: 2,
    intern: 1,
  };

  // Check if current user can manage team (add/remove members)
  const canManageTeam = useMemo(() => {
    return currentUserRole === "manager";
  }, [currentUserRole]);

  // Check if current user can edit a specific member's role
  const canEditMember = useMemo(() => (targetRole: TeamMember["role"], targetUserId: string) => {
    if (!currentUserRole) return false;
    // Cannot edit self
    if (targetUserId === userId) return false;
    // Manager can edit anyone
    if (currentUserRole === "manager") return true;
    // Staff Engineer can edit SDE2 and Intern
    if (currentUserRole === "staff_engineer" && roleHierarchy[targetRole] <= 2) return true;
    // SDE2 and Intern cannot edit anyone
    return false;
  }, [currentUserRole, userId]);

  // Check if current user can remove a specific member
  const canRemoveMember = useMemo(() => (targetRole: TeamMember["role"], targetUserId: string) => {
    if (!currentUserRole) return false;
    // Cannot remove self through this function
    if (targetUserId === userId) return false;
    // Manager can remove anyone
    if (currentUserRole === "manager") return true;
    // Others cannot remove members
    return false;
  }, [currentUserRole, userId]);

  // Legacy compatibility
  const isManager = useMemo(() => currentUserRole === "manager", [currentUserRole]);

  const updateProjectAnnotationCount = (projectId: string, increment: number) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              annotation_count: Math.max(0, (project.annotation_count || 0) + increment),
            }
          : project
      )
    );
    setActiveProject((prev) =>
      prev?.id === projectId
        ? {
            ...prev,
            annotation_count: Math.max(0, (prev.annotation_count || 0) + increment),
          }
        : prev
    );
  };

  // Load projects
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadProjects = async () => {
      try {
        const resp = await fetch(`${API_URL}/v1/enterprise/projects`, {
          headers: authBearerHeaders(token),
        });
        const data = await resp.json();
        if (data.status === "ok" && Array.isArray(data.projects)) {
          setProjects(data.projects.map((p: any) => ({ ...p, id: p.id || p._id })));
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
      }
    };

    loadProjects();
  }, [isAuthenticated, token]);

  // Load team members when project changes
  useEffect(() => {
    if (!activeProject || !token) return;

    const loadTeam = async () => {
      try {
        const resp = await fetch(
          `${API_URL}/v1/enterprise/projects/${activeProject.id}/team`,
          { headers: authBearerHeaders(token) }
        );
        const data = await resp.json();
        if (data.status === "ok" && Array.isArray(data.members)) {
          setTeamMembers(data.members.map((m: any) => ({ ...m, id: m.id || m._id })));
        }
      } catch (e) {
        console.error("Failed to load team:", e);
      }
    };

    loadTeam();
  }, [activeProject, token]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Parse GitHub URL to extract org and repo
  const parseGithubUrl = (url: string): { org: string; repo: string } | null => {
    try {
      // Support formats:
      // https://github.com/org/repo
      // https://github.com/org/repo.git
      // github.com/org/repo
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)(?:\.git)?$/);
      if (match) {
        return { org: match[1], repo: match[2] };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Create project
  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectGithubUrl.trim()) return;

    const parsed = parseGithubUrl(newProjectGithubUrl);
    if (!parsed) {
      setGithubUrlError("Invalid GitHub URL. Format: https://github.com/org/repo");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/v1/enterprise/projects`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          name: newProjectName,
          org_id: parsed.org,
          repo: parsed.repo,
          description: newProjectDesc,
        }),
      });

      const data = await resp.json();
      if (data.status === "ok" && data.project) {
        const newProject = { ...data.project, id: data.project.id || data.project._id };
        setProjects([...projects, newProject]);
        setActiveProject(newProject);
        setShowCreateProject(false);
        setNewProjectName("");
        setNewProjectGithubUrl("");
        setNewProjectDesc("");
        setGithubUrlError("");
        setMessages([{
          id: `welcome-${Date.now()}`,
          role: "status",
          content: `Created project "${newProject.name}". Starting repository scan...`,
        }]);
        // Auto-start scanning after project creation
        setTimeout(() => {
          startScanWithProject(newProject);
        }, 500);
      }
    } catch (e) {
      console.error("Failed to create project:", e);
    }
  };

  // Start scan with specific project (used for auto-scan after creation)
  const startScanWithProject = async (project: Project) => {
    setIsScanning(true);
    setScanPhase("phase1");
    setScanError("");
    setScanProgress({ files_processed: 0, total_files: 0, symbols_indexed: 0 });

    try {
      const resp = await fetch(`${API_URL}/v1/scanner/scan`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          github_url: `https://github.com/${project.org_id}/${project.repo}`,
          username: username,
          branch: "main",
        }),
      });

      const data = await resp.json();
      if (data.status === "ok") {
        pollScanStatusForProject(project);
      } else {
        setScanError(data.error || "Failed to start scan");
        setIsScanning(false);
        setScanPhase("idle");
      }
    } catch (e) {
      console.error("Failed to start scan:", e);
      setScanError("Network error. Please try again.");
      setIsScanning(false);
      setScanPhase("idle");
    }
  };

  // Poll scan status for a specific project
  const pollScanStatusForProject = async (project: Project) => {
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(
          `${API_URL}/v1/scanner/catalog-status?username=${encodeURIComponent(username)}&org_id=${encodeURIComponent(project.org_id)}&repo=${encodeURIComponent(project.repo)}`,
          { headers: authBearerHeaders(token) }
        );

        const data = await resp.json();
        
        if (data.phase1_status === "complete" && data.phase2_status === "complete") {
          setScanPhase("complete");
          setIsScanning(false);
          clearInterval(interval);
          setMessages((prev) => [
            ...prev,
            {
              id: `scan-complete-${Date.now()}`,
              role: "status",
              content: "Repository scan complete! You can now chat and add annotations.",
            },
          ]);
        } else if (data.phase1_status === "failed" || data.phase2_status === "failed") {
          setScanError("Scan failed. Please check the repository and try again.");
          setScanPhase("failed");
          setIsScanning(false);
          clearInterval(interval);
        } else {
          setScanPhase(data.phase1_status === "complete" ? "phase2" : "phase1");
          if (data.stats) {
            setScanProgress({
              files_processed: data.stats.files_processed || 0,
              total_files: data.stats.total_files_to_process || 0,
              symbols_indexed: data.stats.symbols_indexed || 0,
            });
          }
        }
      } catch (e) {
        console.error("Failed to poll scan status:", e);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };

  // Lookup user by username
  const lookupUser = async (username: string) => {
    if (!username.trim()) {
      setFoundUser(null);
      setUserSearchError("");
      return;
    }

    setIsSearchingUser(true);
    setUserSearchError("");
    setFoundUser(null);

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/users/lookup?username=${encodeURIComponent(username)}`,
        { headers: authBearerHeaders(token) }
      );

      if (resp.status === 404) {
        setUserSearchError(`User "${username}" not found. They need to sign up first.`);
        setFoundUser(null);
      } else if (!resp.ok) {
        setUserSearchError("Error looking up user. Please try again.");
      } else {
        const data = await resp.json();
        if (data.status === "ok" && data.user) {
          setFoundUser(data.user);
          setUserSearchError("");
        }
      }
    } catch (e) {
      console.error("Failed to lookup user:", e);
      setUserSearchError("Network error. Please try again.");
    } finally {
      setIsSearchingUser(false);
    }
  };

  // Add team member
  const handleAddMember = async () => {
    if (!activeProject || !foundUser) return;

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/team`,
        {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            user_id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            role: newMemberRole,
          }),
        }
      );

      const data = await resp.json();
      if (data.status === "ok" && data.member) {
        setTeamMembers([...teamMembers, { ...data.member, id: data.member.id || data.member._id }]);
        setShowAddMember(false);
        setNewMemberUsername("");
        setNewMemberRole("intern");
        setFoundUser(null);
        setUserSearchError("");
      } else if (data.error) {
        setUserSearchError(data.error);
      }
    } catch (e) {
      console.error("Failed to add member:", e);
      setUserSearchError("Failed to add member. Please try again.");
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId: string, newRole: TeamMember["role"]) => {
    if (!activeProject || !showEditMember) return;

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/team/${memberId}`,
        {
          method: "PATCH",
          headers: authJsonHeaders(token),
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await resp.json();
      if (data.status === "ok") {
        setTeamMembers(teamMembers.map(m =>
          m.id === memberId ? { ...m, role: newRole } : m
        ));
        setShowEditMember(null);
      }
    } catch (e) {
      console.error("Failed to update role:", e);
    }
  };

  // Remove member from project
  const handleRemoveMember = async (memberId: string) => {
    if (!activeProject) return;

    if (!confirm("Are you sure you want to remove this member from the project?")) {
      return;
    }

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/team/${memberId}`,
        {
          method: "DELETE",
          headers: authBearerHeaders(token),
        }
      );

      const data = await resp.json();
      if (data.status === "ok") {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        setShowEditMember(null);
      }
    } catch (e) {
      console.error("Failed to remove member:", e);
    }
  };

  // Start scanning
  const startScan = async () => {
    if (!activeProject) return;
    setIsScanning(true);
    setScanPhase("phase1");
    setScanError("");
    setScanProgress({ files_processed: 0, total_files: 0, symbols_indexed: 0 });

    try {
      const resp = await fetch(`${API_URL}/v1/scanner/scan`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          github_url: `https://github.com/${activeProject.org_id}/${activeProject.repo}`,
          username: username,
          branch: "main",
        }),
      });

      const data = await resp.json();
      if (data.status === "ok") {
        // Start polling for scan status
        pollScanStatus();
      } else {
        setScanError(data.error || "Failed to start scan");
        setIsScanning(false);
        setScanPhase("idle");
      }
    } catch (e) {
      console.error("Failed to start scan:", e);
      setScanError("Network error. Please try again.");
      setIsScanning(false);
      setScanPhase("idle");
    }
  };

  // Poll scan status
  const pollScanStatus = async () => {
    if (!activeProject) return;

    const interval = setInterval(async () => {
      try {
        const resp = await fetch(
          `${API_URL}/v1/scanner/catalog-status?username=${encodeURIComponent(username)}&org_id=${encodeURIComponent(activeProject.org_id)}&repo=${encodeURIComponent(activeProject.repo)}`,
          { headers: authBearerHeaders(token) }
        );

        const data = await resp.json();
        
        if (data.phase1_status === "complete" && data.phase2_status === "complete") {
          setScanPhase("complete");
          setIsScanning(false);
          clearInterval(interval);
          setMessages((prev) => [
            ...prev,
            {
              id: `scan-complete-${Date.now()}`,
              role: "status",
              content: "Scan complete! Repository is now ready for chat and annotations.",
            },
          ]);
        } else if (data.phase1_status === "failed" || data.phase2_status === "failed") {
          setScanError("Scan failed. Please check the repository and try again.");
          setScanPhase("idle");
          setIsScanning(false);
          clearInterval(interval);
        } else {
          // Update progress
          setScanPhase(data.phase1_status === "complete" ? "phase2" : "phase1");
          if (data.stats) {
            setScanProgress({
              files_processed: data.stats.files_processed || 0,
              total_files: data.stats.total_files_to_process || 0,
              symbols_indexed: data.stats.symbols_indexed || 0,
            });
          }
        }
      } catch (e) {
        console.error("Failed to poll scan status:", e);
      }
    }, 3000);

    // Clear interval after 10 minutes (max scan time)
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };

  // Create annotation
  const handleCreateAnnotation = async () => {
    if (!activeProject || !newAnnotationContent.trim()) return;

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations`,
        {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            content: newAnnotationContent,
            annotation_type: newAnnotationType,
            file_path: newAnnotationTarget || undefined,
          }),
        }
      );

      const data = await resp.json();
      if (data.status === "ok") {
        setNewAnnotationContent("");
        setNewAnnotationTarget("");
        setShowAnnotationPanel(false);
        updateProjectAnnotationCount(activeProject.id, 1);
        // Refresh annotations
        loadAnnotationsForProject(activeProject.id);
      }
    } catch (e) {
      console.error("Failed to create annotation:", e);
    }
  };

  // Load annotations for project
  const loadAnnotationsForProject = async (projectId: string) => {
    if (!token) return;

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${projectId}/annotations/search`,
        {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({ query: "*", top_k: 50 }),
        }
      );
      const data = await resp.json();
      if (data.status === "ok" && Array.isArray(data.annotations)) {
        setAnnotations(data.annotations);
      }
    } catch (e) {
      console.error("Failed to load annotations:", e);
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeProject || chatLoading || scanPhase !== "complete") return;

    const projectId = activeProject.id;
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
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${projectId}/chat`,
        {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            query: userMsg.content,
            top_k: 10,
          }),
        }
      );

      if (!resp.ok) {
        let msg = "Failed to get response";
        try {
          const errBody = await resp.json();
          if (typeof errBody?.error === "string") {
            msg = errBody.error;
          } else if (typeof errBody?.detail === "string") {
            msg = errBody.detail;
          }
        } catch {
          /* use default */
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: msg } : m))
        );
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
              const content = chunk.content || chunk.status || "Working...";
              setMessages((prev) => [
                ...prev,
                {
                  id: `status-${Date.now()}`,
                  role: "status",
                  content,
                },
              ]);
            } else if (chunk.type === "tool_calls") {
              const tools = chunk.tools || chunk.tool_calls || chunk.toolCalls || [];
              if (Array.isArray(tools) && tools.length > 0) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, toolCalls: [...(m.toolCalls || []), ...tools] }
                      : m
                  )
                );
              }
            } else if (chunk.type === "error") {
              const content = chunk.error || chunk.message || "Failed to get response. Please try again.";
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content } : m))
              );
            } else if (chunk.type === "annotations") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `annotations-${Date.now()}`,
                  role: "annotations",
                  content: "",
                  annotations: chunk.annotations,
                },
              ]);
            } else if (chunk.type === "annotations_created") {
              const count = Number(chunk.count ?? (Array.isArray(chunk.ids) ? chunk.ids.length : 0));
              if (count > 0) {
                updateProjectAnnotationCount(projectId, count);
                loadAnnotationsForProject(projectId);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `annotations-created-${Date.now()}`,
                    role: "status",
                    content: `Saved ${count} team annotation${count === 1 ? "" : "s"} from this chat.`,
                  },
                ]);
              }
            } else if (chunk.type === "chunk") {
              const textToAdd = chunk.text || "";
              if (textToAdd) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + textToAdd } : m
                  )
                );
              }
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Failed to get response. Please try again." }
            : m
        )
      );
    } finally {
      setChatLoading(false);
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
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-white">$1</strong>')
        .replace(/`([^`\n]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono text-white/90">$1</code>')
        .replace(/^[-\*] (.*?)$/gm, '<li class="ml-4 list-disc mt-1">$1</li>')
        .replace(/\n/g, '<br/>');

      return <span key={index} className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  if (isLoading) {
    return (
      <div className="dark min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="dark min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <div className="text-center">
          <h1 className="text-2xl text-white font-bold mb-4">Enterprise Access</h1>
          <p className="text-white/50 mb-6">Please sign in to access team projects.</p>
          <a href="/login?returnUrl=/enterprise" className="px-6 py-3 bg-white text-black rounded-lg font-medium">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen flex flex-col" style={{ background: "#080808" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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
          <span className="hidden md:inline text-xs text-white/40 uppercase tracking-widest">Enterprise</span>
          {activeProject && (
            <>
              <ChevronRight className="hidden md:block w-4 h-4 text-white/30" />
              <span className="hidden md:inline text-sm text-white/80">{activeProject.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Project</span>
            <span className="md:hidden">New</span>
          </button>
          <span className="text-xs md:text-sm text-white/50 truncate max-w-[80px] md:max-w-none">{username}</span>
          <a href="/dashboard" className="hidden md:inline text-xs text-white/30 hover:text-white/60 transition-colors">Dashboard</a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Panel - Projects */}
        <aside
          className={`absolute md:relative z-50 w-64 lg:w-72 h-full flex-shrink-0 flex flex-col min-h-0 overflow-hidden bg-[#0a0a0a] transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-xs text-white/30 uppercase tracking-widest font-medium">Projects</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {projects.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-8">No projects yet. Create one to get started.</p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project);
                    setActiveTab("chat");
                    setMessages([]);
                    loadAnnotationsForProject(project.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeProject?.id === project.id
                      ? "bg-white/10 border border-white/10"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/90 font-medium truncate">{project.name}</span>
                        {project.annotation_count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                            {project.annotation_count}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/40 flex items-center gap-2">
                        <GitBranch className="w-3 h-3" />
                        {project.org_id}/{project.repo}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* Main Content Area */}
            {!activeProject ? (
              <main className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h2 className="text-xl text-white/90 font-medium mb-2">Enterprise Team Annotations</h2>
                  <p className="text-sm text-white/40 mb-6">
                    Create a project to start collaborating with your team. Add annotations to share knowledge about your codebase.
                  </p>
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="px-6 py-3 bg-white text-black rounded-lg font-medium text-sm"
                  >
                    Create Your First Project
                  </button>
                </div>
              </main>
            ) : (
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Tabs Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/70">{activeProject.org_id}/{activeProject.repo}</span>
                    </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex gap-1">
                    {(["chat", "annotations", "team"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activeTab === tab
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
                      >
                        {tab === "chat" && (
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                          </span>
                        )}
                        {tab === "annotations" && (
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Annotations
                          </span>
                        )}
                        {tab === "team" && (
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Team
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveProject(null)}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {/* CHAT TAB */}
                {activeTab === "chat" && (
                  <div className="flex flex-col h-full">
                    {/* Chat Header Info */}
                    <div className="px-4 py-2 border-b border-white/5 bg-black/20">
                      <span className="text-xs text-white/40">Ask about the codebase and see team annotations in context</span>
                    </div>

                    {/* Scan Status Banner */}
                    {scanPhase === "idle" && (
                      <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            <div>
                              <p className="text-sm text-white/80">Repository needs to be scanned</p>
                              <p className="text-xs text-white/50">Scan the codebase to enable chat and annotations.</p>
                            </div>
                          </div>
                          <button
                            onClick={startScan}
                            disabled={isScanning}
                            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isScanning ? "Starting..." : "Start Scan"}
                          </button>
                        </div>
                      </div>
                    )}

                    {(scanPhase === "phase1" || scanPhase === "phase2") && (
                      <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <div>
                              <p className="text-sm text-white/80">
                                {scanPhase === "phase1" ? "Phase 1: Indexing files..." : "Phase 2: Analyzing symbols..."}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-white/50">
                            {scanProgress.files_processed} / {scanProgress.total_files} files
                          </span>
                        </div>
                        {scanProgress.total_files > 0 && (
                          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-md">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${(scanProgress.files_processed / scanProgress.total_files) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {scanPhase === "complete" && (
                      <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs text-emerald-300">Repository scanned and ready</p>
                        </div>
                      </div>
                    )}

                    {scanError && (
                      <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-red-400">{scanError}</p>
                          <button
                            onClick={() => {
                              setScanError("");
                              setScanPhase("idle");
                            }}
                            className="text-xs text-white/50 hover:text-white/80 underline"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                      {messages.length === 0 && (
                        <div className="text-center py-12">
                          <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-4" />
                          <p className="text-sm text-white/30">Start a conversation with your team.</p>
                          <div className="flex gap-3 justify-center mt-6">
                            <button
                              onClick={() => setChatInput("What are the known issues in this codebase?")}
                              disabled={scanPhase !== "complete"}
                              className="px-4 py-2 bg-white/5 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30"
                            >
                              Find issues
                            </button>
                            <button
                              onClick={() => setChatInput("Explain the architecture")}
                              disabled={scanPhase !== "complete"}
                              className="px-4 py-2 bg-white/5 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30"
                            >
                              Explain architecture
                            </button>
                          </div>
                        </div>
                      )}

                {messages.map((msg) => {
                  if (msg.role === "status") {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/30 uppercase tracking-widest">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  if (msg.role === "annotations") {
                    return (
                      <div key={msg.id} className="my-4">
                        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Relevant Team Knowledge</div>
                        <div className="space-y-2">
                          {msg.annotations?.map((ann) => (
                            <div key={ann.id} className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                              <div className="flex items-start gap-2">
                                <AnnotationTypeIcon type={ann.annotation_type} />
                                <div className="flex-1">
                                  <p className="text-xs text-white/70">{ann.content}</p>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-white/40">
                                    <span>{ann.author_name}</span>
                                    <span>•</span>
                                    <RoleBadge role={ann.author_role} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          isUser
                            ? "bg-gradient-to-br from-purple-600/20 to-blue-500/10 text-white/90 border border-purple-500/20"
                            : "bg-white/5 text-white/80 border border-white/10"
                        }`}
                      >
                        <div className="text-sm font-light leading-relaxed">
                          {msg.content ? renderMarkdown(msg.content) : (chatLoading && !isUser && <Loader2 className="w-4 h-4 animate-spin text-white/30" />)}
                        </div>

                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
                    placeholder={scanPhase === "complete" ? "Ask about the codebase..." : "Scan required before chatting..."}
                    disabled={chatLoading || scanPhase !== "complete"}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-30"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading || scanPhase !== "complete"}
                    className="p-3 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    style={{
                      background: chatInput.trim() && scanPhase === "complete" ? "white" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Send className="w-4 h-4" style={{ color: chatInput.trim() && scanPhase === "complete" ? "black" : "rgba(255,255,255,0.3)" }} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ANNOTATIONS TAB */}
          {activeTab === "annotations" && (
                  <div className="flex flex-col h-full">
                    {/* Annotations Header */}
                    <div className="px-4 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">Team Annotations</h3>
                        <p className="text-xs text-white/40 mt-0.5">Knowledge shared by your team</p>
                      </div>
                      <button
                        onClick={() => setShowAnnotationPanel(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Annotation
                      </button>
                    </div>

                    {/* Annotations List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      {annotations.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-10 h-10 text-white/10 mx-auto mb-4" />
                          <p className="text-sm text-white/30">No annotations yet.</p>
                          <p className="text-xs text-white/20 mt-2">Add annotations to share knowledge with your team.</p>
                          <button
                            onClick={() => setShowAnnotationPanel(true)}
                            className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-xs text-white hover:bg-white/20 transition-colors"
                          >
                            Add First Annotation
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-w-3xl">
                          {annotations.map((ann) => (
                            <div key={ann.id} className="p-4 bg-white/[0.03] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <AnnotationTypeIcon type={ann.annotation_type} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white/80 leading-relaxed">{ann.content}</p>
                                  <div className="flex items-center gap-3 mt-3 text-[11px] text-white/40">
                                    <span className="text-white/60">{ann.author_name}</span>
                                    <RoleBadge role={ann.author_role} />
                                    {ann.file_path && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono text-white/30">{ann.file_path}</span>
                                      </>
                                    )}
                                    {ann.symbol_name && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono text-white/30">{ann.symbol_name}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-white/20 mt-2">
                                    {new Date(ann.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

            {/* TEAM TAB */}
            {activeTab === "team" && (
                  <div className="flex flex-col h-full">
                    {/* Team Header */}
                    <div className="px-4 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">Team Members</h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {canManageTeam && (
                        <button
                          onClick={() => setShowAddMember(true)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Member
                        </button>
                      )}
                    </div>

                    {/* Team Members List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <div className="max-w-2xl space-y-2">
                        {/* Project Creator */}
                        <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Crown className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">Project Creator</span>
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Manager</span>
                              </div>
                              <p className="text-xs text-white/40 mt-0.5">
                                Created this project and has full access
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Team Members */}
                        {teamMembers.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="w-10 h-10 text-white/10 mx-auto mb-4" />
                            <p className="text-sm text-white/30">No team members yet.</p>
                            <p className="text-xs text-white/20 mt-2">Add members to collaborate on this project.</p>
                          </div>
                        ) : (
                          teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="p-4 bg-white/[0.03] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white/50" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-white">{member.username}</span>
                                      <RoleBadge role={member.role} />
                                    </div>
                                    {member.email && (
                                      <p className="text-xs text-white/40 mt-0.5">{member.email}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {(canEditMember(member.role, member.user_id) || canRemoveMember(member.role, member.user_id)) && (
                                    <button
                                      onClick={() => setShowEditMember(member)}
                                      className="p-2 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-colors"
                                      title="Manage member"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          )}
        </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-white/10 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-white font-medium">Create Project</h2>
              <button onClick={() => {
                setShowCreateProject(false);
                setGithubUrlError("");
              }} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                  placeholder="e.g., Payment Service"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">GitHub Repository URL</label>
                <input
                  type="text"
                  value={newProjectGithubUrl}
                  onChange={(e) => {
                    setNewProjectGithubUrl(e.target.value);
                    setGithubUrlError("");
                  }}
                  className={`w-full bg-white/5 border ${githubUrlError ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-3 py-2.5 text-white text-sm`}
                  placeholder="https://github.com/org/repo"
                />
                {githubUrlError && (
                  <p className="mt-1.5 text-xs text-red-400">{githubUrlError}</p>
                )}
                <p className="mt-1.5 text-[10px] text-white/30">
                  The repository will be automatically scanned after creation.
                </p>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm h-20 resize-none"
                  placeholder="Optional description..."
                />
              </div>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || !newProjectGithubUrl.trim()}
                className="w-full py-3 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-30"
              >
                Create & Scan Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-white/10 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-white font-medium">Add Team Member</h2>
              <button onClick={() => {
                setShowAddMember(false);
                setFoundUser(null);
                setUserSearchError("");
                setNewMemberUsername("");
              }} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMemberUsername}
                    onChange={(e) => {
                      setNewMemberUsername(e.target.value);
                      setFoundUser(null);
                      setUserSearchError("");
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                    placeholder="Enter username"
                  />
                  <button
                    onClick={() => lookupUser(newMemberUsername)}
                    disabled={isSearchingUser || !newMemberUsername.trim()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm disabled:opacity-30"
                  >
                    {isSearchingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                  </button>
                </div>
                {userSearchError && (
                  <p className="mt-2 text-xs text-red-400">{userSearchError}</p>
                )}
                {foundUser && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {foundUser.picture ? (
                        <img src={foundUser.picture} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white">{foundUser.name || foundUser.username}</p>
                        <p className="text-xs text-white/50">@{foundUser.username}</p>
                        {foundUser.email && <p className="text-xs text-white/40">{foundUser.email}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as TeamMember["role"])}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                >
                  <option value="intern">Intern</option>
                  <option value="sde2">SDE 2</option>
                  <option value="staff_engineer">Staff Engineer</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <button
                onClick={handleAddMember}
                disabled={!foundUser}
                className="w-full py-3 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-30"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-white/10 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-white font-medium">Manage Team Member</h2>
              <button onClick={() => setShowEditMember(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{showEditMember.username}</p>
                  <p className="text-xs text-white/50">Current role: {showEditMember.role.replace("_", " ")}</p>
                </div>
              </div>

              {canEditMember(showEditMember.role, showEditMember.user_id) && (
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Update Role</label>
                  <select
                    value={showEditMember.role}
                    onChange={(e) => handleUpdateRole(showEditMember.id, e.target.value as TeamMember["role"])}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                  >
                    {currentUserRole === "manager" && (
                      <>
                        <option value="intern">Intern</option>
                        <option value="sde2">SDE 2</option>
                        <option value="staff_engineer">Staff Engineer</option>
                        <option value="manager">Manager</option>
                      </>
                    )}
                    {currentUserRole === "staff_engineer" && (
                      <>
                        <option value="intern">Intern</option>
                        <option value="sde2">SDE 2</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                {canRemoveMember(showEditMember.role, showEditMember.user_id) && (
                  <button
                    onClick={() => handleRemoveMember(showEditMember.id)}
                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Remove from Project
                  </button>
                )}
                <button
                  onClick={() => setShowEditMember(null)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Annotation Modal */}
      {showAnnotationPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-white/10 w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-white font-medium">Add Annotation</h2>
              <button onClick={() => setShowAnnotationPanel(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["explanation", "warning", "bug_report", "fix", "feature_idea"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAnnotationType(type)}
                      className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors ${
                        newAnnotationType === type
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Target (Optional)</label>
                <input
                  type="text"
                  value={newAnnotationTarget}
                  onChange={(e) => setNewAnnotationTarget(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                  placeholder="e.g., src/utils/auth.ts or AuthService.login"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Content</label>
                <textarea
                  value={newAnnotationContent}
                  onChange={(e) => setNewAnnotationContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm h-32 resize-none"
                  placeholder="Share your knowledge about this code..."
                />
              </div>
              <button
                onClick={handleCreateAnnotation}
                disabled={!newAnnotationContent.trim()}
                className="w-full py-3 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-30"
              >
                Create Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
