import { Canvas } from "@react-three/fiber";
import { RevealSection } from "../components/shared/RevealSection";
import { NeuralBrain } from "../components/three-d/NeuralBrain";

export function SecondBrainSection() {
  return (
    <section className="relative py-40 overflow-hidden" style={{ background: "#060606" }}>
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, rgba(192,132,252,0.08) 30%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <RevealSection>
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Digital Cognition
              </div>
              <h2
                className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Xmem is your
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  second brain.
                </span>
              </h2>
              <div
                className="p-6 md:p-8 rounded-2xl mb-8 backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                }}
              >
                <p className="text-lg text-white/60 leading-relaxed">
                  Xmem stores, organizes, and connects your memories, knowledge, and conversations so you never lose context.
                </p>
              </div>
            </RevealSection>
          </div>

          <RevealSection delay={0.3}>
            <div className="h-[400px] md:h-[600px] w-full relative">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <NeuralBrain />
              </Canvas>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
