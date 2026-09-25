'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExperimentDefinition } from '@/types';
import { RotateCw, Maximize2, Compass, Sparkles, Eye } from 'lucide-react';

interface Apparatus3DPreviewProps {
  experiment: ExperimentDefinition;
  theme?: 'dark' | 'light';
}

export const Apparatus3DPreview: React.FC<Apparatus3DPreviewProps> = ({
  experiment,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [viewAngle, setViewAngle] = useState<'ISOMETRIC' | 'TOP' | 'FRONT'>('ISOMETRIC');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x070b14 : 0xf8fafc);

    const width = container.clientWidth || 700;
    const height = 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    mainLight.position.set(10, 15, 10);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xa855f7, 2.0, 50);
    fillLight.position.set(-10, 8, -5);
    scene.add(fillLight);

    // 3. Grid Helper Base
    const gridHelper = new THREE.GridHelper(16, 16, isDark ? 0x0284c7 : 0x94a3b8, isDark ? 0x1e293b : 0xe2e8f0);
    gridHelper.position.y = -1.8;
    scene.add(gridHelper);

    // 4. Build Experiment 3D Apparatus Group
    const apparatusGroup = new THREE.Group();
    scene.add(apparatusGroup);

    // Dynamic animation callbacks
    let animateCallbacks: ((delta: number, elapsed: number) => void)[] = [];

    // Helper Materials
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.7,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0x64748b,
      metalness: 0.9,
      roughness: 0.3,
    });

    // Build specific 3D apparatus per experiment
    switch (experiment.id) {
      case 'ohms-law': {
        // 3D Breadboard base
        const boardGeo = new THREE.BoxGeometry(9, 0.4, 6);
        const boardMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x0f172a : 0xe2e8f0, roughness: 0.5 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = -1.6;
        apparatusGroup.add(board);

        // Battery Pack
        const battGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.2, 24);
        const battMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
        const batt1 = new THREE.Mesh(battGeo, battMat);
        batt1.rotation.z = Math.PI / 2;
        batt1.position.set(-2.8, -1.1, 1.2);
        apparatusGroup.add(batt1);

        // Resistor Cylinder with colored bands
        const resGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.4, 24);
        const resMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.4 });
        const resistor = new THREE.Mesh(resGeo, resMat);
        resistor.rotation.z = Math.PI / 2;
        resistor.position.set(0, -1.1, -1.5);
        apparatusGroup.add(resistor);

        // Bands
        const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 24), new THREE.MeshBasicMaterial({ color: 0xb91c1c }));
        band1.rotation.z = Math.PI / 2;
        band1.position.set(-0.5, -1.1, -1.5);
        apparatusGroup.add(band1);

        const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        band2.rotation.z = Math.PI / 2;
        band2.position.set(0, -1.1, -1.5);
        apparatusGroup.add(band2);

        const band3 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        band3.rotation.z = Math.PI / 2;
        band3.position.set(0.5, -1.1, -1.5);
        apparatusGroup.add(band3);

        // Analog Ammeter Housing
        const meterBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32), darkMetalMat);
        meterBase.position.set(2.8, -1.1, 1.2);
        apparatusGroup.add(meterBase);

        // Needle
        const needleGeo = new THREE.BoxGeometry(0.06, 0.04, 0.9);
        const needleMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const needle = new THREE.Mesh(needleGeo, needleMat);
        needle.position.set(2.8, -0.65, 1.2);
        apparatusGroup.add(needle);

        // Animated circulating electron particles
        const particleCount = 40;
        const particleGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const particles: THREE.Mesh[] = [];

        for (let i = 0; i < particleCount; i++) {
          const p = new THREE.Mesh(particleGeo, particleMat);
          apparatusGroup.add(p);
          particles.push(p);
        }

        // Path: loop through Battery -> Resistor -> Ammeter
        animateCallbacks.push((_, elapsed) => {
          needle.rotation.y = Math.sin(elapsed * 2) * 0.3 + 0.2;
          particles.forEach((p, idx) => {
            const t = (elapsed * 0.8 + idx / particleCount) % 1;
            // 4-corner loop: (-2.8, 1.2) -> (0, -1.5) -> (2.8, 1.2) -> (-2.8, 1.2)
            if (t < 0.33) {
              const u = t / 0.33;
              p.position.set(-2.8 + u * 2.8, -1.1, 1.2 - u * 2.7);
            } else if (t < 0.66) {
              const u = (t - 0.33) / 0.33;
              p.position.set(0 + u * 2.8, -1.1, -1.5 + u * 2.7);
            } else {
              const u = (t - 0.66) / 0.34;
              p.position.set(2.8 - u * 5.6, -1.1, 1.2);
            }
          });
        });
        break;
      }

      case 'gravity-pendulum': {
        // Stand
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.3, 32), darkMetalMat);
        base.position.y = -1.65;
        apparatusGroup.add(base);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.5, 16), darkMetalMat);
        pole.position.set(0, 0.6, 0);
        apparatusGroup.add(pole);

        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2, 16), darkMetalMat);
        arm.rotation.z = Math.PI / 2;
        arm.position.set(0.9, 2.8, 0);
        apparatusGroup.add(arm);

        // Swinging Pivot & String
        const pivotGroup = new THREE.Group();
        pivotGroup.position.set(1.6, 2.8, 0);
        apparatusGroup.add(pivotGroup);

        const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.2, 8);
        const stringMesh = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: isDark ? 0x94a3b8 : 0x475569 }));
        stringMesh.position.y = -1.6;
        pivotGroup.add(stringMesh);

        // Shiny Bob
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), amberMat);
        bob.position.y = -3.2;
        pivotGroup.add(bob);

        animateCallbacks.push((_, elapsed) => {
          const theta = Math.sin(elapsed * 2.5) * 0.45;
          pivotGroup.rotation.z = theta;
        });
        break;
      }

      case 'photoelectric-effect': {
        // Vacuum Tube glass envelope
        const tubeGeo = new THREE.CylinderGeometry(1.2, 1.2, 4.5, 32);
        const tubeMat = new THREE.MeshPhysicalMaterial({
          color: 0x818cf8,
          transparent: true,
          opacity: 0.25,
          roughness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.rotation.z = Math.PI / 2;
        apparatusGroup.add(tube);

        // Cathode plate (Emitter)
        const cathode = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 1.4), amberMat);
        cathode.position.set(-1.4, 0, 0);
        apparatusGroup.add(cathode);

        // Anode plate (Collector)
        const anode = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 16, 32), darkMetalMat);
        anode.rotation.y = Math.PI / 2;
        anode.position.set(1.4, 0, 0);
        apparatusGroup.add(anode);

        // UV Light Laser Source
        const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.8, 24), darkMetalMat);
        laser.position.set(-3.2, 2.0, 0);
        laser.rotation.z = -Math.PI / 4;
        apparatusGroup.add(laser);

        // Laser beam
        const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.85 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(-2.3, 1.0, 0);
        beam.rotation.z = -Math.PI / 4;
        apparatusGroup.add(beam);

        // Ejected photoelectrons
        const eCount = 20;
        const eParticles: THREE.Mesh[] = [];
        const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        for (let i = 0; i < eCount; i++) {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eMat);
          apparatusGroup.add(e);
          eParticles.push(e);
        }

        animateCallbacks.push((_, elapsed) => {
          eParticles.forEach((e, idx) => {
            const progress = (elapsed * 1.5 + idx / eCount) % 1;
            e.position.set(-1.4 + progress * 2.8, (Math.random() - 0.5) * 0.4 * Math.sin(progress * Math.PI), (Math.random() - 0.5) * 0.4 * Math.sin(progress * Math.PI));
          });
        });
        break;
      }

      case 'antenna-radiation': {
        // Antenna Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 5, 16), darkMetalMat);
        mast.position.y = 0.5;
        apparatusGroup.add(mast);

        // Dipole rods
        const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), cyanGlowMat);
        rod1.position.set(0, 3.2, 0);
        apparatusGroup.add(rod1);

        // Radiating 3D Torus Wave Rings
        const waveCount = 4;
        const waves: THREE.Mesh[] = [];
        for (let i = 0; i < waveCount; i++) {
          const wave = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.05, 16, 48),
            new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 })
          );
          wave.rotation.x = Math.PI / 2;
          wave.position.y = 3.2;
          apparatusGroup.add(wave);
          waves.push(wave);
        }

        animateCallbacks.push((_, elapsed) => {
          waves.forEach((w, idx) => {
            const prog = (elapsed * 0.6 + idx / waveCount) % 1;
            w.scale.set(prog * 4.5 + 0.5, prog * 4.5 + 0.5, prog * 4.5 + 0.5);
            (w.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - prog);
          });
        });
        break;
      }

      case 'chemical-kinetics': {
        // Glass Beaker
        const beakerGeo = new THREE.CylinderGeometry(1.5, 1.4, 3.2, 32, 1, true);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x6ee7b7,
          transparent: true,
          opacity: 0.35,
          transmission: 0.85,
          roughness: 0.1,
        });
        const beaker = new THREE.Mesh(beakerGeo, glassMat);
        beaker.position.y = 0;
        apparatusGroup.add(beaker);

        // Liquid Volume inside
        const liquidGeo = new THREE.CylinderGeometry(1.35, 1.3, 2.2, 32);
        const liquidMat = new THREE.MeshStandardMaterial({ color: 0x059669, transparent: true, opacity: 0.6, roughness: 0.2 });
        const liquid = new THREE.Mesh(liquidGeo, liquidMat);
        liquid.position.y = -0.4;
        apparatusGroup.add(liquid);

        // Reactant Solute Molecules
        const molCount = 25;
        const molecules: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
        for (let i = 0; i < molCount; i++) {
          const isA = i % 2 === 0;
          const mol = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 12),
            new THREE.MeshStandardMaterial({ color: isA ? 0x3b82f6 : 0xf59e0b, emissive: isA ? 0x1d4ed8 : 0xb45309, emissiveIntensity: 0.4 })
          );
          mol.position.set((Math.random() - 0.5) * 1.8, -1.2 + Math.random() * 1.8, (Math.random() - 0.5) * 1.8);
          apparatusGroup.add(mol);
          molecules.push({
            mesh: mol,
            vel: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04),
          });
        }

        animateCallbacks.push(() => {
          molecules.forEach(m => {
            m.mesh.position.add(m.vel);
            if (Math.abs(m.mesh.position.x) > 1.0) m.vel.x *= -1;
            if (m.mesh.position.y < -1.4 || m.mesh.position.y > 0.6) m.vel.y *= -1;
            if (Math.abs(m.mesh.position.z) > 1.0) m.vel.z *= -1;
          });
        });
        break;
      }

      case 'portfolio-risk': {
        // 3D Markowitz Efficient Frontier Surface
        const surfaceGeo = new THREE.ConeGeometry(2.5, 3.2, 32, 8, true);

        const surfaceMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          wireframe: true,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
        });
        const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
        surface.rotation.x = Math.PI;
        apparatusGroup.add(surface);

        // Floating Asset Spheres
        const assets = [
          { name: 'Equities (60%)', color: 0x38bdf8, pos: new THREE.Vector3(1.6, 1.2, 0.8) },
          { name: 'Bonds (40%)', color: 0x10b981, pos: new THREE.Vector3(-1.2, -0.4, 1.2) },
          { name: 'Optimal Portfolio', color: 0xf43f5e, pos: new THREE.Vector3(0.5, 0.8, -0.5) },
        ];

        assets.forEach(a => {
          const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshStandardMaterial({ color: a.color, emissive: a.color, emissiveIntensity: 0.6 }));
          sphere.position.copy(a.pos);
          apparatusGroup.add(sphere);
        });

        animateCallbacks.push((_, elapsed) => {
          surface.rotation.y = elapsed * 0.2;
        });
        break;
      }

      default: {
        // Universal Scientific Concept 3D Nucleus / Core
        const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), cyanGlowMat);
        apparatusGroup.add(core);

        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.06, 16, 48), darkMetalMat);
        ring1.rotation.x = Math.PI / 3;
        apparatusGroup.add(ring1);

        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.06, 16, 48), amberMat);
        ring2.rotation.y = Math.PI / 4;
        apparatusGroup.add(ring2);

        animateCallbacks.push((_, elapsed) => {
          core.rotation.y = elapsed * 0.5;
          ring1.rotation.z = elapsed * 0.4;
          ring2.rotation.x = elapsed * 0.3;
        });
        break;
      }
    }

    // 5. Mouse Drag Orbit Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      apparatusGroup.rotation.y += deltaX * 0.008;
      apparatusGroup.rotation.x += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 6. Animation Loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        apparatusGroup.rotation.y += 0.005;
      }

      animateCallbacks.forEach(cb => cb(delta, elapsed));
      renderer.render(scene, camera);
    };
    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [experiment.id, isDark, isRotating]);

  return (
    <div className={`rounded-2xl border overflow-hidden relative shadow-xl transition-colors ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* 3D Viewer Header Banner */}
      <div className={`px-5 py-3 border-b flex items-center justify-between text-xs font-semibold ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">3D Interactive Apparatus & Physics Concept Explainer</span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Three.js Engine
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors flex items-center space-x-1 cursor-pointer ${
              isRotating
                ? isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-300'
            }`}
            title="Toggle 3D Auto-Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRotating ? 'Auto-Rotate ON' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Mounting Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[360px] cursor-grab active:cursor-grabbing relative flex items-center justify-center select-none"
      />

      {/* Interactive Guidance Footer Overlay */}
      <div className={`px-4 py-2 text-[11px] border-t flex flex-wrap items-center justify-between gap-2 opacity-85 ${
        isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center space-x-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click and drag anywhere on the 3D model to rotate and inspect from any angle.</span>
        </div>
        <div className="font-mono text-[10px] text-cyan-500 font-bold">
          3D MODEL: {experiment.title.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
