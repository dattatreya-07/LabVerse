'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';

function CoreMesh({ hoverDomain }: { hoverDomain: string | null }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x += delta * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
      ring1Ref.current.rotation.x += delta * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.6;
      ring2Ref.current.rotation.y += delta * 0.4;
    }
  });

  const getDomainColor = () => {
    switch (hoverDomain) {
      case 'CHEMISTRY': return '#10b981'; // Emerald green
      case 'ELECTRONICS': return '#06b6d4'; // Cyan blue
      case 'PHYSICS': return '#8b5cf6'; // Purple violet
      case 'FINANCE': return '#f59e0b'; // Amber gold
      default: return '#06b6d4';
    }
  };

  const domainColor = getDomainColor();

  return (
    <group>
      {/* Central Glowing Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={coreRef} args={[1.4, 64, 64]}>
          <MeshDistortMaterial
            color={domainColor}
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={0.8}
            wireframe={false}
          />
        </Sphere>
      </Float>

      {/* Orbiting Orbital Ring 1 */}
      <Torus ref={ring1Ref} args={[2.2, 0.04, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} wireframe={false} />
      </Torus>

      {/* Orbiting Orbital Ring 2 */}
      <Torus ref={ring2Ref} args={[3.0, 0.03, 16, 100]} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.5} />
      </Torus>
    </group>
  );
}

interface KnowledgeCoreProps {
  hoverDomain: string | null;
}

export const KnowledgeCore: React.FC<KnowledgeCoreProps> = ({ hoverDomain }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#c084fc" />

        <CoreMesh hoverDomain={hoverDomain} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
