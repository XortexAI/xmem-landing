import { Link } from "wouter";
import { useEffect, useState } from "react";
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
  Github,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ScanSearch,
  Star,
} from "lucide-react";

const GITHUB_REPO = "XortexAI/XMem";
const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

const navItems = [
  ["Stack", "/#stack"],
  ["Architecture", "/#architecture"],
  ["Demo", "/#demo"],
  ["Developers", "/#developers"],
];

function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
        if (!response.ok) return;
        const data = await response.json();
        setStars(data.stargazers_count);
      } catch {
        setStars(null);
      }
    };

    fetchStars();
  }, []);

  const formattedStars =
    stars === null ? "Star" : stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toString();

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:inline-flex"
    >
      <Github className="h-4 w-4" />
      <span className="hidden lg:inline">GitHub</span>
      <span className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/70">
        <Star className="h-3 w-3 fill-[#f7d56d] text-[#f7d56d]" />
        {formattedStars}
      </span>
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-[#050505]/85 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl"
          : "border-transparent bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.04]">
            <span className="font-display text-sm font-semibold text-[#b8ff65]">X</span>
          </span>
          <span className="font-display text-lg font-semibold text-white">XMem</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-md border border-white/10 bg-black/25 p-1 md:flex">
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-sm px-3 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            >
              {label}
            </a>
          ))}
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Docs
          </Link>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Newspaper className="h-4 w-4" />
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <GitHubStarButton />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border border-white/15">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-[#b8ff65] text-sm font-semibold text-black">
                      {user?.name?.charAt(0).toUpperCase() || "X"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border-white/10 bg-[#0c0c0c] text-white" align="end" forceMount>
                <div className="p-2">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="truncate text-xs text-white/45">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer text-[#ff8b74] focus:bg-[#ff6b4a]/10 focus:text-[#ff8b74]"
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
                className="hidden h-10 items-center rounded-md px-3 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/scanner"
                data-testid="button-get-started-nav"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black transition hover:bg-[#b8ff65]"
              >
                <ScanSearch className="h-4 w-4" />
                <span className="hidden sm:inline">Start</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
