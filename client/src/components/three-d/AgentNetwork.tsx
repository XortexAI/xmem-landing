import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Tendril({ index }: { index: number }) {
  const lineRef = useRef<THREE.Line>(null);
  const tipRef = useRef<THREE.Mesh>(null);

  const { geometry, lastPoint, randomOffset } = useMemo(() => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 3 + 0.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.random() * 3 + 1.5;

    const points = [];
    const numPoints = 20;
    const startY = -4;
    const midXOffset = (Math.random() - 0.5) * 2;
    const midZOffset = (Math.random() - 0.5) * 2;

    for (let j = 0; j <= numPoints; j++) {
      const t = j / numPoints;
      const spread = 1 - Math.pow(1 - t, 4);

      const px = x * spread + Math.sin(t * Math.PI) * midXOffset;
      const py = startY + (y - startY) * t;
      const pz = z * spread + Math.sin(t * Math.PI) * midZOffset;

      points.push(new THREE.Vector3(px, py, pz));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const pts = curve.getPoints(50);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    const colorArray: number[] = [];
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

export function AgentNetworkScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
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
