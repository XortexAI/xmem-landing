import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
  Stars,
  Torus,
  Box,
  Cylinder,
  Ring,
} from "@react-three/drei";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import * as THREE from "three";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Activity,
  Zap,
  Brain,
  Server,
  Globe,
  GitBranch,
  Terminal,
  Code2,
  ChevronRight,
  ArrowRight,
  Cpu,
  Network,
  Database,
  Layers,
} from "lucide-react";

// ──────────────────────────────────────────────
// 3D HERO SCENE
// ──────────────────────────────────────────────

function NeuralNode({
  position,
  size = 0.08,
  delay = 0,
  index = 0,
}: {
  position: [number, number, number];
  size?: number;
  delay?: number;
  index?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current || !matRef.current) return;

    const vh = window.innerHeight;
    const scroll = window.scrollY;

    const progress = Math.max(0, Math.min(scroll / vh, 1));
    const fadeOutProgress = Math.max(0, Math.min((scroll - vh) / vh, 1));

    const time = state.clock.elapsedTime;
    const baseY = position[1] + Math.sin(time * 0.8 + delay) * 0.15;

    const dirX =
      position[0] === 0 ? (index % 2 === 0 ? 1 : -1) : Math.sign(position[0]);
    const targetX = position[0] + dirX * 3.5;
    const targetY = baseY + Math.sin(index) * 2;
    const targetZ = position[2] + 4.5;

    meshRef.current.position.set(
      THREE.MathUtils.lerp(position[0], targetX, progress),
      THREE.MathUtils.lerp(baseY, targetY, progress),
      THREE.MathUtils.lerp(position[2], targetZ, progress),
    );

    const baseScale = 1 + Math.sin(time * 1.2 + delay) * 0.1;
    const currentScale = THREE.MathUtils.lerp(
      baseScale,
      baseScale * 4,
      progress,
    );
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    const currentOpacity =
      THREE.MathUtils.lerp(0.3, 0.7, progress) * (1 - fadeOutProgress);
    matRef.current.opacity = currentOpacity;

    meshRef.current.rotation.x = time * (1 + progress * 2);
    meshRef.current.rotation.y = time * (1 + progress * 2);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.4}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function ConnectionLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const lineRef = useRef<THREE.Line>(null);
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  useFrame((state) => {
    if (!lineRef.current) return;
    const vh = window.innerHeight;
    const scroll = window.scrollY;

    const progress = Math.max(0, Math.min(scroll / (vh * 0.4), 1));
    const baseOpacity = 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = baseOpacity * (1 - progress);
  });

  return (
    // @ts-expect-error - React types conflict with ThreeJS line element
    <line ref={lineRef as any} geometry={geometry}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.15}
        linewidth={1}
      />
    </line>
  );
}

function HeroScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.3,
      0.05,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * -0.2,
      0.05,
    );
    groupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
  });

  const nodes: [number, number, number][] = [
    [0, 0, 0],
    [1.8, 0.8, -0.5],
    [-1.8, 0.8, -0.5],
    [0, 1.6, -1],
    [2.4, -0.6, 0.3],
    [-2.4, -0.6, 0.3],
    [0.9, -1.5, 0.5],
    [-0.9, -1.5, 0.5],
    [1.2, 0.2, 1.2],
    [-1.2, 0.2, 1.2],
    [0, -0.8, 1.8],
    [3, 0.2, -0.8],
    [-3, 0.2, -0.8],
  ];

  const connections: Array<
    [[number, number, number], [number, number, number]]
  > = [
    [nodes[0], nodes[1]],
    [nodes[0], nodes[2]],
    [nodes[0], nodes[6]],
    [nodes[0], nodes[7]],
    [nodes[1], nodes[3]],
    [nodes[2], nodes[3]],
    [nodes[1], nodes[4]],
    [nodes[2], nodes[5]],
    [nodes[4], nodes[11]],
    [nodes[5], nodes[12]],
    [nodes[6], nodes[10]],
    [nodes[7], nodes[10]],
    [nodes[8], nodes[0]],
    [nodes[9], nodes[0]],
    [nodes[8], nodes[1]],
    [nodes[9], nodes[2]],
    [nodes[10], nodes[8]],
    [nodes[10], nodes[9]],
  ];

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <NeuralNode
          key={i}
          index={i}
          position={pos}
          size={i === 0 ? 0.14 : 0.07 + Math.random() * 0.04}
          delay={i * 0.5}
        />
      ))}
      {connections.map(([s, e], i) => (
        <ConnectionLine key={i} start={s} end={e} />
      ))}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#888888" />
    </group>
  );
}

function DistortedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={meshRef} scale={1.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#1a1a1a"
        emissive="#333333"
        emissiveIntensity={0.2}
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

function TorusRing({
  position,
  scale,
  rotation,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  speed: number;
}) {
  const torusRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!torusRef.current) return;
    torusRef.current.rotation.x = rotation[0] + state.clock.elapsedTime * speed;
    torusRef.current.rotation.z =
      rotation[2] + state.clock.elapsedTime * speed * 0.7;
  });
  return (
    <mesh ref={torusRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.02, 8, 100]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function VisionScene() {
  return (
    <group>
      <DistortedSphere />
      <TorusRing
        position={[0, 0, 0]}
        scale={2.5}
        rotation={[0, 0, 0]}
        speed={0.2}
      />
      <TorusRing
        position={[0, 0, 0]}
        scale={3.5}
        rotation={[Math.PI / 3, 0, 0]}
        speed={0.15}
      />
      <TorusRing
        position={[0, 0, 0]}
        scale={4.5}
        rotation={[Math.PI / 6, Math.PI / 4, 0]}
        speed={0.1}
      />
      <Stars
        radius={80}
        depth={30}
        count={800}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.8} color="#888888" />
    </group>
  );
}

function ArchitectureScene() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.5, 0.3, 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#888888"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.4, 1.2]} />
          <meshStandardMaterial
            color="#dddddd"
            emissive="#555555"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
          <boxGeometry args={[1.5, 0.3, 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#888888"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0.75, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh key={i} position={[x, -0.75, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </Float>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#666666" />
    </group>
  );
}

// ──────────────────────────────────────────────
// SCROLL REVEAL WRAPPER
// ──────────────────────────────────────────────

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// NAVBAR
// ──────────────────────────────────────────────

function Navbar() {
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

// ──────────────────────────────────────────────
// HERO SECTION
// ──────────────────────────────────────────────

function HeroSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-50 z-0" />

      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pulse-glow pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Content */}
      <motion.div
        style={{ y, opacity, zIndex: 10 }}
        className="relative text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-medium text-white/70"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            letterSpacing: "0.1em",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          INFRASTRUCTURE FOR AUTONOMOUS AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-8xl font-bold text-white mb-6 leading-none tracking-tighter"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Memory for the
          <br />
          <span className="gradient-text">Machine Age</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Persistent, portable memory infrastructure for AI agents,
          <br className="hidden md:block" /> copilots, and autonomous systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            data-testid="button-start-building"
            className="flex items-center gap-2 px-8 py-4 rounded-md font-semibold text-black text-sm transition-all duration-200"
            style={{ background: "white" }}
          >
            Start Building
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            data-testid="button-read-docs"
            className="flex items-center gap-2 px-8 py-4 rounded-md font-medium text-white/80 text-sm transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Read the Docs
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-12"
        >
          {[
            ["<1ms", "Recall latency"],
            ["99.99%", "Uptime SLA"],
            ["∞", "Memory depth"],
            ["SOC 2", "Compliant"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {val}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 10 }}
      >
        <div className="text-xs text-white/30 uppercase tracking-widest">
          Scroll
        </div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ──────────────────────────────────────────────
// PROBLEM SECTION
// ──────────────────────────────────────────────

function ProblemSection() {
  const problems = [
    {
      icon: "⊘",
      title: "AI forgets between sessions",
      desc: "Every conversation starts from zero. No continuity, no learning, no growth.",
    },
    {
      icon: "⊡",
      title: "Context windows are limited",
      desc: "Models are bottlenecked by token limits. Long-term state gets truncated and lost.",
    },
    {
      icon: "⊛",
      title: "Agent systems lose state",
      desc: "Autonomous agents can't maintain long-running task context across loops.",
    },
    {
      icon: "⊕",
      title: "Memory is fragmented",
      desc: "Data scattered across databases, files, embeddings — no unified memory layer.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-30 z-0" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060606] opacity-80"
        style={{ zIndex: -1 }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            The Problem
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AI Has Intelligence.
            <br />
            <span className="text-white/30">It Doesn't Have Memory.</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto">
            The gap between narrow AI tools and truly autonomous systems is not
            intelligence — it's memory.
          </p>
        </RevealSection>

        {/* Pipeline Diagram */}
        <RevealSection delay={0.2} className="mb-20">
          <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap">
            {[
              { label: "User", sub: "Input" },
              { label: "→", sub: "", arrow: true },
              { label: "AI Model", sub: "Processing" },
              { label: "→", sub: "", arrow: true },
              { label: "Lost State", sub: "❌ No Memory", broken: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-6">
                {item.arrow ? (
                  <div className="text-white/20 text-3xl font-thin">—</div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`px-6 py-4 rounded-lg text-center min-w-[120px] ${
                      item.broken ? "opacity-40" : ""
                    }`}
                    style={{
                      background: item.broken
                        ? "rgba(255,50,50,0.05)"
                        : "rgba(255,255,255,0.04)",
                      border: item.broken
                        ? "1px solid rgba(255,50,50,0.2)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="text-white font-semibold text-sm">
                      {item.label}
                    </div>
                    <div className="text-white/40 text-xs mt-1">{item.sub}</div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4 text-xs text-white/20 uppercase tracking-widest">
            Traditional AI Pipeline — Stateless
          </div>
        </RevealSection>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((p, i) => (
            <RevealSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                className="p-8 rounded-xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="text-3xl mb-4 text-white/30 font-light">
                  {p.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// SOLUTION SECTION
// ──────────────────────────────────────────────

function SolutionSection() {
  const features = [
    {
      icon: Database,
      title: "Persistent Memory",
      desc: "Memory that outlives sessions, contexts, and deployments.",
    },
    {
      icon: Layers,
      title: "Structured Memory",
      desc: "Typed, versioned, queryable memory — not just raw embeddings.",
    },
    {
      icon: Globe,
      title: "Portable Memory",
      desc: "Your agents carry their memory across platforms and environments.",
    },
    {
      icon: Network,
      title: "Agent-Aware Memory",
      desc: "Built from the ground up for autonomous agent architectures.",
    },
    {
      icon: GitBranch,
      title: "Versioned Memory",
      desc: "Fork, merge, and roll back memory states like code commits.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Text */}
          <div>
            <RevealSection>
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                The Solution
              </div>
              <h2
                className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Introducing
                <br />
                <span className="gradient-text">Xmem</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed mb-10">
                The missing memory layer for autonomous AI. A persistent,
                structured, and portable memory fabric that lives between your
                agents and the world.
              </p>

              {/* Architecture flow */}
              <div className="space-y-2">
                {[
                  { label: "Your App", sub: "Any framework, any language" },
                  {
                    label: "↓ Xmem Layer",
                    sub: "Persistent • Structured • Portable",
                    highlight: true,
                  },
                  {
                    label: "AI Model",
                    sub: "GPT-4, Claude, Gemini, Local LLMs",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 6 }}
                    className={`flex items-center justify-between px-5 py-4 rounded-lg transition-all duration-200`}
                    style={{
                      background: item.highlight
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: item.highlight
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      className={`font-semibold text-sm ${item.highlight ? "text-white" : "text-white/60"}`}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-white/30">{item.sub}</span>
                  </motion.div>
                ))}
              </div>
            </RevealSection>
          </div>

          {/* Right: 3D Canvas */}
          <RevealSection delay={0.3}>
            <div
              className="h-[500px] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ArchitectureScene />
              </Canvas>
            </div>
          </RevealSection>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <RevealSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
                }}
                className="p-6 rounded-xl flex flex-col gap-4 h-full transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <f.icon className="w-5 h-5 text-white/60" />
                <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// BENCHMARK SECTION
// ──────────────────────────────────────────────

function BenchmarkSection() {
  const data = [
    {
      label: "Single-Session\nUser (overall)",
      xmem: 97.1,
      zep: 92.9,
      full: 81.4,
    },
    { label: "Single-Session\nAssistant", xmem: 96.4, zep: 80.4, full: 94.6 },
    { label: "Single-Session\nPreference", xmem: 70.0, zep: 56.7, full: 20.0 },
    { label: "Knowledge\nUpdate", xmem: 88.4, zep: 83.3, full: 78.2 },
    { label: "Temporal\nReasoning", xmem: 76.7, zep: 62.4, full: 45.1 },
    { label: "Multi-Session", xmem: 71.4, zep: 57.9, full: 44.3 },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#050505" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-24">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Performance
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Unmatched
            <br />
            <span className="text-white/30">Accuracy</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto mt-6">
            Tested on the LongMemEval-S Benchmark. Xmem outperforms existing
            memory solutions and full-context models across all reasoning
            categories.
          </p>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="p-8 md:p-12 relative overflow-hidden">
            {/* Title + inline legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-10">
              <span
                className="text-white font-bold text-lg md:text-xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                LongMemEval-S Benchmark:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #00f5d4, #00bbf9)",
                    boxShadow: "0 0 10px rgba(0,245,212,0.6)",
                  }}
                />
                <span className="text-cyan-300 font-semibold text-sm">
                  Xmem
                </span>
              </div>
              <span className="text-white/30 text-sm">vs</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #ff6b9d, #ff3366)",
                    boxShadow: "0 0 10px rgba(255,107,157,0.4)",
                  }}
                />
                <span className="text-rose-300 font-semibold text-sm">Zep</span>
              </div>
              <span className="text-white/30 text-sm">vs</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #c084fc, #9333ea)",
                    boxShadow: "0 0 10px rgba(192,132,252,0.4)",
                  }}
                />
                <span className="text-purple-300 font-semibold text-sm">
                  Full context
                </span>
              </div>
            </div>

            {/* Chart area */}
            <div className="relative pl-10 md:pl-12">
              {/* Y-Axis */}
              <div
                className="absolute left-0 top-0 bottom-10 w-10 md:w-12 flex flex-col justify-between items-end pr-2 text-xs text-white/40 z-10"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {[100, 80, 60, 40, 20, 0].map((v) => (
                  <div key={v} className="relative w-full text-right">
                    <span>{v}</span>
                  </div>
                ))}
              </div>

              {/* Gridlines */}
              <div className="absolute left-10 md:left-12 top-0 bottom-10 right-0 flex flex-col justify-between pointer-events-none">
                {[100, 80, 60, 40, 20, 0].map((v) => (
                  <div
                    key={v}
                    className="w-full h-px"
                    style={{
                      background:
                        v === 0
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>

              {/* Bars */}
              <div
                className="flex items-end justify-around gap-2 md:gap-6"
                style={{ height: "360px" }}
              >
                {data.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center flex-1 h-full justify-end"
                  >
                    <div className="flex items-end justify-center gap-[4px] md:gap-[6px] w-full h-full">
                      {/* Xmem bar */}
                      <div
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(18px, 3vw, 32px)" }}
                      >
                        <div
                          className="text-[9px] md:text-[10px] text-cyan-200 text-center mb-1 font-bold"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: "0 0 6px rgba(0,245,212,0.8)",
                          }}
                        >
                          {item.xmem.toFixed(1)}%
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.xmem}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08 }}
                          className="w-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #00f5d4 0%, #00bbf9 100%)",
                            boxShadow: "0 0 15px rgba(0,245,212,0.6)",
                          }}
                        />
                      </div>
                      {/* Zep bar */}
                      <div
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(18px, 3vw, 32px)" }}
                      >
                        <div
                          className="text-[9px] md:text-[10px] text-rose-200 text-center mb-1 font-semibold"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: "0 0 6px rgba(255,107,157,0.6)",
                          }}
                        >
                          {item.zep.toFixed(1)}%
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.zep}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08 + 0.1 }}
                          className="w-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #ff6b9d 0%, #ff3366 100%)",
                            boxShadow: "0 0 10px rgba(255,107,157,0.4)",
                          }}
                        />
                      </div>
                      {/* Full Context bar */}
                      <div
                        className="relative flex flex-col justify-end h-full"
                        style={{ width: "clamp(18px, 3vw, 32px)" }}
                      >
                        <div
                          className="text-[9px] md:text-[10px] text-purple-200 text-center mb-1 font-semibold"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            textShadow: "0 0 6px rgba(192,132,252,0.6)",
                          }}
                        >
                          {item.full.toFixed(1)}%
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.full}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08 + 0.2 }}
                          className="w-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #c084fc 0%, #9333ea 100%)",
                            boxShadow: "0 0 10px rgba(192,132,252,0.4)",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="text-[10px] md:text-xs text-center text-white/50 mt-3 leading-tight font-medium whitespace-pre-line"
                      style={{ minHeight: "28px" }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// ARCHITECTURE SECTION
// ──────────────────────────────────────────────

function SystemArchitectureSection() {
  const [activeStep, setActiveStep] = useState(0);
  const totalSteps = 6;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % totalSteps);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 0,
      label: "Message In",
      sub: "User msg + LLM response",
      color: "#06b6d4",
      icon: "💬",
    },
    {
      id: 1,
      label: "Classifier",
      sub: "Routes to specialist agents",
      color: "#3b82f6",
      icon: "🔀",
    },
    {
      id: 2,
      label: "Extraction",
      sub: "Agents pull facts (Profile, etc)",
      color: "#8b5cf6",
      icon: "🔍",
    },
    {
      id: 3,
      label: "Judge Agent",
      sub: "Evaluates & formats facts",
      color: "#f59e0b",
      icon: "⚖️",
    },
    {
      id: 4,
      label: "Tool Call",
      sub: "ADD / UPDATE / DELETE",
      color: "#ef4444",
      icon: "🔧",
    },
    {
      id: 5,
      label: "Knowledge Base",
      sub: "Vector DB + Graph DB",
      color: "#10b981",
      icon: "🧠",
    },
  ];

  const statusMessages = [
    "Receiving raw message...",
    "Classifying memory type...",
    "Extracting relevant facts...",
    "Validating extracted data...",
    "Executing storage tools...",
    "Memory permanently stored ✓",
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Architecture
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Engineered for <br />
            <span className="gradient-text">Cognition</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto mt-6">
            Watch how a single message flows through the Xmem pipeline — from
            ingestion to permanent memory.
          </p>
        </RevealSection>

        {/* Ingestion Pipeline */}
        <RevealSection delay={0.1}>
          <div
            className="p-6 md:p-10 rounded-2xl relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Live status bar */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Database className="w-5 h-5 text-cyan-400" /> Ingestion
                Pipeline
              </h3>
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{
                  background: `${steps[activeStep].color}15`,
                  border: `1px solid ${steps[activeStep].color}40`,
                  color: steps[activeStep].color,
                }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: steps[activeStep].color }}
                />
                {statusMessages[activeStep]}
              </motion.div>
            </div>

            {/* Row 1: Steps 0-2 (left to right) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 relative">
              {steps.slice(0, 3).map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row items-center flex-1"
                >
                  <motion.div
                    animate={{
                      scale: activeStep === i ? 1.05 : 1,
                      borderColor:
                        activeStep === i
                          ? step.color
                          : "rgba(255,255,255,0.08)",
                      boxShadow:
                        activeStep === i ? `0 0 30px ${step.color}30` : "none",
                    }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full p-4 md:p-5 rounded-xl flex flex-col items-center text-center gap-2 z-10 cursor-default"
                    style={{
                      background:
                        activeStep === i
                          ? `${step.color}10`
                          : "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onClick={() => setActiveStep(i)}
                  >
                    {activeStep === i && (
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        animate={{ opacity: [0.6, 0.2, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                          border: `2px solid ${step.color}`,
                          boxShadow: `0 0 25px ${step.color}50`,
                        }}
                      />
                    )}
                    <div className="text-2xl">{step.icon}</div>
                    <div className="text-white font-semibold text-xs">
                      {step.label}
                    </div>
                    <div className="text-white/35 text-[10px] leading-tight">
                      {step.sub}
                    </div>
                    <motion.div
                      animate={{
                        scale: activeStep >= i ? 1 : 0.5,
                        background:
                          activeStep >= i
                            ? step.color
                            : "rgba(255,255,255,0.1)",
                      }}
                      className="w-2 h-2 rounded-full mt-1"
                    />
                  </motion.div>
                  {i < 2 && (
                    <div className="relative flex items-center justify-center w-8 md:w-10 h-8 md:h-auto flex-shrink-0">
                      <div className="hidden md:block w-full h-px bg-white/10" />
                      <div className="md:hidden h-full w-px bg-white/10" />
                      {activeStep === i && (
                        <motion.div
                          className="absolute w-2 h-2 rounded-full z-20"
                          style={{
                            background: step.color,
                            boxShadow: `0 0 12px ${step.color}`,
                          }}
                          initial={{ x: -16, opacity: 0 }}
                          animate={{ x: 16, opacity: [0, 1, 1, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* U-turn connector */}
            <div className="flex justify-end pr-8 md:pr-12 relative h-12">
              <div className="w-px h-full bg-white/10 relative">
                {activeStep === 2 && (
                  <motion.div
                    className="absolute w-2 h-2 rounded-full z-20 left-1/2 -translate-x-1/2"
                    style={{
                      background: steps[2].color,
                      boxShadow: `0 0 12px ${steps[2].color}`,
                    }}
                    initial={{ top: 0, opacity: 0 }}
                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Row 2: Steps 3-5 (right to left) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 relative">
              {[...steps.slice(3, 6)].reverse().map((step, ri) => {
                const i = 5 - ri;
                return (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center flex-1"
                  >
                    {ri > 0 && (
                      <div className="relative flex items-center justify-center w-8 md:w-10 h-8 md:h-auto flex-shrink-0">
                        <div className="hidden md:block w-full h-px bg-white/10" />
                        <div className="md:hidden h-full w-px bg-white/10" />
                        {activeStep === i + 1 && i < 5 && (
                          <motion.div
                            className="absolute w-2 h-2 rounded-full z-20"
                            style={{
                              background: steps[i + 1].color,
                              boxShadow: `0 0 12px ${steps[i + 1].color}`,
                            }}
                            initial={{ x: 16, opacity: 0 }}
                            animate={{ x: -16, opacity: [0, 1, 1, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </div>
                    )}
                    <motion.div
                      animate={{
                        scale: activeStep === i ? 1.05 : 1,
                        borderColor:
                          activeStep === i
                            ? step.color
                            : "rgba(255,255,255,0.08)",
                        boxShadow:
                          activeStep === i
                            ? `0 0 30px ${step.color}30`
                            : "none",
                      }}
                      transition={{ duration: 0.5 }}
                      className="relative w-full p-4 md:p-5 rounded-xl flex flex-col items-center text-center gap-2 z-10 cursor-default"
                      style={{
                        background:
                          activeStep === i
                            ? `${step.color}10`
                            : "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onClick={() => setActiveStep(i)}
                    >
                      {activeStep === i && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          animate={{ opacity: [0.6, 0.2, 0.6] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          style={{
                            border: `2px solid ${step.color}`,
                            boxShadow: `0 0 25px ${step.color}50`,
                          }}
                        />
                      )}
                      <div className="text-2xl">{step.icon}</div>
                      <div className="text-white font-semibold text-xs">
                        {step.label}
                      </div>
                      <div className="text-white/35 text-[10px] leading-tight">
                        {step.sub}
                      </div>
                      <motion.div
                        animate={{
                          scale: activeStep >= i ? 1 : 0.5,
                          background:
                            activeStep >= i
                              ? step.color
                              : "rgba(255,255,255,0.1)",
                        }}
                        className="w-2 h-2 rounded-full mt-1"
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `linear-gradient(90deg, #06b6d4, ${steps[activeStep].color})`,
                }}
              />
            </div>
          </div>
        </RevealSection>

        {/* Retrieval Pipeline */}
        <RevealSection delay={0.3}>
          {(() => {
            const retSteps = [
              {
                label: "User Query",
                icon: "❓",
                color: "#10b981",
                sub: "Natural language question",
              },
              {
                label: "Retrieval",
                icon: "⚡",
                color: "#34d399",
                sub: "Semantic + graph search",
              },
              {
                label: "Context",
                icon: "📋",
                color: "#6ee7b7",
                sub: "Ranks & merges memories",
              },
              {
                label: "Answer",
                icon: "✅",
                color: "#a7f3d0",
                sub: "Augmented LLM response",
              },
            ];
            const retPhase = activeStep % 4; // reuse the interval
            const retLabels = [
              "Processing query...",
              "Searching memories...",
              "Assembling context...",
              "Answer ready ✓",
            ];

            return (
              <div
                className="mt-8 p-6 md:p-10 rounded-2xl relative overflow-hidden flex flex-col items-center"
                style={{
                  background: "rgba(16,185,129,0.03)",
                  border: "1px solid rgba(16,185,129,0.15)",
                }}
              >
                <div className="flex items-center justify-between mb-8 w-full flex-wrap gap-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <Brain className="w-5 h-5 text-emerald-400" /> Retrieval
                    Pipeline
                  </h3>
                  <motion.div
                    key={retPhase}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                    style={{
                      background: `${retSteps[retPhase].color}15`,
                      border: `1px solid ${retSteps[retPhase].color}40`,
                      color: retSteps[retPhase].color,
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: retSteps[retPhase].color }}
                    />
                    {retLabels[retPhase]}
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-0 relative w-full">
                  {retSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row items-center flex-1"
                    >
                      <motion.div
                        animate={{
                          scale: retPhase === i ? 1.05 : 1,
                          borderColor:
                            retPhase === i
                              ? step.color
                              : "rgba(255,255,255,0.08)",
                          boxShadow:
                            retPhase === i
                              ? `0 0 30px ${step.color}30`
                              : "none",
                        }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full p-4 md:p-5 rounded-xl flex flex-col items-center text-center gap-2 z-10 cursor-default"
                        style={{
                          background:
                            retPhase === i
                              ? `${step.color}10`
                              : "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {retPhase === i && (
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            animate={{ opacity: [0.6, 0.2, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                              border: `2px solid ${step.color}`,
                              boxShadow: `0 0 25px ${step.color}50`,
                            }}
                          />
                        )}
                        <div className="text-2xl">{step.icon}</div>
                        <div className="text-white font-semibold text-xs">
                          {step.label}
                        </div>
                        <div className="text-white/35 text-[10px] leading-tight">
                          {step.sub}
                        </div>
                        <motion.div
                          animate={{
                            scale: retPhase >= i ? 1 : 0.5,
                            background:
                              retPhase >= i
                                ? step.color
                                : "rgba(255,255,255,0.1)",
                          }}
                          className="w-2 h-2 rounded-full mt-1"
                        />
                      </motion.div>

                      {i < retSteps.length - 1 && (
                        <div className="relative flex items-center justify-center w-8 md:w-10 h-8 md:h-auto flex-shrink-0">
                          <div className="hidden md:block w-full h-px bg-emerald-500/20" />
                          <div className="md:hidden h-full w-px bg-emerald-500/20" />
                          {retPhase === i && (
                            <motion.div
                              className="absolute w-2 h-2 rounded-full z-20"
                              style={{
                                background: step.color,
                                boxShadow: `0 0 12px ${step.color}`,
                              }}
                              initial={{ x: -16, opacity: 0 }}
                              animate={{ x: 16, opacity: [0, 1, 1, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${((retPhase + 1) / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: `linear-gradient(90deg, #10b981, ${retSteps[retPhase].color})`,
                    }}
                  />
                </div>
              </div>
            );
          })()}
        </RevealSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// HOW IT WORKS SECTION
// ──────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Capture",
      subtitle: "Store structured memory events",
      desc: "Emit memory events from any point in your system. Xmem captures structured facts, observations, and episodic memories with full context, metadata, and provenance.",
      code: `await xmem.remember({\n  type: "observation",\n  content: "User prefers dark mode",\n  tags: ["preference", "ui"],\n  confidence: 0.95\n})`,
    },
    {
      num: "02",
      title: "Retrieve",
      subtitle: "Intelligent contextual recall",
      desc: "Query memory with natural language or structured filters. Xmem semantically retrieves the most relevant memories, ranked by relevance, recency, and confidence.",
      code: `const memories = await xmem.recall({\n  query: "user interface preferences",\n  limit: 5,\n  minConfidence: 0.8\n})`,
    },
    {
      num: "03",
      title: "Evolve",
      subtitle: "Agents update memory autonomously",
      desc: "Your agents don't just read memory — they write back. Xmem lets agents refine, correct, merge, and deprecate memories as their understanding deepens.",
      code: `await xmem.update(memoryId, {\n  content: "User prefers high contrast",\n  confidence: 0.98,\n  reason: "Confirmed via settings"\n})`,
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#050505" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-24">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            How It Works
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Three steps to
            <br />
            <span className="text-white/30">persistent intelligence</span>
          </h2>
        </RevealSection>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <RevealSection key={i} delay={i * 0.15}>
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 md:p-10 rounded-2xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <div
                    className="text-7xl font-bold text-white/08 mb-4 leading-none"
                    style={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    {step.num}
                  </div>
                  <h3
                    className="text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <div className="text-white/50 text-sm mb-4 font-medium">
                    {step.subtitle}
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <div className="code-block p-6 h-full rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <span className="ml-2 text-xs text-white/30">
                        xmem.ts
                      </span>
                    </div>
                    <pre
                      className="text-sm text-white/70 leading-relaxed overflow-x-auto"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// AGENTIC SYSTEMS SECTION
// ──────────────────────────────────────────────

function AgenticSection() {
  const features = [
    {
      title: "Multi-agent environments",
      desc: "Shared memory fabric across all spawned agents — no more memory silos.",
    },
    {
      title: "Autonomous task loops",
      desc: "Agents persist context across thousands of loop iterations without degradation.",
    },
    {
      title: "Long-running workflows",
      desc: "Resume any workflow exactly where it left off, days or weeks later.",
    },
    {
      title: "Memory portability",
      desc: "Export and import agent memory across platforms, models, and environments.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: 3D canvas */}
          <RevealSection className="order-2 lg:order-1">
            <div
              className="h-[520px] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <AgentNetworkScene />
              </Canvas>
            </div>
          </RevealSection>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <RevealSection>
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Agentic Systems
              </div>
              <h2
                className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                The database layer
                <br />
                <span className="gradient-text">for AGI systems</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed mb-10">
                Xmem is engineered for the next wave of autonomous AI — systems
                that don't just process tasks but accumulate knowledge, build
                expertise, and maintain identity across time.
              </p>

              <div className="space-y-4">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <Cpu className="w-3 h-3 text-white/60" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm mb-1">
                        {f.title}
                      </div>
                      <div className="text-white/40 text-xs leading-relaxed">
                        {f.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tendril({ index }: { index: number }) {
  const lineRef = useRef<THREE.Line>(null);
  const tipRef = useRef<THREE.Mesh>(null);

  const { geometry, lastPoint, randomOffset } = useMemo(() => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 3 + 0.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.random() * 3 + 1.5; // Top y

    const points = [];
    const numPoints = 20;

    const startY = -4;

    // Add some curve variation
    const midXOffset = (Math.random() - 0.5) * 2;
    const midZOffset = (Math.random() - 0.5) * 2;

    for (let j = 0; j <= numPoints; j++) {
      const t = j / numPoints;
      // Custom ease out curve
      const spread = 1 - Math.pow(1 - t, 4);

      const px = x * spread + Math.sin(t * Math.PI) * midXOffset;
      const py = startY + (y - startY) * t;
      const pz = z * spread + Math.sin(t * Math.PI) * midZOffset;

      points.push(new THREE.Vector3(px, py, pz));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const pts = curve.getPoints(50);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    const colorArray = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const c = new THREE.Color();
      c.lerpColors(new THREE.Color("#0a38ff"), new THREE.Color("#ff1a55"), t);
      colorArray.push(c.r, c.g, c.b);
    }
    geo.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(colorArray), 3),
    );

    return {
      geometry: geo,
      lastPoint: pts[50],
      randomOffset: Math.random() * Math.PI * 2,
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lineRef.current) {
      lineRef.current.rotation.y = Math.sin(t * 0.2 + randomOffset) * 0.1;
    }
    if (tipRef.current) {
      const s = 1 + Math.sin(t * 3 + randomOffset) * 0.4;
      tipRef.current.scale.set(s, s, s);
    }
  });

  return (
    // @ts-expect-error - React types conflict with ThreeJS line element
    <line ref={lineRef as any} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.6} />
      <mesh ref={tipRef} position={[lastPoint.x, lastPoint.y, lastPoint.z]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffc2d1" />
      </mesh>
    </line>
  );
}

function FloatingParticle() {
  const ref = useRef<THREE.Mesh>(null);
  const initialPos = useMemo(
    () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 10 - 5,
        (Math.random() - 0.5) * 10,
      ),
    [],
  );
  const speed = useMemo(() => Math.random() * 0.5 + 0.2, []);
  const isPink = useMemo(() => Math.random() > 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = initialPos.y + Math.sin(t * speed + offset) * 0.5;
    ref.current.position.x =
      initialPos.x + Math.cos(t * speed * 0.5 + offset) * 0.2;
  });

  return (
    <mesh ref={ref} position={initialPos}>
      <sphereGeometry args={[Math.random() * 0.03 + 0.01, 8, 8]} />
      <meshBasicMaterial
        color={isPink ? "#ff1a55" : "#ffffff"}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function AgentNetworkScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Rotate based on mouse
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.4 + state.clock.elapsedTime * 0.05,
      0.05,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * -0.2 + 0.2,
      0.05,
    );
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {Array.from({ length: 90 }).map((_, i) => (
        <Tendril key={i} index={i} />
      ))}
      {Array.from({ length: 200 }).map((_, i) => (
        <FloatingParticle key={`p-${i}`} />
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────
// ENTERPRISE SECTION
// ──────────────────────────────────────────────

function EnterpriseSection() {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      desc: "AES-256 encryption at rest and in transit. Your memory data is cryptographically protected.",
    },
    {
      icon: Shield,
      title: "Access Control",
      desc: "Granular RBAC with namespace isolation. Define exactly who can read and write which memories.",
    },
    {
      icon: Server,
      title: "Memory Namespaces",
      desc: "Tenant isolation with namespace-level partitioning for multi-tenant deployments.",
    },
    {
      icon: FileText,
      title: "Audit Trails",
      desc: "Immutable audit logs for every memory operation. Full compliance and forensic capability.",
    },
    {
      icon: Eye,
      title: "Observability",
      desc: "Real-time metrics, traces, and dashboards. Full visibility into memory retrieval patterns.",
    },
    {
      icon: Activity,
      title: "SLA Monitoring",
      desc: "99.99% uptime SLA with automated failover, geo-replication, and disaster recovery.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#060606" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Enterprise Ready
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Built for production.
            <br />
            <span className="text-white/30">Not prototypes.</span>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                }}
                className="p-8 rounded-xl transition-all duration-300 h-full"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <f.icon className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// DEVELOPER EXPERIENCE SECTION
// ──────────────────────────────────────────────

function DeveloperSection() {
  const [activeTab, setActiveTab] = useState<"sdk" | "cli" | "rest">("sdk");

  const code = {
    sdk: `import { Xmem } from "@xmem/sdk";

const memory = new Xmem({
  projectId: "proj_xyz",
  apiKey: process.env.XMEM_KEY,
});

// Store a memory
await memory.remember({
  content: "User prefers TypeScript over JavaScript",
  tags: ["preferences", "language"],
  agentId: "agent-001",
});

// Recall with semantic search
const recalled = await memory.recall({
  query: "programming language preferences",
  limit: 5,
  agentId: "agent-001",
});`,
    cli: `# Install the CLI
npm install -g @xmem/cli

# Authenticate
xmem auth login

# Create a new memory space
xmem spaces create --name "prod-agents"

# Inspect memory events
xmem memories list \\
  --agent agent-001 \\
  --since 24h \\
  --format json

# Export memory snapshot
xmem export --space prod-agents \\
  --output ./memory-backup.json`,
    rest: `# Store a memory event
curl -X POST https://api.xmem.dev/v1/memories \\
  -H "Authorization: Bearer $XMEM_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Completed task: refactor auth module",
    "type": "episodic",
    "agentId": "agent-001",
    "confidence": 0.99,
    "tags": ["task", "completion"]
  }'

# Semantic recall
curl "https://api.xmem.dev/v1/recall?q=auth+refactor" \\
  -H "Authorization: Bearer $XMEM_KEY"`,
  };

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Developer Experience
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Zero friction.
            <br />
            <span className="text-white/30">Maximum power.</span>
          </h2>
          <p className="text-xl text-white/40 max-w-xl mx-auto">
            From local prototype to production in minutes, not days.
          </p>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Tab bar */}
            <div
              className="flex items-center gap-0 px-6 pt-5 pb-0"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mr-6">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              {(["sdk", "cli", "rest"] as const).map((tab) => (
                <button
                  key={tab}
                  data-testid={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-widest transition-all duration-200 border-b-2 ${activeTab === tab ? "text-white border-white" : "text-white/30 border-transparent"}`}
                >
                  {tab === "sdk"
                    ? "TypeScript SDK"
                    : tab === "cli"
                      ? "CLI"
                      : "REST API"}
                </button>
              ))}
            </div>

            {/* Code area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-8"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <pre
                className="text-sm text-white/70 leading-loose overflow-x-auto"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <code>{code[activeTab]}</code>
              </pre>
            </motion.div>
          </div>

          {/* Features below code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              {
                icon: Code2,
                title: "10+ SDKs",
                desc: "TypeScript, Python, Go, Rust, and more",
              },
              {
                icon: Terminal,
                title: "Powerful CLI",
                desc: "Full control from the command line",
              },
              {
                icon: Zap,
                title: "REST & gRPC",
                desc: "Works with any language or runtime",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 p-5 rounded-xl transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <f.icon className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {f.title}
                  </div>
                  <div className="text-white/40 text-xs">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// USE CASES SECTION
// ──────────────────────────────────────────────

function UseCasesSection() {
  const cases = [
    {
      icon: Brain,
      title: "AI Copilots",
      desc: "Build copilots that remember every interaction, preference, and context — creating deeply personalized experiences.",
    },
    {
      icon: Cpu,
      title: "Personal AI",
      desc: "Consumer AI assistants with continuous memory — your AI grows with you over months and years.",
    },
    {
      icon: Terminal,
      title: "Dev Agents",
      desc: "Coding agents that remember your codebase, patterns, and decisions across every project and session.",
    },
    {
      icon: Network,
      title: "Autonomous Pipelines",
      desc: "Long-running automation pipelines that accumulate knowledge and improve with every execution.",
    },
    {
      icon: Globe,
      title: "Enterprise AI Workflows",
      desc: "Organization-wide AI with shared institutional memory, knowledge bases, and audit trails.",
    },
  ];

  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#060606" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <RevealSection className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs text-white/50 uppercase tracking-widest"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Use Cases
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Who builds with
            <br />
            <span className="text-white/30">Xmem?</span>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{
                  y: -10,
                  rotateX: 2,
                  rotateY: -2,
                  boxShadow:
                    "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)",
                }}
                className="p-8 rounded-xl h-full transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <c.icon className="w-6 h-6 text-white/70" />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {c.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </motion.div>
            </RevealSection>
          ))}

          {/* Extra card — join waitlist */}
          <RevealSection delay={0.5}>
            <motion.div
              whileHover={{
                y: -10,
                boxShadow:
                  "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.2)",
              }}
              className="p-8 rounded-xl h-full transition-all duration-300 flex flex-col items-center justify-center text-center gap-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                minHeight: "220px",
              }}
            >
              <div className="text-white/30 text-sm uppercase tracking-widest">
                Your use case
              </div>
              <h3 className="text-xl font-bold text-white">
                Building something unique?
              </h3>
              <button className="text-sm text-white/60 flex items-center gap-1 hover:text-white transition-colors">
                Talk to us <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// VISION SECTION
// ──────────────────────────────────────────────

function VisionSection() {
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

// ──────────────────────────────────────────────
// FINAL CTA SECTION
// ──────────────────────────────────────────────

function CTASection() {
  return (
    <section
      className="relative py-40 overflow-hidden"
      style={{ background: "#080808" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Glowing orb */}
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

          {/* Trust badges */}
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

// ──────────────────────────────────────────────
// FOOTER
// ──────────────────────────────────────────────

function Footer() {
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

// ──────────────────────────────────────────────
// MAIN EXPORT
// ──────────────────────────────────────────────

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
