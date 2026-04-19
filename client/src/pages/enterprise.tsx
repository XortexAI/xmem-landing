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
  const userId = user?.id ?? user?.google_id ?? "";

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // UI state
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "annotations" | "team">("chat");

  // Form state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectOrg, setNewProjectOrg] = useState("");
  const [newProjectRepo, setNewProjectRepo] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMember["role"]>("intern");
  const [newAnnotationContent, setNewAnnotationContent] = useState("");
  const [newAnnotationType, setNewAnnotationType] = useState<Annotation["annotation_type"]>("explanation");
  const [newAnnotationTarget, setNewAnnotationTarget] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if user is manager
  const isManager = useMemo(() => {
    if (!activeProject) return false;
    const member = teamMembers.find(m => m.user_id === userId);
    return member?.role === "manager" || activeProject.created_by === userId;
  }, [activeProject, teamMembers, userId]);

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

  // Create project
  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectOrg.trim() || !newProjectRepo.trim()) return;

    try {
      const resp = await fetch(`${API_URL}/v1/enterprise/projects`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          name: newProjectName,
          org_id: newProjectOrg,
          repo: newProjectRepo,
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
        setNewProjectOrg("");
        setNewProjectRepo("");
        setNewProjectDesc("");
        setMessages([{
          id: `welcome-${Date.now()}`,
          role: "status",
          content: `Created project "${newProject.name}". Add team members to start collaborating.`,
        }]);
      }
    } catch (e) {
      console.error("Failed to create project:", e);
    }
  };

  // Add team member
  const handleAddMember = async () => {
    if (!activeProject || !newMemberUsername.trim()) return;

    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/team`,
        {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            user_id: newMemberUsername, // In real app, would lookup user_id from username
            username: newMemberUsername,
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
      }
    } catch (e) {
      console.error("Failed to add member:", e);
    }
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
    if (!chatInput.trim() || !activeProject || chatLoading) return;

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
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/chat`,
        {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            query: userMsg.content,
            top_k: 10,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to get response");
      }

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

            if (chunk.type === "annotations") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `annotations-${Date.now()}`,
                  role: "annotations",
                  content: "",
                  annotations: chunk.annotations,
                },
              ]);
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
            // skip malformed lines
          }
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.id === assistantId) {
          return [
            ...prev.slice(0, -1),
            { ...last, content: "Failed to get response. Please try again." },
          ];
        }
        return prev;
      });
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
      <header className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-4">
          <a href="/">
            <img src="/logo.png" alt="XMem" className="h-7 w-auto invert" />
          </a>
          <div className="w-px h-5 bg-white/10" />
          <span className="text-xs text-white/40 uppercase tracking-widest">Enterprise</span>
          {activeProject && (
            <>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <span className="text-sm text-white/80">{activeProject.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
          <span className="text-sm text-white/50">{username}</span>
          <a href="/dashboard" className="text-xs text-white/30 hover:text-white/60 transition-colors">Dashboard</a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Projects */}
        <aside className="w-72 flex-shrink-0 flex flex-col min-h-0 overflow-hidden" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
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

        {/* Center/Right Content */}
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
          <>
            {/* Project Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col min-h-0 overflow-hidden" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Tabs */}
              <div className="flex gap-1 p-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {(["chat", "annotations", "team"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      activeTab === tab ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "team" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs text-white/30 uppercase tracking-widest">Team Members</h3>
                      {isManager && (
                        <button
                          onClick={() => setShowAddMember(true)}
                          className="text-[10px] text-white/50 hover:text-white/80 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white/80">{member.username}</span>
                            <RoleBadge role={member.role} />
                          </div>
                          {member.email && (
                            <div className="text-[10px] text-white/40">{member.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "annotations" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs text-white/30 uppercase tracking-widest">Annotations</h3>
                      <button
                        onClick={() => setShowAnnotationPanel(true)}
                        className="text-[10px] text-white/50 hover:text-white/80 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {annotations.length === 0 ? (
                        <p className="text-xs text-white/30 text-center py-4">No annotations yet.</p>
                      ) : (
                        annotations.map((ann) => (
                          <div key={ann.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-start gap-2 mb-2">
                              <AnnotationTypeIcon type={ann.annotation_type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/70 line-clamp-3">{ann.content}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/40">
                              <span>{ann.author_name}</span>
                              {ann.file_path && (
                                <span className="truncate max-w-[100px]">{ann.file_path}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "chat" && (
                  <div className="space-y-4">
                    <h3 className="text-xs text-white/30 uppercase tracking-widest">Quick Actions</h3>
                    <button
                      onClick={() => {
                        setChatInput("What are the known issues in this codebase?");
                        setActiveTab("chat");
                      }}
                      className="w-full text-left p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/[0.08] transition-colors"
                    >
                      <div className="text-xs text-white/70">Find known issues</div>
                      <div className="text-[10px] text-white/40 mt-1">Search bug reports and warnings</div>
                    </button>
                    <button
                      onClick={() => {
                        setChatInput("Explain the architecture of this project");
                        setActiveTab("chat");
                      }}
                      className="w-full text-left p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/[0.08] transition-colors"
                    >
                      <div className="text-xs text-white/70">Explain architecture</div>
                      <div className="text-[10px] text-white/40 mt-1">Get high-level overview</div>
                    </button>
                    <button
                      onClick={() => setShowAnnotationPanel(true)}
                      className="w-full text-left p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/[0.08] transition-colors"
                    >
                      <div className="text-xs text-white/70">Add annotation</div>
                      <div className="text-[10px] text-white/40 mt-1">Share knowledge with team</div>
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="border-b border-white/5 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-400" />
                    Team Chat
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    {activeProject.org_id}/{activeProject.repo}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/40 uppercase tracking-widest">Debug</span>
                    <button
                      onClick={() => setDebugMode(!debugMode)}
                      className={`relative w-8 h-4 rounded-full transition-colors ${debugMode ? "bg-blue-500/80" : "bg-white/10"}`}
                    >
                      <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${debugMode ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-4" />
                    <p className="text-sm text-white/30">Start a conversation with your team.</p>
                    <p className="text-xs text-white/20 mt-2">Ask about the codebase and see team annotations in context.</p>
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

                        {debugMode && msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-2">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest">Tool Invocations ({msg.toolCalls.length})</span>
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
                    placeholder="Ask about the codebase..."
                    disabled={chatLoading}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-30"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="p-3 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    style={{
                      background: chatInput.trim() ? "white" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Send className="w-4 h-4" style={{ color: chatInput.trim() ? "black" : "rgba(255,255,255,0.3)" }} />
                  </button>
                </form>
              </div>
            </main>
          </>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-white/10 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-white font-medium">Create Project</h2>
              <button onClick={() => setShowCreateProject(false)} className="text-white/40 hover:text-white">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Organization</label>
                  <input
                    type="text"
                    value={newProjectOrg}
                    onChange={(e) => setNewProjectOrg(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                    placeholder="e.g., myorg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Repository</label>
                  <input
                    type="text"
                    value={newProjectRepo}
                    onChange={(e) => setNewProjectRepo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                    placeholder="e.g., backend"
                  />
                </div>
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
                disabled={!newProjectName.trim() || !newProjectOrg.trim() || !newProjectRepo.trim()}
                className="w-full py-3 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-30"
              >
                Create Project
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
              <button onClick={() => setShowAddMember(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Username</label>
                <input
                  type="text"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                  placeholder="Enter username"
                />
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
                disabled={!newMemberUsername.trim()}
                className="w-full py-3 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-30"
              >
                Add Member
              </button>
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
