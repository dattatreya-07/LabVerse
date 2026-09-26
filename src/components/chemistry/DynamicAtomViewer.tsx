'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Ring, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Atom, Sparkles, Search, RotateCcw, Info, Zap } from 'lucide-react';

export interface ChemicalElementInfo {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: string;
  electronConfig: string;
  valenceElectrons: number;
  electronegativity: number | null;
  summary: string;
}

export const PERIODIC_ELEMENTS: ChemicalElementInfo[] = [
  { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, category: 'Nonmetal', electronConfig: '1s¹', valenceElectrons: 1, electronegativity: 2.20, summary: 'Lightest and most abundant chemical substance in the Universe.' },
  { atomicNumber: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026, category: 'Noble Gas', electronConfig: '1s²', valenceElectrons: 2, electronegativity: null, summary: 'Colorless, odorless, inert noble gas with a complete 1s shell.' },
  { atomicNumber: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, category: 'Alkali Metal', electronConfig: '[He] 2s¹', valenceElectrons: 1, electronegativity: 0.98, summary: 'Soft, silvery-white alkali metal with highest electrochemical potential.' },
  { atomicNumber: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, category: 'Nonmetal', electronConfig: '[He] 2s² 2p²', valenceElectrons: 4, electronegativity: 2.55, summary: 'Basis of all organic chemistry and life through versatile sp/sp2/sp3 hybridization.' },
  { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, category: 'Nonmetal', electronConfig: '[He] 2s² 2p³', valenceElectrons: 5, electronegativity: 3.04, summary: 'Makes up 78% of Earth atmosphere with a stable triple covalent bond (N≡N).' },
  { atomicNumber: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, category: 'Nonmetal', electronConfig: '[He] 2s² 2p⁴', valenceElectrons: 6, electronegativity: 3.44, summary: 'Highly reactive nonmetal and oxidizing agent essential for aerobic cellular respiration.' },
  { atomicNumber: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990, category: 'Alkali Metal', electronConfig: '[Ne] 3s¹', valenceElectrons: 1, electronegativity: 0.93, summary: 'Highly reactive alkali metal readily forming ionic NaCl lattice crystals.' },
  { atomicNumber: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, category: 'Metalloid', electronConfig: '[Ne] 3s² 3p²', valenceElectrons: 4, electronegativity: 1.90, summary: 'Primary semiconductor substrate of modern integrated circuits and microprocessors.' },
  { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, category: 'Halogen', electronConfig: '[Ne] 3s² 3p⁵', valenceElectrons: 7, electronegativity: 3.16, summary: 'Strong oxidizing halogen forming table salt and industrial disinfectants.' },
  { atomicNumber: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845, category: 'Transition Metal', electronConfig: '[Ar] 3d⁶ 4s²', valenceElectrons: 2, electronegativity: 1.83, summary: 'Core ferromagnetic transition element driving planetary magnetic dynamos and hemoglobin.' },
  { atomicNumber: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546, category: 'Transition Metal', electronConfig: '[Ar] 3d¹⁰ 4s¹', valenceElectrons: 1, electronegativity: 1.90, summary: 'High electrical and thermal conductivity metal used universally in wires and circuitry.' },
  { atomicNumber: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97, category: 'Transition Metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', valenceElectrons: 1, electronegativity: 2.54, summary: 'Noble unreactive metal used in Rutherford alpha scattering and corrosion-free contacts.' },
  { atomicNumber: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.03, category: 'Actinide', electronConfig: '[Rn] 5f³ 6d¹ 7s²', valenceElectrons: 6, electronegativity: 1.38, summary: 'Dense radioactive actinide whose U-235 isotope undergoes induced nuclear fission.' }
];

/**
 * Calculates electron shell capacities according to 2n^2 rule (K=2, L=8, M=18, N=32)
 */
export function calculateShellDistribution(atomicNumber: number): number[] {
  const capacities = [2, 8, 18, 32, 32, 18, 8];
  let remaining = atomicNumber;
  const shells: number[] = [];

  for (const cap of capacities) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, cap);
    shells.push(count);
    remaining -= count;
  }

  return shells;
}

/**
 * Animated Orbiting Electron Component
 */
function OrbitingElectron({ 
  radius, 
  angleOffset, 
  speed, 
  tiltX = 0,
  tiltY = 0 
}: { 
  radius: number; 
  angleOffset: number; 
  speed: number;
  tiltX?: number;
  tiltY?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + angleOffset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;

    // Apply 3D tilt rotation
    const pos = new THREE.Vector3(x, 0, z);
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), tiltY);

    meshRef.current.position.copy(pos);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshStandardMaterial 
        color="#38BDF8" 
        emissive="#0284C7" 
        emissiveIntensity={1.8} 
        roughness={0.1} 
      />
    </mesh>
  );
}

/**
 * 3D Nucleus Component with Protons & Neutrons
 */
function AtomNucleus({ protonCount, neutronCount }: { protonCount: number; neutronCount: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  // Generate bounded packing sphere positions for nucleons
  const nucleons = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; isProton: boolean }> = [];
    const total = Math.min(60, protonCount + Math.max(1, neutronCount)); // cap for performance

    for (let i = 0; i < total; i++) {
      const isProton = i % 2 === 0;
      const phi = Math.acos(-1 + (2 * i) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const r = 0.25 * Math.cbrt(i / total + 0.1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      list.push({ pos: [x, y, z], isProton });
    }
    return list;
  }, [protonCount, neutronCount]);

  return (
    <group ref={groupRef}>
      {/* Central glow core */}
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial 
          color="#FF7448" 
          emissive="#FF7448" 
          emissiveIntensity={1.2} 
          transparent 
          opacity={0.3} 
        />
      </Sphere>

      {/* Individual Protons (Orange-Red) and Neutrons (Blue-Grey) */}
      {nucleons.map((n, idx) => (
        <mesh key={idx} position={n.pos}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color={n.isProton ? '#FF7448' : '#94A3B8'}
            emissive={n.isProton ? '#EA580C' : '#475569'}
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 3D Bohr Atom Scene
 */
function AtomScene({ atomicNumber }: { atomicNumber: number }) {
  const shells = useMemo(() => calculateShellDistribution(atomicNumber), [atomicNumber]);
  const neutrons = Math.round(atomicNumber * 1.2);

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#FF7448" />

      {/* Central Nucleus */}
      <AtomNucleus protonCount={atomicNumber} neutronCount={neutrons} />

      {/* Concentric Electron Shells */}
      {shells.map((electronCount, shellIdx) => {
        const radius = 0.8 + shellIdx * 0.55;
        const speed = 1.2 / Math.sqrt(shellIdx + 1);
        const tiltX = (shellIdx * Math.PI) / 6;
        const tiltY = (shellIdx * Math.PI) / 4;

        return (
          <group key={shellIdx}>
            {/* Orbital Track Ring */}
            <mesh rotation={[tiltX, tiltY, 0]}>
              <ringGeometry args={[radius - 0.008, radius + 0.008, 64]} />
              <meshBasicMaterial 
                color="#0284C7" 
                transparent 
                opacity={0.25} 
                side={THREE.DoubleSide} 
              />
            </mesh>

            {/* Orbiting Electrons */}
            {Array.from({ length: electronCount }).map((_, eIdx) => {
              const angleOffset = (eIdx * 2 * Math.PI) / electronCount;
              return (
                <OrbitingElectron
                  key={eIdx}
                  radius={radius}
                  angleOffset={angleOffset}
                  speed={speed}
                  tiltX={tiltX}
                  tiltY={tiltY}
                />
              );
            })}
          </group>
        );
      })}

      <OrbitControls enableZoom={true} maxDistance={10} minDistance={1.5} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export const DynamicAtomViewer: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [selectedZ, setSelectedZ] = useState<number>(6); // Default Carbon (Z=6)
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentElement = useMemo(() => {
    return PERIODIC_ELEMENTS.find(e => e.atomicNumber === selectedZ) || {
      atomicNumber: selectedZ,
      symbol: `E${selectedZ}`,
      name: `Element ${selectedZ}`,
      atomicMass: +(selectedZ * 2.1).toFixed(2),
      category: 'Synthesized',
      electronConfig: `Z=${selectedZ}`,
      valenceElectrons: selectedZ % 8 || 8,
      electronegativity: 1.5,
      summary: `Dynamic atomic simulation for Z=${selectedZ}.`,
    };
  }, [selectedZ]);

  const shells = useMemo(() => calculateShellDistribution(selectedZ), [selectedZ]);

  return (
    <div className={`p-6 rounded-[28px] border transition-all card-nomu space-y-6 ${
      isDark ? 'bg-[#141B24] border-[#2A3644] text-white' : 'bg-white border-[#E8E2DC] text-[#0F151D]'
    }`}>
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 dark:border-[#2A3644] border-[#E8E2DC]">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 text-xs font-bold font-mono">
            <Atom className="w-3.5 h-3.5" />
            <span>3D ATOMIC ORBITAL SIMULATOR</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Dynamic Quantum Bohr Atom Model
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Inspect real-time 3D electron shell distributions, orbital angular momentum tracks, and nuclear nucleon clusters for any element Z = 1 to 118.
          </p>
        </div>

        {/* Element Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-md">
          {PERIODIC_ELEMENTS.slice(0, 8).map((el) => (
            <button
              key={el.atomicNumber}
              onClick={() => setSelectedZ(el.atomicNumber)}
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedZ === el.atomicNumber
                  ? 'bg-[#FF7448] text-white shadow-sm'
                  : isDark
                  ? 'bg-[#0D1219] text-slate-400 hover:text-white border border-[#2A3644]'
                  : 'bg-[#FFF9F6] text-slate-700 hover:text-black border border-[#E8E2DC]'
              }`}
            >
              {el.symbol} ({el.atomicNumber})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 3D Canvas + Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: 3D Three.js Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 h-[380px] sm:h-[440px] rounded-2xl bg-[#080C10] border border-[#2A3644] relative overflow-hidden flex items-center justify-center">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
            <AtomScene atomicNumber={selectedZ} />
          </Canvas>

          {/* Canvas Floating Overlay Badges */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
            <span>SHELLS: [{shells.join(', ')}]</span>
          </div>

          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 font-mono text-[11px]">
            Drag to Rotate 3D • Scroll to Zoom
          </div>
        </div>

        {/* Right: Element Telemetry & Stats Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Element Identity Card */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-[#FFF9F6] border-[#E8E2DC]'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#FF7448] uppercase tracking-wider">
                  {currentElement.category}
                </span>
                <h3 className="text-3xl font-extrabold tracking-tight mt-0.5">
                  {currentElement.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Standard Atomic Weight: {currentElement.atomicMass} u
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#FF7448] text-white flex flex-col items-center justify-center font-mono shadow-lg">
                <span className="text-[10px] font-bold opacity-80">{currentElement.atomicNumber}</span>
                <span className="text-xl font-extrabold">{currentElement.symbol}</span>
              </div>
            </div>

            <p className="text-xs mt-3 leading-relaxed text-slate-300 dark:text-slate-400">
              {currentElement.summary}
            </p>
          </div>

          {/* Shell Capacity Breakdown */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'}`}>
              <span className="text-slate-400 text-[10px] block uppercase">Electron Config</span>
              <span className="font-bold text-cyan-400 text-sm">{currentElement.electronConfig}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'}`}>
              <span className="text-slate-400 text-[10px] block uppercase">Valence Electrons</span>
              <span className="font-bold text-amber-400 text-sm">{currentElement.valenceElectrons} e⁻</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'}`}>
              <span className="text-slate-400 text-[10px] block uppercase">Protons (Z)</span>
              <span className="font-bold text-rose-400 text-sm">{selectedZ} Protons</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'}`}>
              <span className="text-slate-400 text-[10px] block uppercase">Electronegativity</span>
              <span className="font-bold text-emerald-400 text-sm">{currentElement.electronegativity ?? 'Inert'}</span>
            </div>
          </div>

          {/* Slider for any Atomic Number Z */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Custom Atomic Number (Z)</span>
              <span className="font-mono text-[#FF7448] font-bold">Z = {selectedZ}</span>
            </div>
            <input
              type="range"
              min={1}
              max={92}
              value={selectedZ}
              onChange={(e) => setSelectedZ(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-[#2A3644] accent-[#FF7448] cursor-pointer"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
