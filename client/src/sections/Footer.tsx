import { Link } from "wouter";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative py-16 border-t"
      style={{ background: "#050505", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <img
                src="/logo.png"
                alt="Xmem"
                className="h-8 w-auto invert"
              />
            </Link>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Memory infrastructure for the machine age. Built for autonomous AI
              systems.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: [
                { label: "Scanner", href: "/scanner" },
                { label: "Context", href: "/context" },
                { label: "Documentation", href: "/docs" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "API Reference", href: "/docs#api" },
                { label: "Quickstart", href: "/docs#quickstart" },
                { label: "Architecture", href: "/docs#architecture" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                {col.title}
              </div>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-white/30 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="text-xs text-white/20">
            © 2026 Xmem Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/XortexAI/Xmem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
