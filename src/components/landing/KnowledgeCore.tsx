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
    // Subtle, slow, expensive rotation
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.15;
      coreRef.current.rotation.x += delta * 0.08;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.2;
      ring1Ref.current.rotation.x += delta * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.25;
      ring2Ref.current.rotation.y += delta * 0.18;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.15;
      ring3Ref.current.rotation.y -= delta * 0.1;
    }
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y += delta * 0.08;
    }
  });

  // Color mapping: Restrained warm orange (#FF7448), scientific soft blue (#D3E1FF), deep navy (#0F151D)
  const getCoreColor = () => {
    switch (hoverDomain) {
      case 'CHEMISTRY':
        return '#FF8D69'; // Warm terracotta accent
      case 'ELECTRONICS':
        return '#FF7448'; // Primary orange
      case 'PHYSICS':
        return '#93C5FD'; // Soft blue
      case 'FINANCE':
        return '#FFA88D'; // Warm peach
      default:
        return '#FF7448'; // Signature LabVerse warm orange
    }
  };

  const coreColor = getCoreColor();

  return (
    <group>
      {/* Central Scientific Knowledge Core */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere ref={coreRef} args={[1.35, 64, 64]}>
          <MeshDistortMaterial
            color={coreColor}
            attach="material"
            distort={0.25}
            speed={1.4}
            roughness={0.25}
            metalness={0.5}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
          />
        </Sphere>
      </Float>

      {/* Primary Orbital Ring (Warm Orange Accent) */}
      <Torus ref={ring1Ref} args={[2.3, 0.035, 16, 100]} rotation={[Math.PI / 3.2, 0, 0]}>
        <meshStandardMaterial
          color="#FF7448"
          emissive="#FF7448"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.7}
        />
      </Torus>

      {/* Secondary Orbital Ring (Scientific Soft Blue) */}
      <Torus ref={ring2Ref} args={[2.9, 0.025, 16, 100]} rotation={[-Math.PI / 3.8, Math.PI / 4, 0]}>
        <meshStandardMaterial
          color="#D3E1FF"
          emissive="#93C5FD"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.6}
        />
      </Torus>

      {/* Equatorial Deep Navy Carrier Track */}
      <Torus ref={ring3Ref} args={[3.4, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#0F151D"
          roughness={0.5}
          metalness={0.8}
        />
      </Torus>

      {/* Satellite Floating Particle Nodes */}
      <group ref={particleGroupRef}>
        <mesh position={[2.4, 1.2, 0.8]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FF7448" emissive="#FF7448" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-2.2, -1.0, 1.4]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#D3E1FF" emissive="#D3E1FF" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.6, -2.6, -1.2]}>
          <sphereGeometry args={[0.09, 16, 16]} />
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
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[8, 12, 10]} intensity={1.4} color="#FFF9F6" />
        <pointLight position={[-8, -8, -6]} intensity={0.8} color="#D3E1FF" />

        <KnowledgeCoreMesh hoverDomain={hoverDomain} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  );
};
