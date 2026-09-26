'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Ring, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, Globe2, Play, RotateCcw, Sparkles, Zap, ArrowDown, Shield } from 'lucide-react';

export interface PlanetData {
  id: string;
  name: string;
  color: string;
  radiusScale: number;
  orbitRadius: number;
  orbitSpeed: number;
  massKg: number;
  radiusKm: number;
  gravityMps2: number;
  escapeVelocityKps: number;
  surfaceTempC: number;
  moons: number;
  summary: string;
}

export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#A3A3A3',
    radiusScale: 0.22,
    orbitRadius: 1.8,
    orbitSpeed: 2.2,
    massKg: 3.3011e23,
    radiusKm: 2439.7,
    gravityMps2: 3.70,
    escapeVelocityKps: 4.25,
    surfaceTempC: 167,
    moons: 0,
    summary: 'Smallest planet in the Solar System with a dense iron core and extreme day-night temperature swings.'
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#EAB308',
    radiusScale: 0.38,
    orbitRadius: 2.5,
    orbitSpeed: 1.6,
    massKg: 4.8675e24,
    radiusKm: 6051.8,
    gravityMps2: 8.87,
    escapeVelocityKps: 10.36,
    surfaceTempC: 464,
    moons: 0,
    summary: 'Runaway greenhouse atmosphere with 92 bars surface pressure and sulfuric acid clouds.'
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#38BDF8',
    radiusScale: 0.42,
    orbitRadius: 3.4,
    orbitSpeed: 1.2,
    massKg: 5.972e24,
    radiusKm: 6371.0,
    gravityMps2: 9.81,
    escapeVelocityKps: 11.19,
    surfaceTempC: 15,
    moons: 1,
    summary: 'Dense silicate planet with liquid water oceans, nitrogen-oxygen atmosphere, and life.'
  },
  {
    id: 'moon',
    name: 'The Moon (Luna)',
    color: '#CBD5E1',
    radiusScale: 0.18,
    orbitRadius: 4.0,
    orbitSpeed: 1.0,
    massKg: 7.342e22,
    radiusKm: 1737.4,
    gravityMps2: 1.62,
    escapeVelocityKps: 2.38,
    surfaceTempC: -20,
    moons: 0,
    summary: 'Earth natural satellite with 1/6th terrestrial gravity, enabling high athletic leaps and low fall velocities.'
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#EF4444',
    radiusScale: 0.28,
    orbitRadius: 4.8,
    orbitSpeed: 0.8,
    massKg: 6.4171e23,
    radiusKm: 3389.5,
    gravityMps2: 3.71,
    escapeVelocityKps: 5.03,
    surfaceTempC: -65,
    moons: 2,
    summary: 'Red planet dominated by iron oxide dust, Olympus Mons volcano, and thin carbon dioxide air.'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#F59E0B',
    radiusScale: 0.85,
    orbitRadius: 6.2,
    orbitSpeed: 0.5,
    massKg: 1.8982e27,
    radiusKm: 69911,
    gravityMps2: 24.79,
    escapeVelocityKps: 59.5,
    surfaceTempC: -110,
    moons: 95,
    summary: 'Massive gas giant with 2.5x the mass of all other planets combined and immense surface gravity.'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#FDE047',
    radiusScale: 0.72,
    orbitRadius: 7.8,
    orbitSpeed: 0.35,
    massKg: 5.6834e26,
    radiusKm: 58232,
    gravityMps2: 10.44,
    escapeVelocityKps: 35.5,
    surfaceTempC: -140,
    moons: 146,
    summary: 'Gas giant encircled by extensive water-ice ring system and 146 discovered natural satellites.'
  }
];

function OrbitingPlanetMesh({
  planet,
  isSelected,
  onSelect,
}: {
  planet: PlanetData;
  isSelected: boolean;
  onSelect: (p: PlanetData) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = clock.getElapsedTime() * (planet.orbitSpeed * 0.15);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={orbitGroupRef}>
      {/* Orbit Trail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.orbitRadius - 0.01, planet.orbitRadius + 0.01, 64]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Planet Sphere */}
      <mesh
        ref={meshRef}
        position={[planet.orbitRadius, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planet);
        }}
      >
        <sphereGeometry args={[planet.radiusScale, 24, 24]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={isSelected ? planet.color : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : 0.0}
          roughness={0.4}
        />

        {/* Saturn Rings */}
        {planet.id === 'saturn' && (
          <mesh rotation={[-Math.PI / 3, 0, 0]}>
            <ringGeometry args={[planet.radiusScale * 1.4, planet.radiusScale * 2.3, 32]} />
            <meshBasicMaterial color="#E2E8F0" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

function SolarSystemScene({
  selectedPlanet,
  onSelectPlanet,
}: {
  selectedPlanet: PlanetData;
  onSelectPlanet: (p: PlanetData) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FFA500" distance={30} />

      {/* Central Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshBasicMaterial color="#FFA500" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshBasicMaterial color="#FF7448" transparent opacity={0.25} />
      </mesh>

      {/* Planets */}
      {PLANETS.map((p) => (
        <OrbitingPlanetMesh
          key={p.id}
          planet={p}
          isSelected={selectedPlanet.id === p.id}
          onSelect={onSelectPlanet}
        />
      ))}

      <OrbitControls enableZoom={true} minDistance={2} maxDistance={20} />
    </>
  );
}

export const SolarSystemGravityViewer: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData>(PLANETS[2]); // Default Earth
  const [dropHeight, setDropHeight] = useState<number>(20); // 20 meters
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [dropProgress, setDropProgress] = useState<number>(0); // 0 to 1

  // Kinematic Free Fall Calculations: t = sqrt(2h / g), v = sqrt(2gh)
  const fallTimeSeconds = useMemo(() => {
    return Math.sqrt((2 * dropHeight) / selectedPlanet.gravityMps2);
  }, [dropHeight, selectedPlanet]);

  const impactVelocityKmh = useMemo(() => {
    const vMps = Math.sqrt(2 * selectedPlanet.gravityMps2 * dropHeight);
    return +(vMps * 3.6).toFixed(1);
  }, [dropHeight, selectedPlanet]);

  // Animated Free Fall Drop Simulation
  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;

    if (isDropping) {
      setDropProgress(0);
      const durationMs = fallTimeSeconds * 1000;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1.0, elapsed / durationMs);

        // Physics quadratic position curve: y(t) = 0.5 * g * t^2 -> progress = (t / T)^2
        const physicalProgress = Math.pow(progress, 2);
        setDropProgress(physicalProgress);

        if (progress < 1.0) {
          animationFrame = requestAnimationFrame(step);
        } else {
          setIsDropping(false);
        }
      };

      animationFrame = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isDropping, fallTimeSeconds]);

  const handleTriggerDrop = () => {
    if (!isDropping) {
      setIsDropping(true);
    }
  };

  return (
    <div className={`p-6 rounded-[28px] border transition-all card-nomu space-y-6 ${
      isDark ? 'bg-[#141B24] border-[#2A3644] text-white' : 'bg-white border-[#E8E2DC] text-[#0F151D]'
    }`}>
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 dark:border-[#2A3644] border-[#E8E2DC]">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 text-xs font-bold font-mono">
            <Globe2 className="w-3.5 h-3.5" />
            <span>ORBITAL MECHANICS & GRAVITATIONAL ACCELERATION</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Planetary Gravity & Kinematic Free-Fall Lab
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Click any celestial body to inspect its gravitational field strength $g = \frac&#123;GM&#125;&#123;r^2&#125;$ and trigger live empirical free-fall kinematic drops.
          </p>
        </div>

        {/* Planet Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PLANETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlanet(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedPlanet.id === p.id
                  ? 'bg-[#FF7448] text-white font-bold shadow-sm'
                  : isDark
                  ? 'bg-[#0D1219] text-slate-400 hover:text-white border border-[#2A3644]'
                  : 'bg-[#FFF9F6] text-slate-700 hover:text-black border border-[#E8E2DC]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 3D Solar System + Kinematics Drop Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: 3D Three.js Solar System Scene (7 cols) */}
        <div className="lg:col-span-7 h-[380px] sm:h-[440px] rounded-2xl bg-[#06090E] border border-[#2A3644] relative overflow-hidden flex items-center justify-center">
          <Canvas camera={{ position: [0, 8, 11], fov: 45 }}>
            <SolarSystemScene
              selectedPlanet={selectedPlanet}
              onSelectPlanet={setSelectedPlanet}
            />
          </Canvas>

          {/* Floating HUD on 3D View */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedPlanet.color }} />
            <span className="font-bold">{selectedPlanet.name.toUpperCase()}</span>
            <span className="text-[#FF7448]">• g = {selectedPlanet.gravityMps2} m/s²</span>
          </div>

          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 font-mono text-[11px]">
            Drag to Rotate • Click Orbiting Planets
          </div>
        </div>

        {/* Right: Planet Telemetry & Live Kinematic Drop Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Planet Identity Card */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-[#FFF9F6] border-[#E8E2DC]'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#FF7448] uppercase tracking-wider">
                  Gravitational Field
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">
                  {selectedPlanet.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Radius: {selectedPlanet.radiusKm.toLocaleString()} km • Mass: {selectedPlanet.massKg.toExponential(2)} kg
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl border border-white/10 flex flex-col items-center justify-center font-mono shadow-md" style={{ backgroundColor: selectedPlanet.color, color: selectedPlanet.id === 'moon' || selectedPlanet.id === 'mercury' ? '#0F151D' : '#FFFFFF' }}>
                <span className="text-xs font-bold">g</span>
                <span className="text-sm font-extrabold">{selectedPlanet.gravityMps2}</span>
              </div>
            </div>

            <p className="text-xs mt-3 leading-relaxed text-slate-300 dark:text-slate-400">
              {selectedPlanet.summary}
            </p>
          </div>

          {/* Governing Formula Banner */}
          <div className="p-3.5 rounded-xl bg-[#080C10] border border-[#2A3644] font-mono text-xs flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Newton&apos;s Universal Law:</span>
            <span className="text-[#FF7448] font-bold">g = (G × M) / R²</span>
          </div>

          {/* Kinematic Free Fall Animation Box */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Kinematic Drop Simulator (h = {dropHeight}m)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                t = {fallTimeSeconds.toFixed(2)}s • v = {impactVelocityKmh} km/h
              </span>
            </div>

            {/* Visual Free Fall Tower */}
            <div className="h-20 rounded-xl bg-[#06090E] border border-[#2A3644] relative overflow-hidden flex flex-col justify-between p-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Top ({dropHeight}m)</span>
                <span>Impact Ground (0m)</span>
              </div>

              {/* Falling Mass Indicator */}
              <div 
                className="w-5 h-5 rounded-full bg-[#FF7448] border-2 border-white shadow-lg absolute transition-all flex items-center justify-center text-[8px] font-bold text-white font-mono"
                style={{
                  top: `${15 + dropProgress * 60}%`,
                  left: '48%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                m
              </div>

              <div className="h-1.5 w-full bg-emerald-500/30 rounded-full" />
            </div>

            {/* Drop Height Slider & Action Button */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={100}
                value={dropHeight}
                onChange={(e) => setDropHeight(Number(e.target.value))}
                disabled={isDropping}
                className="flex-1 h-2 rounded-lg bg-[#2A3644] accent-[#FF7448] cursor-pointer"
              />

              <button
                onClick={handleTriggerDrop}
                disabled={isDropping}
                className="btn-pill-primary h-9 px-4 text-xs cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isDropping ? 'Falling...' : 'Drop Mass'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
