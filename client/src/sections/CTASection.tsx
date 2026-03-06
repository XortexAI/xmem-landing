import { Shield, ArrowRight, ChevronRight } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

export function CTASection() {
  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none pulse-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div
        className="relative max-w-4xl mx-auto px-6 text-center"
        style={{ zIndex: 10 }}
      >
        <RevealSection>
          <div
            className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Get Started
          </div>
          <h2
            className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Build AI That
            <br />
            <span className="gradient-text">Remembers.</span>
          </h2>
          <p className="text-xl text-white/40 mb-14 max-w-xl mx-auto leading-relaxed">
            Join the engineers building the next generation of autonomous AI
            systems.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              data-testid="button-get-started-cta"
              className="flex items-center gap-2 px-10 py-5 rounded-md font-semibold text-black text-base transition-all duration-200"
              style={{ background: "white" }}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              data-testid="button-early-access"
              className="flex items-center gap-2 px-10 py-5 rounded-md font-medium text-white text-base transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Join Early Access
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              "SOC 2 Type II",
              "GDPR Compliant",
              "HIPAA Ready",
              "99.99% SLA",
            ].map((badge) => (
              <div
                key={badge}
                className="text-xs text-white/30 flex items-center gap-2"
              >
                <Shield className="w-3 h-3" />
                {badge}
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
