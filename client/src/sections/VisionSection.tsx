import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { RevealSection } from "../components/shared/RevealSection";
import { VisionScene } from "../components/three-d/VisionScene";

export function VisionSection() {
  return (
    <section
      className="relative py-40 min-h-screen flex items-center overflow-hidden"
      style={{ background: "#030303" }}
    >
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <VisionScene />
        </Canvas>
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(3,3,3,0.9) 80%)",
        }}
      />

      <div
        className="relative max-w-5xl mx-auto px-6 text-center"
        style={{ zIndex: 10 }}
      >
        <RevealSection>
          <div
            className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            The Vision
          </div>
          <h2
            className="text-6xl md:text-8xl font-bold text-white mb-10 tracking-tighter leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Toward Autonomous
            <br />
            <span className="gradient-text">Intelligence</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left max-w-4xl mx-auto">
            {[
              {
                title: "Intelligence without memory is incomplete",
                desc: "A system that forgets is not autonomous — it's a sophisticated autocomplete.",
              },
              {
                title: "Memory is infrastructure",
                desc: "Just as compute and networking became commodities, memory must become a foundational layer.",
              },
              {
                title: "Continuity enables growth",
                desc: "Agents that remember can learn, adapt, and compound their knowledge over time.",
              },
              {
                title: "The future agents learn forever",
                desc: "Xmem is the substrate that lets AI systems persist, evolve, and become truly autonomous.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <h3 className="text-white font-semibold mb-2 text-sm">
                  {item.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
