import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ZoomIn, ZoomOut } from "lucide-react";
import type { MemoryNode, MemoryEdge } from "@/hooks/useMemoryGraph";

// Color palette for different memory types
const NODE_COLORS = {
  temporal: "#00e5ff", // cyan
  profile: "#ff00ea",  // neon pink
  summary: "#4ade80",  // neon green
};

const EDGE_COLORS = {
  temporal: "#0891b2",
  semantic: "#c026d3",
  date_cluster: "#16a34a",
};

interface MemoryBrainProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  onNodeClick?: (node: MemoryNode) => void;
  selectedNodeId?: string | null;
}

// Individual memory node component
function MemoryNodeSphere({
  node,
  isConnected,
  isSelected,
  hasSelection,
  onClick,
}: {
  node: MemoryNode;
  isConnected: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = NODE_COLORS[node.type] || NODE_COLORS.summary;
  const position = useMemo(
    () =>
      new THREE.Vector3(
        node.position_hint?.x ?? (Math.random() - 0.5) * 4,
        node.position_hint?.y ?? (Math.random() - 0.5) * 4,
        node.position_hint?.z ?? (Math.random() - 0.5) * 4
      ),
    [node]
  );

  // Gentle floating animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const offset = node.id.charCodeAt(0) % 10;
    meshRef.current.position.y = position.y + Math.sin(t * 0.5 + offset) * 0.05;
  });

  // Calculate opacity based on selection state
  const opacity = useMemo(() => {
    if (!hasSelection) return 1;
    if (isSelected) return 1;
    if (isConnected) return 0.8;
    return 0.2;
  }, [isConnected, isSelected, hasSelection]);

  const scale = isSelected ? 1.5 : hovered ? 1.2 : 1;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Glow effect */}
      <mesh scale={scale * 1.5}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.2}
        />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0.15, 0.15, 0]}>
          <div
            className="px-3 py-2 rounded-lg text-xs whitespace-nowrap text-white pointer-events-none"
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${color}50`,
              boxShadow: `0 4px 20px ${color}30`,
              fontFamily: "'JetBrains Mono', monospace",
              maxWidth: "250px",
              whiteSpace: "normal",
            }}
          >
            <div className="font-semibold mb-1" style={{ color }}>
              {node.type.toUpperCase()}
            </div>
            <div className="text-gray-200">{node.label}</div>
            {node.metadata.date && (
              <div className="text-gray-400 mt-1 text-[10px]">
                {node.metadata.date}
                {node.metadata.year && `, ${node.metadata.year}`}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Edge/connection line component
function MemoryEdgeLine({
  edge,
  nodes,
  isHighlighted,
}: {
  edge: MemoryEdge;
  nodes: MemoryNode[];
  isHighlighted: boolean;
}) {
  const lineObj = useMemo(() => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    const sourcePos = new THREE.Vector3(
      sourceNode?.position_hint?.x ?? 0,
      sourceNode?.position_hint?.y ?? 0,
      sourceNode?.position_hint?.z ?? 0
    );
    const targetPos = new THREE.Vector3(
      targetNode?.position_hint?.x ?? 0,
      targetNode?.position_hint?.y ?? 0,
      targetNode?.position_hint?.z ?? 0
    );

    const geometry = new THREE.BufferGeometry().setFromPoints([sourcePos, targetPos]);
    const color = new THREE.Color(EDGE_COLORS[edge.type] || "#ffffff");
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: isHighlighted ? 0.5 : 0.15,
      linewidth: isHighlighted ? 2 : 1,
    });

    return new THREE.Line(geometry, material);
  }, [edge, nodes, isHighlighted]);

  // Pulsing animation for highlighted edges
  useFrame((state) => {
    if (!lineObj.material) return;
    const material = lineObj.material as THREE.LineBasicMaterial;
    if (isHighlighted) {
      material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    } else {
      material.opacity = 0.15;
    }
  });

  return <primitive object={lineObj} />;
}

// Main scene component
function MemoryBrainScene({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
}: MemoryBrainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  // Get connected node IDs for the selected node
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        connected.add(edge.target);
      } else if (edge.target === selectedNodeId) {
        connected.add(edge.source);
      }
    });
    return connected;
  }, [edges, selectedNodeId]);

  // Subtle rotation based on mouse position
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Base rotation + mouse influence
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.2 + t * 0.02,
      0.03
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * -0.15,
      0.03
    );
  });

  return (
    <group ref={groupRef}>
      {/* Render edges first (behind nodes) */}
      {edges.map((edge, idx) => (
        <MemoryEdgeLine
          key={`edge-${idx}`}
          edge={edge}
          nodes={nodes}
          isHighlighted={
            selectedNodeId !== null &&
            (edge.source === selectedNodeId || edge.target === selectedNodeId)
          }
        />
      ))}

      {/* Render nodes */}
      {nodes.map((node) => (
        <MemoryNodeSphere
          key={node.id}
          node={node}
          isConnected={connectedNodeIds.has(node.id)}
          isSelected={node.id === selectedNodeId}
          hasSelection={selectedNodeId !== null}
          onClick={() => onNodeClick?.(node)}
        />
      ))}
    </group>
  );
}

// Camera controller component
function CameraController({
  selectedNode,
  controlsRef,
}: {
  selectedNode: MemoryNode | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const animatingNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedNode) {
      animatingNodeId.current = selectedNode.id;
    } else {
      animatingNodeId.current = null;
    }
  }, [selectedNode]);

  useFrame(() => {
    if (!controlsRef.current || !animatingNodeId.current || !selectedNode?.position_hint) return;

    const nodePos = new THREE.Vector3(
      selectedNode.position_hint.x,
      selectedNode.position_hint.y,
      selectedNode.position_hint.z
    );
    
    const idealCameraPos = nodePos.clone().add(new THREE.Vector3(0, 0, 3));
    
    // Move target towards the node
    controlsRef.current.target.lerp(nodePos, 0.05);
    
    // Move camera towards the node offset
    camera.position.lerp(idealCameraPos, 0.05);
    controlsRef.current.update();
    
    // Stop animating if close enough
    if (
      controlsRef.current.target.distanceTo(nodePos) < 0.05 && 
      camera.position.distanceTo(idealCameraPos) < 0.05
    ) {
      animatingNodeId.current = null;
    }
  });

  return null;
}

// Main export component
export function MemoryBrain({
  nodes,
  edges,
  onNodeClick,
}: Omit<MemoryBrainProps, 'selectedNodeId'> & { onNodeClick?: (node: MemoryNode) => void }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    const target = controls.target;
    
    // Vector from target to camera
    const directionVec = new THREE.Vector3().subVectors(camera.position, target);
    const distance = directionVec.length();
    
    if (direction === 'in' && distance > 2) {
      // Move camera 30% closer
      directionVec.multiplyScalar(0.7);
    } else if (direction === 'out' && distance < 15) {
      // Move camera 30% further
      directionVec.multiplyScalar(1.3);
    }
    
    camera.position.copy(target).add(directionVec);
    controls.update();
  }, []);

  const handleNodeClick = useCallback(
    (node: MemoryNode) => {
      setSelectedNodeId((current) => (current === node.id ? null : node.id));
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-[#111] p-1.5 rounded-lg border border-gray-800 shadow-xl">
        <button 
          onClick={(e) => { e.preventDefault(); handleZoom('in'); }}
          className="p-1.5 hover:bg-gray-800 rounded bg-[#0a0a0a] text-gray-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); handleZoom('out'); }}
          className="p-1.5 hover:bg-gray-800 rounded bg-[#0a0a0a] text-gray-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00e5ff" />

        <MemoryBrainScene
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNodeId}
        />

        <CameraController selectedNode={selectedNode} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          autoRotate={!selectedNodeId}
          autoRotateSpeed={0.5}
          makeDefault
        />

        {/* Fog for depth */}
        <fog attach="fog" args={["#080808", 4, 20]} />
      </Canvas>
    </div>
  );
}

// Export a demo version with sample data for testing
export function MemoryBrainDemo() {
  const demoNodes: MemoryNode[] = [
    {
      id: "temporal_0",
      type: "temporal",
      label: "Birthday Party (03-15)",
      metadata: { event_name: "Birthday Party", date: "03-15", year: "2024" },
      position_hint: { x: 1, y: 0.5, z: -0.5 },
    },
    {
      id: "temporal_1",
      type: "temporal",
      label: "Meeting (03-15)",
      metadata: { event_name: "Team Meeting", date: "03-15", time: "2:00 PM" },
      position_hint: { x: 1.2, y: 0.3, z: -0.3 },
    },
    {
      id: "profile_0",
      type: "profile",
      label: "Loves coding in React",
      metadata: { topic: "interests", sub_topic: "programming" },
      position_hint: { x: -0.8, y: 0.8, z: 0.5 },
    },
    {
      id: "summary_0",
      type: "summary",
      label: "Prefers dark mode interfaces",
      metadata: {},
      position_hint: { x: -0.5, y: -0.5, z: 0.8 },
    },
  ];

  const demoEdges: MemoryEdge[] = [
    { source: "temporal_0", target: "temporal_1", type: "date_cluster", strength: 0.9 },
    { source: "temporal_0", target: "profile_0", type: "semantic", strength: 0.7 },
    { source: "profile_0", target: "summary_0", type: "semantic", strength: 0.6 },
  ];

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-800 bg-[#0a0a0a]">
      <MemoryBrain nodes={demoNodes} edges={demoEdges} />
    </div>
  );
}
