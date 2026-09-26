'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function KnowledgeCoreMesh({ hoverDomain }: { hoverDomain: string | null }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Smooth, slow, elegant rotation
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.12;
      coreRef.current.rotation.x += delta * 0.06;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.15;
      ring1Ref.current.rotation.x += delta * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.18;
      ring2Ref.current.rotation.y += delta * 0.12;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.1;
      ring3Ref.current.rotation.y -= delta * 0.08;
    }
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y += delta * 0.06;
    }
  });

  const getCoreColor = () => {
    switch (hoverDomain) {
      case 'CHEMISTRY': return '#FF8D69';
      case 'ELECTRONICS': return '#FF7448';
      case 'PHYSICS': return '#93C5FD';
      case 'FINANCE': return '#FFA88D';
      default: return '#FF7448';
    }
  };

  const coreColor = getCoreColor();

  return (
    <group scale={0.88}>
      {/* Central Scientific Knowledge Core */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere ref={coreRef} args={[1.05, 64, 64]}>
          <MeshDistortMaterial
            color={coreColor}
            attach="material"
            distort={0.2}
            speed={1.2}
            roughness={0.25}
            metalness={0.4}
            clearcoat={0.5}
            clearcoatRoughness={0.2}
          />
        </Sphere>
      </Float>

      {/* Primary Orbital Ring (Warm Orange Accent) */}
      <Torus ref={ring1Ref} args={[1.85, 0.025, 16, 100]} rotation={[Math.PI / 3.2, 0, 0]}>
        <meshStandardMaterial
          color="#FF7448"
          emissive="#FF7448"
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.7}
        />
      </Torus>

      {/* Secondary Orbital Ring (Scientific Soft Blue) */}
      <Torus ref={ring2Ref} args={[2.35, 0.02, 16, 100]} rotation={[-Math.PI / 3.8, Math.PI / 4, 0]}>
        <meshStandardMaterial
          color="#D3E1FF"
          emissive="#93C5FD"
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.6}
        />
      </Torus>

      {/* Equatorial Deep Navy Carrier Track */}
      <Torus ref={ring3Ref} args={[2.75, 0.016, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#0F151D"
          roughness={0.5}
          metalness={0.8}
        />
      </Torus>

      {/* Satellite Floating Particle Nodes */}
      <group ref={particleGroupRef}>
        <mesh position={[1.9, 0.9, 0.6]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FF7448" emissive="#FF7448" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-1.7, -0.8, 1.1]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#D3E1FF" emissive="#D3E1FF" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.5, -2.1, -0.9]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#0F151D" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

interface KnowledgeCoreProps {
  hoverDomain: string | null;
}

export const KnowledgeCore: React.FC<KnowledgeCoreProps> = ({ hoverDomain }) => {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[8, 12, 10]} intensity={1.4} color="#FFF9F6" />
        <pointLight position={[-8, -8, -6]} intensity={0.8} color="#D3E1FF" />

        <KnowledgeCoreMesh hoverDomain={hoverDomain} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  );
};
