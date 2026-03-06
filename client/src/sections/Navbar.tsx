import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-white font-bold text-xl tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            xmem
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Product", "Docs", "Enterprise", "Pricing"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-white/60 hover:text-white transition-colors duration-200"
              style={{ letterSpacing: "0.01em" }}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Log in
          </button>
          <button
            data-testid="button-get-started-nav"
            className="text-sm font-medium px-4 py-2 rounded-md transition-all duration-200"
            style={{ background: "white", color: "black" }}
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
