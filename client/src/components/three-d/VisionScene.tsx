import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

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

export function VisionScene() {
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
