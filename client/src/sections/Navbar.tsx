import { Link } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Code2,
  Download,
  FileText,
  Github,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  Puzzle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
} from "lucide-react";

const extensionVideoUrl =
  "https://github.com/user-attachments/assets/8e3349ab-63c9-4046-821d-ca8097948440";

const GITHUB_REPO = "XortexAI/Xmem";
const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setStars(data.stargazers_count);
      } catch {
        setError(true);
      }
    };
    fetchStars();
  }, []);

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
    >
      <Github className="h-4 w-4" />
      <span className="hidden sm:inline">Star</span>
      <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        {stars !== null ? (
          formatStars(stars)
        ) : error ? (
          "—"
        ) : (
          <span className="animate-pulse">...</span>
        )}
      </span>
    </a>
  );
}

function MegaLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof ScanSearch;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group/item flex gap-3 rounded-md border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
          {title}
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover/item:opacity-70" />
        </span>
        <span className="block text-xs leading-relaxed text-white/50">
          {description}
        </span>
      </span>
    </a>
  );
}

function MegaMenu({
  label,
  width = "w-[760px]",
  children,
}: {
  label: string;
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button className="text-sm text-gray-300 transition-colors hover:text-white">
        {label}
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-5 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div
          className={`${width} overflow-hidden rounded-md border border-white/10 bg-[#090909]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass-strong py-3" : "py-6"}`}
      style={{
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img
            src="/logo.png"
            alt="Xmem"
            className="h-8 w-auto invert"
          />
        </Link>

        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          <MegaMenu label="Services">
            <div className="grid grid-cols-[1fr_280px] gap-5 p-5">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">XMem services</div>
                    <div className="mt-1 text-xs text-white/45">
                      Build, import, query, and extend persistent memory.
                    </div>
                  </div>
                  <Package className="h-5 w-5 text-white/45" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MegaLink
                    href="/scanner"
                    icon={ScanSearch}
                    title="Scanner"
                    description="Index a GitHub repository and chat with codebase context."
                  />
                  <MegaLink
                    href="/context"
                    icon={FileText}
                    title="Context"
                    description="Import shared conversations and turn them into memory."
                  />
                  <MegaLink
                    href="/docs#api"
                    icon={Code2}
                    title="API"
                    description="Use ingest, search, retrieve, and scanner endpoints directly."
                  />
                  <MegaLink
                    href="/xmem-extension-dist.zip"
                    icon={Download}
                    title="Extension"
                    description="Download the Chrome extension dist package."
                  />
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Puzzle className="h-4 w-4" />
                  Browser extension
                </div>
                <video
                  className="mb-4 aspect-video w-full rounded-md border border-white/10 bg-black object-cover"
                  src={extensionVideoUrl}
                  controls
                  muted
                  preload="metadata"
                />
                <ol className="space-y-2 text-xs leading-relaxed text-white/55">
                  <li>1. Download and unzip the dist package.</li>
                  <li>2. Open chrome://extensions and enable Developer mode.</li>
                  <li>3. Load unpacked, select dist, then set API URL and key.</li>
                </ol>
              </div>
            </div>
          </MegaMenu>

          <MegaMenu label="Pricing" width="w-[560px]">
            <div className="grid grid-cols-2 gap-4 p-5">
              <a
                href="/scanner"
                className="rounded-md border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              >
                <Sparkles className="mb-4 h-5 w-5 text-white/70" />
                <div className="text-sm font-semibold text-white">Free for everyone</div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  Scanner, context importer, docs, and local extension setup for individual builders.
                </p>
              </a>
              <a
                href="mailto:xmemlabs@gmail.com?subject=XMem%20Enterprise"
                className="rounded-md border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              >
                <Building2 className="mb-4 h-5 w-5 text-white/70" />
                <div className="text-sm font-semibold text-white">Enterprise</div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  Contact xmemlabs@gmail.com for team deployment, support, and private onboarding.
                </p>
              </a>
            </div>
          </MegaMenu>

          <MegaMenu label="Documentation" width="w-[680px]">
            <div className="grid grid-cols-[1fr_220px] gap-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <MegaLink
                  href="/docs#quickstart"
                  icon={Terminal}
                  title="Quickstart"
                  description="Start the server, configure storage, and run the first memory call."
                />
                <MegaLink
                  href="/docs#api"
                  icon={KeyRound}
                  title="API reference"
                  description="Authentication, memory endpoints, scanner, and extension APIs."
                />
                <MegaLink
                  href="/docs#architecture"
                  icon={ShieldCheck}
                  title="Architecture"
                  description="Classifier, domain agents, Judge, Weaver, and storage backends."
                />
                <MegaLink
                  href="/docs#extension"
                  icon={Puzzle}
                  title="Extension guide"
                  description="Install, configure, and use XMem in AI chat tools."
                />
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 p-4">
                <BookOpen className="mb-4 h-5 w-5 text-white/60" />
                <div className="text-sm font-semibold text-white">Reference set</div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  Consolidated from the XMem server README and extension README into one practical docs page.
                </p>
              </div>
            </div>
          </MegaMenu>

          <Link href="/blog" className="text-sm text-gray-300 transition-colors hover:text-white">
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <GitHubStarButton />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border border-gray-700">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {user?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#111] border-gray-800 text-white" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-gray-800 focus:text-white"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-400 focus:bg-red-900/20 focus:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/scanner"
                data-testid="button-get-started-nav"
                className="text-sm font-medium px-4 py-2 rounded-md transition-all duration-200"
                style={{ background: "white", color: "black" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
