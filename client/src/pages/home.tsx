import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { HeroScene } from "../components/three-d/HeroScene";
import { Navbar } from "../sections/Navbar";
import { HeroSection } from "../sections/HeroSection";
import { ProblemSection } from "../sections/ProblemSection";
import { SolutionSection } from "../sections/SolutionSection";
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
  const [canvasOpacity, setCanvasOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight;
      const scroll = window.scrollY;
      const opacity = Math.max(
        0,
        1 - Math.max(0, scroll - vh * 1.5) / (vh * 0.5),
      );
      setCanvasOpacity(opacity);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="dark relative"
      style={{ background: "#080808", minHeight: "100vh" }}
    >
      <BrainOverlay />

      <div
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
      </div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
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
