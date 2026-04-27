import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  ChevronDown,
  Shield,
  User,
  Crown,
  Code,
  Menu,
  CheckCircle,
  MoreVertical,
  Trash2,
  Edit3,
  BookmarkPlus,
  ClipboardList,
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
  annotation_type: "bug_report" | "fix" | "explanation" | "warning" | "feature_idea" | "instruction" | "architecture" | "best_practice" | "todo" | "technical_debt";
  author_id?: string;
  author_name: string;
  author_role: string;
  severity?: "low" | "medium" | "high" | "critical";
  file_path?: string;
  symbol_name?: string;
  created_at: string;
  score?: number;
  assigned_to?: string;
  assigned_to_name?: string;
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
    instruction: { icon: Info, color: "text-amber-400" },
    architecture: { icon: Code, color: "text-indigo-400" },
    best_practice: { icon: CheckCircle, color: "text-teal-400" },
    todo: { icon: AlertCircle, color: "text-orange-400" },
    technical_debt: { icon: AlertCircle, color: "text-rose-400" },
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
  const [debugMode, setDebugMode] = useState(false);

  // UI state
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [showEditMember, setShowEditMember] = useState<TeamMember | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "annotations" | "team">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Text selection → annotation
  const [selectedTextForAnnotation, setSelectedTextForAnnotation] = useState("");
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
  // Assignment
  const [newAnnotationAssignedTo, setNewAnnotationAssignedTo] = useState<{ id: string; username: string } | null>(null);
  // Disambiguation: when auto-extracted annotation has assigned_to_name but multiple matches exist
  const [pendingAssignment, setPendingAssignment] = useState<{ annotationId: string; roleName: string; candidates: TeamMember[] } | null>(null);

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
  // collapsed state for "Relevant Team Knowledge" sections: keyed by message id
  const [collapsedAnnotationMsgs, setCollapsedAnnotationMsgs] = useState<Record<string, boolean>>({});

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<"idle" | "phase1" | "phase2" | "complete" | "failed">("idle");
  const [scanProgress, setScanProgress] = useState({ files_processed: 0, total_files: 0, symbols_indexed: 0 });
  const [scanError, setScanError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Global mouseup listener for text-selection → annotation popup
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Small delay so selection is fully committed
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.toString().trim().length < 10) {
          setSelectionPopup(null);
          return;
        }
        // Only show popup if selection is inside the chat container
        const container = chatContainerRef.current;
        if (!container) { setSelectionPopup(null); return; }
        const anchorNode = selection.anchorNode;
        if (!container.contains(anchorNode)) { setSelectionPopup(null); return; }
        const text = selection.toString().trim();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedTextForAnnotation(text);
        setSelectionPopup({ x: rect.left + rect.width / 2, y: rect.top - 10 });
      }, 10);
    };

    const handleClick = (e: MouseEvent) => {
      // Clear popup when clicking outside the floating button
      const target = e.target as HTMLElement;
      if (!target.closest('[data-selection-popup]')) {
        setSelectionPopup(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

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

  // Check scan status when project changes (including on page reload)
  useEffect(() => {
    if (!activeProject || !token || !username) return;

    const checkScanStatus = async () => {
      try {
        console.log("[Enterprise] Checking scan status for", activeProject.org_id, activeProject.repo);
        const resp = await fetch(
          `${API_URL}/v1/scanner/catalog-status?username=${encodeURIComponent(username)}&org_id=${encodeURIComponent(activeProject.org_id)}&repo=${encodeURIComponent(activeProject.repo)}`,
          { headers: authBearerHeaders(token) }
        );
        const data = await resp.json();
        console.log("[Enterprise] Scan status response:", data);

        if (data.phase1_status === "complete" && data.phase2_status === "complete") {
          setScanPhase("complete");
          setIsScanning(false);
          setScanError("");
          console.log("[Enterprise] Repo already scanned — chat enabled");
        } else if (data.phase1_status === "failed" || data.phase2_status === "failed") {
          setScanPhase("failed");
          setIsScanning(false);
          setScanError("Previous scan failed. Please try scanning again.");
          console.log("[Enterprise] Previous scan failed");
        } else if (data.phase1_status === "running" || data.phase2_status === "running") {
          // Scan is still in progress — start polling
          setScanPhase(data.phase1_status === "complete" ? "phase2" : "phase1");
          setIsScanning(true);
          setScanError("");
          console.log("[Enterprise] Scan in progress — starting poll");
          pollScanStatusForProject(activeProject);
        } else {
          // Not started or unknown — show idle
          setScanPhase("idle");
          setIsScanning(false);
          setScanError("");
          console.log("[Enterprise] Scan not started — showing idle");
        }
      } catch (e) {
        console.error("[Enterprise] Failed to check scan status:", e);
        // Default to idle so user can trigger scan manually
        setScanPhase("idle");
      }
    };

    checkScanStatus();
  }, [activeProject, token, username]);

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

  // Create or Update annotation
  const handleCreateAnnotation = async () => {
    if (!activeProject || !newAnnotationContent.trim()) return;

    try {
      if (editingAnnotation) {
        const resp = await fetch(
          `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations/${editingAnnotation.id}`,
          {
            method: "PATCH",
            headers: authJsonHeaders(token),
            body: JSON.stringify({ content: newAnnotationContent }),
          }
        );
        const data = await resp.json();
        if (data.status === "ok") {
          setNewAnnotationContent("");
          setNewAnnotationTarget("");
          setShowAnnotationPanel(false);
          setEditingAnnotation(null);
          setNewAnnotationAssignedTo(null);
          loadAnnotationsForProject(activeProject.id);
        }
      } else {
        const body: Record<string, any> = {
          content: newAnnotationContent,
          annotation_type: newAnnotationType,
          file_path: newAnnotationTarget || undefined,
        };
        if (newAnnotationAssignedTo && (newAnnotationType === "instruction" || newAnnotationType === "todo")) {
          body.assigned_to = newAnnotationAssignedTo.id;
          body.assigned_to_name = newAnnotationAssignedTo.username;
        }
        const resp = await fetch(
          `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations`,
          { method: "POST", headers: authJsonHeaders(token), body: JSON.stringify(body) }
        );
        const data = await resp.json();
        if (data.status === "ok") {
          setNewAnnotationContent("");
          setNewAnnotationTarget("");
          setNewAnnotationAssignedTo(null);
          setSelectedTextForAnnotation("");
          setShowAnnotationPanel(false);
          loadAnnotationsForProject(activeProject.id);
        }
      }
    } catch (e) {
      console.error("Failed to save annotation:", e);
    }
  };

  const handleEditAnnotation = (ann: Annotation) => {
    setEditingAnnotation(ann);
    setNewAnnotationContent(ann.content);
    setNewAnnotationType(ann.annotation_type);
    setNewAnnotationTarget(ann.file_path || "");
    setNewAnnotationAssignedTo(
      ann.assigned_to && ann.assigned_to_name
        ? { id: ann.assigned_to, username: ann.assigned_to_name }
        : null
    );
    setShowAnnotationPanel(true);
  };

  const openAnnotationFromSelection = () => {
    if (!selectedTextForAnnotation) return;
    setNewAnnotationContent(selectedTextForAnnotation);
    setNewAnnotationType("explanation");
    setNewAnnotationTarget("");
    setNewAnnotationAssignedTo(null);
    setEditingAnnotation(null);
    setShowAnnotationPanel(true);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteAnnotation = async (ann: Annotation) => {
    if (!activeProject) return;
    if (!window.confirm("Delete this annotation? This cannot be undone.")) return;
    try {
      const resp = await fetch(
        `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations/${ann.id}`,
        { method: "DELETE", headers: authBearerHeaders(token) }
      );
      const data = await resp.json();
      if (data.status === "ok") {
        setAnnotations(prev => prev.filter(a => a.id !== ann.id));
      }
    } catch (e) {
      console.error("Failed to delete annotation:", e);
    }
  };

  // After auto-extraction: resolve fuzzy assigned_to_name to a real team member
  const handleAnnotationsCreated = useCallback((roleName: string, ids: string[]) => {
    if (!roleName || !ids.length) return;
    const lower = roleName.toLowerCase();
    // Try exact username match first
    const exact = teamMembers.find(m => m.username.toLowerCase() === lower);
    if (exact) {
      // Patch the annotation with the exact user_id
      ids.forEach(async (annId) => {
        if (!activeProject) return;
        await fetch(
          `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations/${annId}`,
          {
            method: "PATCH",
            headers: authJsonHeaders(token),
            body: JSON.stringify({ assigned_to: exact.user_id, assigned_to_name: exact.username }),
          }
        );
      });
      loadAnnotationsForProject(activeProject!.id);
      return;
    }
    // Try role match (e.g., "intern" matches all interns)
    const byRole = teamMembers.filter(m => m.role.toLowerCase() === lower || m.username.toLowerCase().includes(lower));
    if (byRole.length === 1) {
      // Only one match — auto-assign
      const m = byRole[0];
      ids.forEach(async (annId) => {
        if (!activeProject) return;
        await fetch(
          `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations/${annId}`,
          {
            method: "PATCH",
            headers: authJsonHeaders(token),
            body: JSON.stringify({ assigned_to: m.user_id, assigned_to_name: m.username }),
          }
        );
      });
      loadAnnotationsForProject(activeProject!.id);
    } else if (byRole.length > 1) {
      // Multiple matches — show disambiguation modal
      setPendingAssignment({ annotationId: ids[0], roleName, candidates: byRole });
    } else {
      // No match — still refresh to show with just the name
      loadAnnotationsForProject(activeProject!.id);
    }
  }, [teamMembers, activeProject, token]);

  const assignPendingAnnotation = async (member: TeamMember) => {
    if (!pendingAssignment || !activeProject) return;
    await fetch(
      `${API_URL}/v1/enterprise/projects/${activeProject.id}/annotations/${pendingAssignment.annotationId}`,
      {
        method: "PATCH",
        headers: authJsonHeaders(token),
        body: JSON.stringify({ assigned_to: member.user_id, assigned_to_name: member.username }),
      }
    );
    setPendingAssignment(null);
    loadAnnotationsForProject(activeProject.id);
  };


  // Load annotations for project
  const loadAnnotationsForProject = async (projectId: string) => {
    if (!token) return;

    setLoadingAnnotations(true);
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
    } finally {
      setLoadingAnnotations(false);
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeProject || chatLoading || scanPhase !== "complete") return;

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
              // Insert annotations BEFORE the assistant message so the
              // assistant bubble always stays last and text chunks work.
              setMessages((prev) => {
                const assistantIdx = prev.findIndex((m) => m.id === assistantId);
                if (assistantIdx >= 0) {
                  const before = prev.slice(0, assistantIdx);
                  const after = prev.slice(assistantIdx);
                  return [
                    ...before,
                    {
                      id: `annotations-${Date.now()}`,
                      role: "annotations" as const,
                      content: "",
                      annotations: chunk.annotations,
                    },
                    ...after,
                  ];
                }
                // Fallback: append at end
                return [
                  ...prev,
                  {
                    id: `annotations-${Date.now()}`,
                    role: "annotations" as const,
                    content: "",
                    annotations: chunk.annotations,
                  },
                ];
              });
            } else if (chunk.type === "chunk") {
              const textToAdd = chunk.text || "";
              if (textToAdd) {
                setMessages((prev) => {
                  // Find assistant message by ID instead of assuming it's last
                  const idx = prev.findIndex((m) => m.id === assistantId);
                  if (idx >= 0) {
                    const updated = { ...prev[idx], content: prev[idx].content + textToAdd };
                    return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
                  }
                  return prev;
                });
              }
            } else if (chunk.type === "annotations_created") {
              // Auto-extracted annotation — show confirmation in chat
              const count = chunk.count || chunk.ids?.length || 0;
              const assignee = chunk.assigned_to_name;
              let statusText = `✅ ${count} annotation${count > 1 ? "s" : ""} saved to team knowledge`;
              if (assignee) {
                statusText += ` — assigned to "${assignee}"`;
              }
              setMessages((prev) => [
                ...prev,
                {
                  id: `status-ann-${Date.now()}`,
                  role: "status" as const,
                  content: statusText,
                },
              ]);
              // Try to resolve fuzzy assigned_to_name
              if (assignee && chunk.ids?.length) {
                handleAnnotationsCreated(assignee, chunk.ids);
              } else if (chunk.ids?.length) {
                loadAnnotationsForProject(activeProject!.id);
              }
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === assistantId);
        if (idx >= 0) {
          const updated = { ...prev[idx], content: "Failed to get response. Please try again." };
          return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
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
              <div className="flex-1 flex flex-col min-h-0">
                {/* CHAT TAB */}
                {activeTab === "chat" && (
                  <div className="flex flex-col h-full">
                    {/* Chat Header Info */}
                    <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40">Ask about the codebase and see team annotations in context</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Debug</span>
                        <button
                          onClick={() => setDebugMode(!debugMode)}
                          className={`relative w-8 h-4 rounded-full transition-colors ${debugMode ? "bg-blue-500/80" : "bg-white/10"}`}
                        >
                          <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${debugMode ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>
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
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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

                {/* Selection popup — fixed to viewport */}
                {selectionPopup && (
                  <div
                    data-selection-popup
                    className="fixed z-[9999] transform -translate-x-1/2 -translate-y-full pointer-events-auto"
                    style={{ left: selectionPopup.x, top: selectionPopup.y }}
                  >
                    <button
                      data-selection-popup
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); openAnnotationFromSelection(); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg shadow-2xl border border-purple-400/40 transition-colors font-medium"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Save as Annotation
                    </button>
                    <div className="w-2.5 h-2.5 bg-purple-600 rotate-45 mx-auto -mt-1.5" />
                  </div>
                )}

                {messages.map((msg) => {
                  if (msg.role === "status") {
                    const isAnnotationConfirm = msg.content.startsWith("✅");
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                          isAnnotationConfirm
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs"
                            : "bg-white/5 border-white/5 text-white/30 text-[10px] uppercase tracking-widest"
                        }`}>
                          {isAnnotationConfirm && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  if (msg.role === "annotations") {
                    const isCollapsed = collapsedAnnotationMsgs[msg.id] !== false; // default collapsed
                    return (
                      <div key={msg.id} className="my-3">
                        <button
                          onClick={() => setCollapsedAnnotationMsgs(prev => ({ ...prev, [msg.id]: !isCollapsed }))}
                          className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest hover:text-white/50 transition-colors group mb-1"
                        >
                          {isCollapsed
                            ? <ChevronRight className="w-3 h-3 group-hover:text-white/50" />
                            : <ChevronDown className="w-3 h-3 group-hover:text-white/50" />
                          }
                          Relevant Team Knowledge
                          <span className="text-white/20 normal-case tracking-normal capitalize">
                            ({msg.annotations?.length ?? 0})
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="space-y-2 mt-2">
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
                        )}
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
                        <div className="text-sm font-light leading-relaxed select-text">
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

                        {/* Hint shown below completed assistant messages */}
                        {!isUser && msg.content && !chatLoading && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-[10px] text-white/20">
                            <BookmarkPlus className="w-3 h-3" />
                            Select text to save as annotation
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
                        onClick={() => {
                          setEditingAnnotation(null);
                          setNewAnnotationContent("");
                          setNewAnnotationTarget("");
                          setShowAnnotationPanel(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Annotation
                      </button>
                    </div>

                    {/* Annotations List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      {loadingAnnotations ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 text-white/20 animate-spin mb-4" />
                          <p className="text-sm text-white/40">Loading team knowledge...</p>
                        </div>
                      ) : annotations.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-10 h-10 text-white/10 mx-auto mb-4" />
                          <p className="text-sm text-white/30">No annotations yet.</p>
                          <p className="text-xs text-white/20 mt-2">Add annotations to share knowledge with your team.</p>
                          <button
                            onClick={() => {
                              setEditingAnnotation(null);
                              setNewAnnotationContent("");
                              setNewAnnotationTarget("");
                              setShowAnnotationPanel(true);
                            }}
                            className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-xs text-white hover:bg-white/20 transition-colors"
                          >
                            Add First Annotation
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-w-3xl">
                          {annotations.map((ann) => {
                            const isAssignedToMe = ann.assigned_to === userId;
                            const isAssigned = !!ann.assigned_to_name;
                            return (
                              <div
                                key={ann.id}
                                className={`p-4 rounded-lg border transition-colors group ${
                                  isAssignedToMe
                                    ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50"
                                    : "bg-white/[0.03] border-white/10 hover:border-white/20"
                                }`}
                              >
                                {/* Assignee banner */}
                                {isAssigned && (
                                  <div className={`flex items-center gap-1.5 text-[10px] mb-2 pb-2 border-b ${isAssignedToMe ? "border-amber-500/20 text-amber-400" : "border-white/5 text-white/30"}`}>
                                    <User className="w-3 h-3" />
                                    {isAssignedToMe ? "Assigned to you" : `Assigned to ${ann.assigned_to_name}`}
                                  </div>
                                )}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
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
                                  {(currentUserRole === "manager" || ann.author_id === userId) && (
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                      <button
                                        onClick={() => handleEditAnnotation(ann)}
                                        title="Edit annotation"
                                        className="p-2 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAnnotation(ann)}
                                        title="Delete annotation"
                                        className="p-2 hover:bg-red-500/20 rounded transition-colors text-white/40 hover:text-red-400"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
          <div className="bg-[#111] rounded-xl border border-white/10 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg text-white font-medium">
                  {editingAnnotation ? "Edit Annotation" : selectedTextForAnnotation ? "Save as Annotation" : "Add Annotation"}
                </h2>
                {selectedTextForAnnotation && !editingAnnotation && (
                  <p className="text-xs text-white/40 mt-0.5">From selected response text</p>
                )}
              </div>
              <button onClick={() => {
                setShowAnnotationPanel(false);
                setEditingAnnotation(null);
                setNewAnnotationContent("");
                setNewAnnotationTarget("");
                setNewAnnotationAssignedTo(null);
                setSelectedTextForAnnotation("");
              }} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["explanation", "warning", "bug_report", "fix", "feature_idea", "instruction", "architecture", "best_practice", "todo", "technical_debt"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setNewAnnotationType(type);
                        if (type !== "instruction" && type !== "todo") setNewAnnotationAssignedTo(null);
                      }}
                      disabled={!!editingAnnotation}
                      className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors ${
                        newAnnotationType === type
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      } ${editingAnnotation ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {type.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign To — only for instruction/todo types, only for managers */}
              {!editingAnnotation && (newAnnotationType === "instruction" || newAnnotationType === "todo") && currentUserRole === "manager" && (
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Assign To <span className="text-white/20 normal-case tracking-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* Unassigned option */}
                    <button
                      onClick={() => setNewAnnotationAssignedTo(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        !newAnnotationAssignedTo
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      Everyone
                    </button>
                    {/* Team members */}
                    {teamMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setNewAnnotationAssignedTo(
                          newAnnotationAssignedTo?.id === m.user_id ? null : { id: m.user_id, username: m.username }
                        )}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          newAnnotationAssignedTo?.id === m.user_id
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-white/5 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        <User className="w-3 h-3" />
                        {m.username}
                        <span className="text-white/30 text-[10px]">({m.role.replace("_", " ")})</span>
                      </button>
                    ))}
                  </div>
                  {newAnnotationAssignedTo && (
                    <p className="text-[11px] text-amber-400/70 mt-1.5">
                      This {newAnnotationType} will be highlighted for <strong>{newAnnotationAssignedTo.username}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Target file/symbol */}
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

              {/* Content */}
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
                {editingAnnotation ? "Save Changes" : "Create Annotation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disambiguation modal: resolve "intern" to a specific team member */}
      {pendingAssignment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-amber-500/20 w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <ClipboardList className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base text-white font-medium">Who is this for?</h2>
                <p className="text-xs text-white/50 mt-1">
                  A task was created for <strong className="text-amber-300">"{pendingAssignment.roleName}"</strong>.
                  Multiple people match — pick who should own it:
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {pendingAssignment.candidates.map(m => (
                <button
                  key={m.id}
                  onClick={() => assignPendingAnnotation(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-lg text-left transition-colors"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-sm text-white font-medium">{m.username}</div>
                    <div className="text-[10px] text-white/40 capitalize">{m.role.replace("_", " ")}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { setPendingAssignment(null); loadAnnotationsForProject(activeProject!.id); }}
                className="w-full py-2.5 text-white/40 text-xs hover:text-white transition-colors mt-2"
              >
                Leave unassigned
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
