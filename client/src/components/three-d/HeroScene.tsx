import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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

export function HeroScene() {
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
