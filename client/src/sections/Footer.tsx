import { Link } from "wouter";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative border-t py-16"
      style={{ background: "#050505", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="mb-4 flex cursor-pointer items-center gap-2">
              <img src="/logo.png" alt="Xmem" className="h-8 w-auto invert" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/35">
              India's #1 open-source memory layer for AI agents. Built for the machine age.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: [
                { label: "Scanner", href: "/scanner" },
                { label: "Context", href: "/context" },
                { label: "Documentation", href: "/docs" },
                { label: "Blog", href: "/blogs" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "API Reference", href: "/docs/rest-api" },
                { label: "Quickstart", href: "/docs/quickstart" },
                { label: "Agentic Pipeline", href: "/docs/agentic-pipeline" },
                { label: "Connectors", href: "/docs/agent-connectors" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
                {col.title}
              </div>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block cursor-pointer text-sm text-white/30 transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="text-xs text-white/20">
            Copyright 2026 Xmem Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/XortexAI/Xmem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-white/30 transition-colors hover:text-white/60"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
