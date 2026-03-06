import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

export function ArchitectureScene() {
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
