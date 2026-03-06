import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative py-20 border-t"
      style={{ background: "#050505", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                xmem
              </span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Memory infrastructure for the machine age. Built for autonomous AI
              systems.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Features", "Architecture", "Security", "Changelog"],
            },
            {
              title: "Developers",
              links: ["Documentation", "SDK Reference", "CLI", "Status"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                {col.title}
              </div>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-sm text-white/30 hover:text-white/70 transition-colors"
                  >
                    {link}
                  </a>
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
          <div className="flex gap-6">
            {["Privacy", "Terms", "Security"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
