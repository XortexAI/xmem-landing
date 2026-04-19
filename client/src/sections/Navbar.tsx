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
import { LayoutDashboard, LogOut, User } from "lucide-react";

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

        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link href="/scanner" className="text-sm text-gray-300 hover:text-white transition-colors">
            Scanner
          </Link>
          <Link href="/context" className="text-sm text-gray-300 hover:text-white transition-colors">
            Context
          </Link>
          <a 
            href="/docs" 
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Documentation
          </a>
        </div>

        <div className="flex items-center gap-3">
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
