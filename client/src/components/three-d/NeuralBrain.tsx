import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

function MemoryNode({ position, text, delay }: { position: THREE.Vector3; text: string; delay: number }) {
  const [visible, setVisible] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cycle = (t + delay) % 12;
    if (cycle < 4 && !visible) setVisible(true);
    if (cycle >= 4 && visible) setVisible(false);
  });

  return (
    <group position={position}>
      <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
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

export function NeuralBrain() {
  const groupRef = useRef<THREE.Group>(null);
  const linesMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const { mouse } = useThree();

  const { nodes, lineGeometry, memoryNodes } = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = (Math.pow(Math.random(), 0.5) * 1.5) + 0.5;

      let x = r * Math.sin(phi) * Math.cos(theta) * 0.8;
      let y = r * Math.cos(phi) * 0.9;
      let z = r * Math.sin(phi) * Math.sin(theta) * 1.4;

      if (x > 0) x += 0.1;
      else x -= 0.1;

      pts.push(new THREE.Vector3(x, y, z));
    }

    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const color1 = new THREE.Color("#60a5fa");
    const color2 = new THREE.Color("#c084fc");

    for (let i = 0; i < pts.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < pts.length; j++) {
        if (connections > 3) break;
        const dist = pts[i].distanceTo(pts[j]);
        const crossFissure = pts[i].x * pts[j].x < 0 && Math.abs(pts[i].x) < 0.2 && Math.abs(pts[j].x) < 0.2;

        if (dist < 1.2 && !crossFissure) {
          linePositions.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          const c = Math.random() > 0.5 ? color1 : color2;
          lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
          connections++;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const memoryStrings = [
      "my password was ***8",
      "I went to wedding on 5th Jan",
      "I love to code in react",
      "Meeting with design team at 2pm",
      "API key ends in 9xQ",
      "User prefers dark mode",
      "Deployed v2.0 on Tuesday",
      "Favorite coffee is cold brew",
    ];

    const selectedPts: THREE.Vector3[] = [];
    const shuffledPts = [...pts].sort(() => 0.5 - Math.random());

    for (const p of shuffledPts) {
      let tooClose = false;
      for (const sp of selectedPts) {
        if (p.distanceTo(sp) < 1.2) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        selectedPts.push(p);
      }
      if (selectedPts.length >= memoryStrings.length) break;
    }

    let fallbackIdx = 0;
    while (selectedPts.length < memoryStrings.length) {
      if (!selectedPts.includes(shuffledPts[fallbackIdx])) {
        selectedPts.push(shuffledPts[fallbackIdx]);
      }
      fallbackIdx++;
    }

    const memNodes = memoryStrings.map((text, i) => ({
      position: selectedPts[i],
      text,
      delay: i * (12 / memoryStrings.length),
    }));

    return { nodes: pts, lineGeometry: geo, memoryNodes: memNodes };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.4 + t * 0.05,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * -0.3,
      0.05
    );
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.1;

    if (linesMaterialRef.current) {
      linesMaterialRef.current.opacity = 0.15 + Math.sin(t * 4) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.025 + Math.random() * 0.02, 8, 8]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? "#60a5fa" : (i % 3 === 1 ? "#c084fc" : "#ffffff")}
            transparent
            opacity={0.6 + Math.random() * 0.4}
          />
        </mesh>
      ))}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial ref={linesMaterialRef} vertexColors transparent opacity={0.3} />
      </lineSegments>
      {memoryNodes.map((mem, i) => (
        <MemoryNode key={`mem-${i}`} position={mem.position} text={mem.text} delay={mem.delay} />
      ))}
    </group>
  );
}
