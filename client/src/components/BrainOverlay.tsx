import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import { motion, useMotionValue, useTransform } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────
// BRAIN-SHAPED POINT CLOUD
// Anatomically shaped: wider at top (frontal/parietal),
// temporal lobe bulges at sides, narrower at back (occipital),
// visible interhemispheric fissure, brainstem below.
// ─────────────────────────────────────────────────────

function generateBrain() {
  const pts: THREE.Vector3[] = [];

  // Seeded random for consistency
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // --- Cortex shell: points on a brain-shaped surface ---
  for (let i = 0; i < 260; i++) {
    const theta = rand() * Math.PI * 2;        // around
    const phi = Math.acos(rand() * 2 - 1);     // top-to-bottom

    // Normalized direction
    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.cos(phi);
    const nz = Math.sin(phi) * Math.sin(theta);

    // Base radius varies with latitude to form brain profile
    let r = 1.4;

    // Frontal lobe: bulge forward-upward (nz > 0, ny > 0)
    if (nz > 0 && ny > 0) {
      r += 0.3 * nz * ny;
    }
    // Frontal width: wider at the front-top
    if (ny > 0.2) {
      r += 0.15 * ny;
    }
    // Temporal lobes: bulge outward at sides, lower half
    if (ny < 0 && Math.abs(nx) > 0.5) {
      r += 0.25 * Math.abs(nx) * Math.max(0, -ny);
    }
    // Occipital: taper slightly at the back
    if (nz < -0.5) {
      r -= 0.15 * Math.abs(nz);
    }
    // Flatten bottom slightly
    if (ny < -0.7) {
      r -= 0.2 * (Math.abs(ny) - 0.7);
    }

    let x = nx * r * 1.05;   // slightly wider L-R
    let y = ny * r * 1.15;   // taller
    let z = nz * r * 0.95;   // slightly compressed front-back

    // Interhemispheric fissure: push away from x=0
    const fissureGap = 0.08;
    if (Math.abs(x) < fissureGap) {
      x = x >= 0 ? fissureGap + rand() * 0.04 : -fissureGap - rand() * 0.04;
    }

    // Add slight surface noise for organic feel
    x += (rand() - 0.5) * 0.08;
    y += (rand() - 0.5) * 0.08;
    z += (rand() - 0.5) * 0.08;

    pts.push(new THREE.Vector3(x, y, z));
  }

  // --- Gyri ridges: dense lines of points along sulci curves ---
  const sulci = [
    // Central sulcus (vertical, both sides) — divides frontal/parietal
    (t: number, side: number) => {
      const y = -0.6 + t * 1.8;
      const wave = Math.sin(t * 5) * 0.08;
      const x = side * (0.45 + wave);
      const r = 1.35 + 0.1 * (1 - Math.abs(y));
      const z = Math.sqrt(Math.max(0.01, r * r - x * x - y * y * 0.75)) * 0.95;
      return new THREE.Vector3(x, y, z);
    },
    // Lateral / Sylvian fissure (horizontal, both sides)
    (t: number, side: number) => {
      const x = side * (0.15 + t * 1.2);
      const y = -0.2 + Math.sin(t * 3) * 0.15 - t * 0.3;
      const r = 1.4;
      const z = Math.sqrt(Math.max(0.01, r * r - x * x * 0.8 - y * y * 0.7)) * 0.95;
      return new THREE.Vector3(x, y, z);
    },
    // Superior temporal sulcus
    (t: number, side: number) => {
      const x = side * (0.3 + t * 1.0);
      const y = -0.55 + Math.sin(t * 2.5) * 0.1;
      const r = 1.35;
      const z = Math.sqrt(Math.max(0.01, r * r - x * x * 0.85 - y * y * 0.8)) * 0.95;
      return new THREE.Vector3(x, y, z);
    },
    // Precentral sulcus (in front of central)
    (t: number, side: number) => {
      const y = -0.3 + t * 1.4;
      const x = side * (0.3 + Math.sin(t * 4) * 0.06);
      const r = 1.38;
      const z = Math.sqrt(Math.max(0.01, r * r - x * x - y * y * 0.7)) * 0.95 + 0.1;
      return new THREE.Vector3(x, y, z);
    },
    // Intraparietal sulcus (upper back)
    (t: number, side: number) => {
      const x = side * (0.2 + t * 0.8);
      const y = 0.3 + t * 0.6;
      const r = 1.3;
      const z = Math.sqrt(Math.max(0.01, r * r - x * x - y * y * 0.6)) * 0.95 - 0.2;
      return new THREE.Vector3(x, y, z);
    },
  ];

  for (const fn of sulci) {
    for (const side of [-1, 1] as const) {
      const steps = 14 + Math.floor(rand() * 4);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = fn(t, side);
        if (p.length() > 0.2 && p.length() < 2.5) {
          pts.push(p);
        }
      }
    }
  }

  // --- Brainstem ---
  for (let i = 0; i < 18; i++) {
    const y = -1.3 - rand() * 0.6;
    const angle = rand() * Math.PI * 2;
    const r = 0.12 + rand() * 0.08;
    pts.push(new THREE.Vector3(
      r * Math.cos(angle),
      y,
      r * Math.sin(angle) - 0.15,
    ));
  }

  // --- Cerebellum (back-bottom, smaller dense cluster) ---
  for (let i = 0; i < 30; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(rand() * 2 - 1);
    const r = 0.4 + rand() * 0.2;
    let x = r * Math.sin(phi) * Math.cos(theta) * 1.3;
    const y = -1.0 + r * Math.cos(phi) * 0.4 - 0.2;
    const z = r * Math.sin(phi) * Math.sin(theta) * 0.7 - 0.7;
    // Fissure in cerebellum too
    if (Math.abs(x) < 0.06) x = x >= 0 ? 0.06 : -0.06;
    pts.push(new THREE.Vector3(x, y, z));
  }

  // ── Split & connect ──
  const color1 = new THREE.Color("#60a5fa");
  const color2 = new THREE.Color("#c084fc");

  const leftPts = pts.filter((p) => p.x <= 0);
  const rightPts = pts.filter((p) => p.x > 0);

  function buildLines(points: THREE.Vector3[]) {
    const positions: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < points.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < points.length; j++) {
        if (connections > 3) break;
        const dist = points[i].distanceTo(points[j]);
        if (dist < 0.7) {
          positions.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z);
          const c = rand() > 0.5 ? color1 : color2;
          colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
          connections++;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }

  // Cross-hemisphere connections (corpus callosum bridges near center)
  const crossPositions: number[] = [];
  const crossColors: number[] = [];
  for (let i = 0; i < leftPts.length; i++) {
    for (let j = 0; j < rightPts.length; j++) {
      const dist = leftPts[i].distanceTo(rightPts[j]);
      if (dist < 0.5 && Math.abs(leftPts[i].x) < 0.25 && Math.abs(rightPts[j].x) < 0.25) {
        crossPositions.push(leftPts[i].x, leftPts[i].y, leftPts[i].z, rightPts[j].x, rightPts[j].y, rightPts[j].z);
        const c = rand() > 0.5 ? color1 : color2;
        crossColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }
    }
  }
  const crossGeo = new THREE.BufferGeometry();
  crossGeo.setAttribute("position", new THREE.Float32BufferAttribute(crossPositions, 3));
  crossGeo.setAttribute("color", new THREE.Float32BufferAttribute(crossColors, 3));

  return { leftPts, rightPts, leftLineGeo: buildLines(leftPts), rightLineGeo: buildLines(rightPts), crossLineGeo: crossGeo };
}

// ─────────────────────────────────────────────────────
// MEMORY NODES — cycling text labels (same as NeuralBrain)
// ─────────────────────────────────────────────────────

function MemoryNode({ position, text, delay }: { position: THREE.Vector3; text: string; delay: number }) {
  const [visible, setVisible] = useState(false);

  useFrame((state) => {
    const cycle = (state.clock.elapsedTime + delay) % 10;
    if (cycle < 3.5 && !visible) setVisible(true);
    if (cycle >= 3.5 && visible) setVisible(false);
  });

  return (
    <group position={position}>
      <Html center zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
        <div
          className={`transition-all duration-1000 ease-in-out ${
            visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          <div
            className="px-3 py-2 rounded-lg text-xs whitespace-nowrap text-white"
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 16px rgba(96, 165, 250, 0.1)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span className="text-blue-400 mr-2">{"->"}</span>
            {text}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────
// THE 3D SCENE
// ─────────────────────────────────────────────────────

const MEMORY_STRINGS = [
  "my password was ***8",
  "I went to a wedding on 5th Jan",
  "Meeting with design team at 2pm",
  "API key ends in 9xQ",
  "User prefers dark mode",
  "Deployed v2.0 on Tuesday",
  "Favorite coffee is cold brew",
  "Booked flight to NYC on 12th",
];

function SplitBrain({ progress }: { progress: number }) {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const leftLineMatRef = useRef<THREE.LineBasicMaterial>(null);
  const rightLineMatRef = useRef<THREE.LineBasicMaterial>(null);
  const crossLineMatRef = useRef<THREE.LineBasicMaterial>(null);
  const { mouse, viewport } = useThree();
  
  // Scale down significantly for mobile devices to prevent it crossing the screen height
  const isMobile = viewport.width < 5;
  const brainScale = isMobile ? 0.65 : 1.0;

  const data = useMemo(() => generateBrain(), []);

  const memoryNodes = useMemo(() => {
    const allPts = [...data.leftPts, ...data.rightPts];
    const selected: THREE.Vector3[] = [];
    const shuffled = [...allPts].sort(() => 0.5 - Math.random());
    for (const p of shuffled) {
      let tooClose = false;
      for (const sp of selected) {
        if (p.distanceTo(sp) < 1.0) { tooClose = true; break; }
      }
      if (!tooClose) selected.push(p);
      if (selected.length >= MEMORY_STRINGS.length) break;
    }
    let idx = 0;
    while (selected.length < MEMORY_STRINGS.length && idx < shuffled.length) {
      if (!selected.includes(shuffled[idx])) selected.push(shuffled[idx]);
      idx++;
    }
    return MEMORY_STRINGS.map((text, i) => ({
      position: selected[i],
      text,
      delay: i * (10 / MEMORY_STRINGS.length),
    }));
  }, [data]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.3 + t * 0.05,
        0.05,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouse.y * -0.2,
        0.05,
      );
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.1;
    }

    const split = progress * 5;
    if (leftRef.current) {
      leftRef.current.position.x = -split;
      leftRef.current.rotation.y = -progress * 0.5;
    }
    if (rightRef.current) {
      rightRef.current.position.x = split;
      rightRef.current.rotation.y = progress * 0.5;
    }

    const baseOpacity = 0.15 + Math.sin(t * 4) * 0.15;
    if (leftLineMatRef.current) leftLineMatRef.current.opacity = baseOpacity;
    if (rightLineMatRef.current) rightLineMatRef.current.opacity = baseOpacity;
    if (crossLineMatRef.current) {
      crossLineMatRef.current.opacity = baseOpacity * Math.max(0, 1 - progress * 4);
    }
  });

  return (
    <group ref={groupRef} scale={brainScale}>
      {/* Left hemisphere */}
      <group ref={leftRef}>
        {data.leftPts.map((p, i) => (
          <mesh key={`l${i}`} position={p}>
            <sphereGeometry args={[0.022 + (i % 5) * 0.004, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#c084fc" : "#ffffff"}
              transparent
              opacity={0.5 + (i % 4) * 0.12}
            />
          </mesh>
        ))}
        <lineSegments geometry={data.leftLineGeo}>
          <lineBasicMaterial ref={leftLineMatRef} vertexColors transparent opacity={0.3} />
        </lineSegments>
      </group>

      {/* Right hemisphere */}
      <group ref={rightRef}>
        {data.rightPts.map((p, i) => (
          <mesh key={`r${i}`} position={p}>
            <sphereGeometry args={[0.022 + (i % 5) * 0.004, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#c084fc" : "#ffffff"}
              transparent
              opacity={0.5 + (i % 4) * 0.12}
            />
          </mesh>
        ))}
        <lineSegments geometry={data.rightLineGeo}>
          <lineBasicMaterial ref={rightLineMatRef} vertexColors transparent opacity={0.3} />
        </lineSegments>
      </group>

      {/* Cross-hemisphere connections (corpus callosum) */}
      <lineSegments geometry={data.crossLineGeo}>
        <lineBasicMaterial ref={crossLineMatRef} vertexColors transparent opacity={0.3} />
      </lineSegments>

      {/* Memory text nodes */}
      {memoryNodes.map((mem, i) => (
        <MemoryNode key={`mem-${i}`} position={mem.position} text={mem.text} delay={mem.delay} />
      ))}

      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.03 * (1 - progress)} />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#60a5fa" />
    </group>
  );
}

// ─────────────────────────────────────────────────────
// OVERLAY
// ─────────────────────────────────────────────────────

export function BrainOverlay() {
  const progress = useMotionValue(0);
  const [mounted, setMounted] = useState(true);
  const [brainProgress, setBrainProgress] = useState(0);
  const doneRef = useRef(false);

  const textOpacity = useTransform(progress, [0.2, 0.4, 0.7, 0.88], [0, 1, 1, 0]);
  const textScale = useTransform(progress, [0.2, 0.45], [0.9, 1]);
  const overlayOpacity = useTransform(progress, [0.82, 1], [1, 0]);
  const scrollHintOpacity = useTransform(progress, [0, 0.06], [1, 0]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, 0);
    setTimeout(() => setMounted(false), 400);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let accumulated = 0;
    let ready = false;
    let touchStartY = 0;

    const readyTimer = setTimeout(() => {
      ready = true;
    }, 1400);

    const update = (delta: number) => {
      if (doneRef.current) return;
      accumulated += delta;
      const clamped = Math.min(1, Math.max(0, accumulated));
      progress.set(clamped);
      setBrainProgress(clamped);
      if (clamped >= 1) finish();
    };

    const onWheel = (e: WheelEvent) => {
      if (!ready || doneRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      update(e.deltaY * 0.0005);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!ready || doneRef.current) return;
      e.preventDefault();
      const delta = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      update(delta * 0.004);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!ready || doneRef.current) return;
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        update(0.06);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(readyTimer);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [progress, finish]);

  if (!mounted) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#050505",
        opacity: overlayOpacity,
        overflow: "hidden",
      }}
    >
      {/* 3D Canvas */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 2]}>
          <SplitBrain progress={brainProgress} />
          <Stars radius={80} depth={40} count={600} factor={2.5} saturation={0} fade speed={0.4} />
        </Canvas>
      </div>

      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-15 pointer-events-none" />

      {/* Glow */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 800px)",
          height: "min(90vw, 800px)",
          background:
            "radial-gradient(ellipse, rgba(96,165,250,0.08) 0%, rgba(192,132,252,0.04) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Text revealed between hemispheres */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: textOpacity,
          scale: textScale,
          pointerEvents: "none",
          zIndex: 15,
        }}
      >
        <div
          style={{
            letterSpacing: "0.35em",
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          Introducing
        </div>
        <div
          style={{
            fontSize: "clamp(3.5rem, 11vw, 8rem)",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          xmem
        </div>
        <div
          style={{
            fontSize: "clamp(0.85rem, 2vw, 1.15rem)",
            color: "rgba(255,255,255,0.35)",
            marginTop: "20px",
            letterSpacing: "0.06em",
          }}
        >
          Memory for the Machine Age
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: "3rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <motion.span
          style={{
            opacity: scrollHintOpacity,
            fontSize: "10px",
            letterSpacing: "0.35em",
            textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          Scroll
        </motion.span>
        <motion.div style={{ opacity: scrollHintOpacity }}>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "1px",
              height: "28px",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
