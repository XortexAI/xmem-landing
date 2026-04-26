import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroScene } from "../components/three-d/HeroScene";
import { Navbar } from "../sections/Navbar";
import { HeroSection } from "../sections/HeroSection";
import { ProblemSection } from "../sections/ProblemSection";
import { SolutionSection } from "../sections/SolutionSection";
import { DemoSection } from "../sections/Demo";
import { SecondBrainSection } from "../sections/SecondBrainSection";
import { BenchmarkSection } from "../sections/BenchmarkSection";
import { SystemArchitectureSection } from "../sections/SystemArchitectureSection";
import { HowItWorksSection } from "../sections/HowItWorksSection";
import { AgenticSection } from "../sections/AgenticSection";
import { EnterpriseSection } from "../sections/EnterpriseSection";
import { DeveloperSection } from "../sections/DeveloperSection";
import { UseCasesSection } from "../sections/UseCasesSection";
import { VisionSection } from "../sections/VisionSection";
import { CTASection } from "../sections/CTASection";
import { Footer } from "../sections/Footer";
import { BrainOverlay } from "../components/BrainOverlay";

export default function Home() {
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === "undefined" ? 800 : window.innerHeight,
  );
  const { scrollY } = useScroll();
  const canvasOpacity = useTransform(
    scrollY,
    [viewportHeight * 0.8, viewportHeight * 1.18],
    [1, 0],
  );

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="dark relative"
      style={{ background: "#080808", minHeight: "100vh" }}
    >
      <BrainOverlay />

      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: canvasOpacity }}
      >
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <HeroScene />
          <Stars
            radius={100}
            depth={50}
            count={600}
            factor={2}
            saturation={0}
            fade
            speed={0.3}
          />
        </Canvas>
      </motion.div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <DemoSection />
        <SecondBrainSection />
        <BenchmarkSection />
        <SystemArchitectureSection />
        <HowItWorksSection />
        <AgenticSection />
        <EnterpriseSection />
        <DeveloperSection />
        <UseCasesSection />
        <VisionSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
