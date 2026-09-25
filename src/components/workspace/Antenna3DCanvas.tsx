'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Maximize2, RefreshCw, Radio, Zap, Activity, Eye, ShieldAlert } from 'lucide-react';

interface Antenna3DCanvasProps {
  parameters: Record<string, number>;
  onParameterChange?: (id: string, value: number) => void;
  activeFaults?: string[];
  theme?: 'dark' | 'light';
}

export const Antenna3DCanvas: React.FC<Antenna3DCanvasProps> = ({
  parameters,
  onParameterChange,
  activeFaults = [],
  theme = 'dark',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme === 'dark';

  // Read current parameters with defaults
  const frequency = parameters['frequency'] ?? 1.5; // GHz
  const power = parameters['power'] ?? 1.0; // W
  const antennaType = Math.round(parameters['antennaType'] ?? 0); // 0: Omni Dipole, 1: Dish, 2: Yagi
  const probeDistance = parameters['probeDistance'] ?? 6.0; // m

  // Keep refs for animated elements to update inside Three.js frame render loop
  const animStateRef = useRef({
    frequency,
    power,
    antennaType,
    probeDistance,
    activeFaults,
  });

  // Update animStateRef on prop changes
  useEffect(() => {
    animStateRef.current = {
      frequency,
      power,
      antennaType,
      probeDistance,
      activeFaults,
    };
  }, [frequency, power, antennaType, probeDistance, activeFaults]);

  // Real-time telemetry calculations
  const gains = [1.64, 28.2, 10.5];
  const gainNames = ['Dipole (Omni-Directional Torus)', 'Parabolic Dish (High-Gain Beam)', 'Yagi-Uda Array (Multi-Element Directive)'];
  const gain = gains[antennaType] || 1.64;
  const hasFault = activeFaults.length > 0;
  const powerMult = hasFault ? 0.5 : 1.0;
  const effectivePower = power * powerMult;

  const eField = (Math.sqrt(30 * effectivePower * gain) / Math.max(0.5, probeDistance)).toFixed(2);
  const powerDensity = (((Number(eField) * Number(eField)) / 377.0) * 1000).toFixed(2); // mW/m^2
  const wavelength = ((0.3 / frequency) * 100).toFixed(1); // cm

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x05070f : 0xf1f5f9);
    scene.fog = new THREE.FogExp2(isDark ? 0x05070f : 0xf1f5f9, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 10, 22);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear old canvases
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go below ground grid
    controls.minDistance = 4;
    controls.maxDistance = 60;
    controls.target.set(0, 3, 0);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.6 : 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.2 : 1.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x00f0ff, 2, 20);
    bluePointLight.position.set(0, 7.5, 0);
    scene.add(bluePointLight);

    const beaconLight = new THREE.PointLight(0xff0044, 3, 10);
    beaconLight.position.set(0, 8.2, 0);
    scene.add(beaconLight);

    // 5. Ground Grid & Cyber Platform
    const gridHelper = new THREE.GridHelper(60, 60, isDark ? 0x00f0ff : 0x0284c7, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Platform Base Disc
    const discGeo = new THREE.CylinderGeometry(6, 6.5, 0.4, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.3,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.2;
    disc.receiveShadow = true;
    scene.add(disc);

    const ringGeo = new THREE.RingGeometry(5.8, 6.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // 6. Antenna Tower Model Base Group
    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    // Metallic Tower Mast Cylinders & Struts
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });

    const mastGeo = new THREE.CylinderGeometry(0.2, 0.4, 7.5, 16);
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 3.75;
    towerGroup.add(mast);

    // Diagonal Cross Struts
    for (let i = 0; i < 4; i++) {
      const legAngle = (i * Math.PI) / 2;
      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 7.8, 8);
      const leg = new THREE.Mesh(legGeo, mastMat);
      leg.position.set(Math.cos(legAngle) * 0.9, 3.75, Math.sin(legAngle) * 0.9);
      leg.rotation.z = (Math.cos(legAngle) * Math.PI) / 36;
      leg.rotation.x = (Math.sin(legAngle) * Math.PI) / 36;
      towerGroup.add(leg);
    }

    // Top Transmitter Platform
    const topPlatGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 16);
    const topPlat = new THREE.Mesh(topPlatGeo, chromeMat);
    topPlat.position.y = 7.5;
    towerGroup.add(topPlat);

    // Red LED Beacon Tip
    const beaconGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 8.2;
    towerGroup.add(beacon);

    // 7. Dynamic Antenna Topology Heads (Dipole, Dish, Yagi)
    const dipoleHead = new THREE.Group();
    const dipoleMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.9, roughness: 0.2 });
    const dipTop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 16), dipoleMat);
    dipTop.position.y = 8.6;
    const dipBot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 16), dipoleMat);
    dipBot.position.y = 6.4;
    const feedGap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    feedGap.position.y = 7.5;
    dipoleHead.add(dipTop, dipBot, feedGap);
    towerGroup.add(dipoleHead);

    // Parabolic Satellite Dish Head
    const dishHead = new THREE.Group();
    dishHead.position.y = 7.5;

    // Paraboloid dish mesh using lathe
    const dishPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const r = t * 2.2;
      const y = 0.35 * r * r;
      dishPoints.push(new THREE.Vector2(r, y));
    }
    const dishGeo = new THREE.LatheGeometry(dishPoints, 32);
    const dishMeshMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide, metalness: 0.7, roughness: 0.3 });
    const dishMesh = new THREE.Mesh(dishGeo, dishMeshMat);
    dishMesh.rotation.x = -Math.PI / 2;
    dishHead.add(dishMesh);

    // Feed horn arm & tip
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const arm = new THREE.Mesh(armGeo, mastMat);
    arm.position.set(0, 0, 0.9);
    arm.rotation.x = Math.PI / 2;
    const feedTip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 16), new THREE.MeshBasicMaterial({ color: 0xffb703 }));
    feedTip.position.set(0, 0, 1.7);
    feedTip.rotation.x = -Math.PI / 2;
    dishHead.add(arm, feedTip);
    towerGroup.add(dishHead);

    // Yagi-Uda Array Head
    const yagiHead = new THREE.Group();
    yagiHead.position.y = 7.5;
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), mastMat);
    boom.rotation.x = Math.PI / 2;
    yagiHead.add(boom);

    // Reflector + Directors
    const elementsData = [
      { z: -1.2, h: 2.2, color: 0x94a3b8 }, // Reflector
      { z: -0.5, h: 2.0, color: 0x00f0ff }, // Driven Dipole
      { z: 0.2, h: 1.7, color: 0xffb703 },  // Director 1
      { z: 0.8, h: 1.6, color: 0xffb703 },  // Director 2
      { z: 1.4, h: 1.5, color: 0xffb703 },  // Director 3
    ];
    elementsData.forEach(el => {
      const elem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, el.h, 8), new THREE.MeshStandardMaterial({ color: el.color, metalness: 0.8 }));
      elem.position.z = el.z;
      yagiHead.add(elem);
    });
    towerGroup.add(yagiHead);

    // 8. Concentric Spherical Expanding Waves Pool
    const NUM_WAVES = 8;
    const waveSpheres: THREE.Mesh[] = [];
    const waveMaterials: THREE.MeshBasicMaterial[] = [];

    const waveGroup = new THREE.Group();
    waveGroup.position.y = 7.5; // Origin at transmitter feed tip
    scene.add(waveGroup);

    for (let i = 0; i < NUM_WAVES; i++) {
      const waveGeo = new THREE.SphereGeometry(1, 32, 24);
      const waveMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveGroup.add(waveMesh);
      waveSpheres.push(waveMesh);
      waveMaterials.push(waveMat);
    }

    // 9. 3D Radiation Pattern Mesh Visualization (Dynamic Geometry)
    const patternGroup = new THREE.Group();
    patternGroup.position.y = 7.5;
    scene.add(patternGroup);

    // Omni Torus Donut Mesh
    const torusGeo = new THREE.TorusGeometry(4.5, 1.8, 32, 64);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.5,
      wireframe: false,
      emissive: 0x005577,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 2;
    patternGroup.add(torusMesh);

    // Directional Beam Cone/Lobe Mesh (For Satellite Dish)
    const beamGeo = new THREE.ConeGeometry(3.5, 12, 32, 1, true);
    beamGeo.translate(0, 6, 0); // Origin at tip
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      emissive: 0x774400,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.x = Math.PI / 2; // Pointing +Z
    patternGroup.add(beamMesh);

    // Yagi Lobe Mesh
    const yagiGeo = new THREE.ConeGeometry(2.8, 10, 32, 1, true);
    yagiGeo.translate(0, 5, 0);
    const yagiMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      emissive: 0x006644,
      side: THREE.DoubleSide,
    });
    const yagiMesh = new THREE.Mesh(yagiGeo, yagiMat);
    yagiMesh.rotation.x = Math.PI / 2;
    patternGroup.add(yagiMesh);

    // 10. 3D Interactive Receiver Sensor Probe Marker
    const probeGroup = new THREE.Group();
    scene.add(probeGroup);

    const probeSphereMat = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0x990033, roughness: 0.2, metalness: 0.8 });
    const probeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), probeSphereMat);
    probeGroup.add(probeSphere);

    // Ring around probe sensor
    const probeRingMat = new THREE.MeshBasicMaterial({ color: 0xff0055, side: THREE.DoubleSide });
    const probeRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.75, 32), probeRingMat);
    probeRing.rotation.x = Math.PI / 2;
    probeGroup.add(probeRing);

    // Dashed line from tower to probe
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 7.5, 0),
      new THREE.Vector3(0, 7.5, probeDistance),
    ]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0xff0055, dashSize: 0.4, gapSize: 0.2 });
    const probeLine = new THREE.Line(lineGeo, lineMat);
    probeLine.computeLineDistances();
    scene.add(probeLine);

    // 11. Animation Loop & Dynamic Updates
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const { frequency: currentFreq, power: currentPower, antennaType: currentType, probeDistance: currentDist, activeFaults: currentFaults } = animStateRef.current;

      const faultActive = currentFaults.length > 0;
      const pMult = faultActive ? 0.5 : 1.0;
      const effPower = currentPower * pMult;

      // Pulse red LED beacon
      beaconMat.color.setHSL(0.98, 1, 0.4 + 0.3 * Math.sin(elapsedTime * 6));
      beaconLight.intensity = 2 + 1.5 * Math.sin(elapsedTime * 6);

      // Toggle antenna heads visibility
      dipoleHead.visible = currentType === 0;
      dishHead.visible = currentType === 1;
      yagiHead.visible = currentType === 2;

      // Toggle radiation pattern mesh visibility & scale
      torusMesh.visible = currentType === 0;
      beamMesh.visible = currentType === 1;
      yagiMesh.visible = currentType === 2;

      const powerScale = Math.sqrt(effPower);

      if (currentType === 0) {
        torusMesh.scale.set(powerScale, powerScale, powerScale);
        torusMesh.rotation.z = elapsedTime * 0.2;
      } else if (currentType === 1) {
        beamMesh.scale.set(powerScale, powerScale, powerScale);
      } else if (currentType === 2) {
        yagiMesh.scale.set(powerScale, powerScale, powerScale);
      }

      // Update Concentric Spherical Waves Animation
      const maxWaveRadius = 22 * powerScale;
      const waveSpeed = (2.5 + currentFreq * 1.5) * (faultActive ? 0.6 : 1.0);

      waveSpheres.forEach((sphere, idx) => {
        const offset = (idx / NUM_WAVES) * maxWaveRadius;
        const currentRadius = ((elapsedTime * waveSpeed + offset) % maxWaveRadius) + 0.2;

        sphere.scale.set(currentRadius, currentRadius, currentRadius);

        // Opacity decay with distance
        const progress = currentRadius / maxWaveRadius;
        const opacity = Math.max(0, (1 - progress) * (faultActive ? 0.3 : 0.6));
        waveMaterials[idx].opacity = opacity;

        // Color shift based on frequency and power
        if (currentType === 0) {
          waveMaterials[idx].color.setHSL(0.52 - progress * 0.1, 1, 0.5);
        } else if (currentType === 1) {
          waveMaterials[idx].color.setHSL(0.11 - progress * 0.05, 1, 0.5);
        } else {
          waveMaterials[idx].color.setHSL(0.42 - progress * 0.1, 1, 0.5);
        }
      });

      // Update Probe position & dashed line
      const probeY = 7.5;
      const probeZ = currentDist;
      probeGroup.position.set(0, probeY, probeZ);
      probeGroup.rotation.y = elapsedTime * 1.5;

      const linePositions = probeLine.geometry.attributes.position as THREE.BufferAttribute;
      linePositions.setXYZ(0, 0, 7.5, 0);
      linePositions.setXYZ(1, 0, probeY, probeZ);
      linePositions.needsUpdate = true;
      probeLine.computeLineDistances();

      // Slow idle rotation of tower base disc for visual flair
      ring.rotation.z = elapsedTime * 0.3;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 bg-slate-950 border-slate-800">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Floating Telemetry Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col space-y-2 z-10">
        <div className="px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-xs shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>{gainNames[antennaType]}</span>
          </div>
          <p className="text-slate-300 font-mono text-[11px]">
            Freq: <span className="text-cyan-300 font-bold">{frequency.toFixed(1)} GHz</span> | Pt: <span className="text-amber-400 font-bold">{(effectivePower).toFixed(1)} W</span>
          </p>
        </div>

        {hasFault && (
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Feeder Fault Active (-50% RF Power)</span>
          </div>
        )}
      </div>

      {/* Top Right Controls & Camera Reset */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <button
          onClick={() => {
            if (onParameterChange) {
              onParameterChange('antennaType', (antennaType + 1) % 3);
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-md"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Switch Antenna (Mode {antennaType})</span>
        </button>
      </div>

      {/* Bottom Floating Real-Time Field Probe HUD */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none grid grid-cols-2 sm:grid-cols-4 gap-2 z-10">
        
        <div className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400 inline mr-1" /> Peak E-Field
          </span>
          <span className="text-base font-extrabold font-mono text-amber-300">{eField} <span className="text-xs font-normal text-slate-400">V/m</span></span>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
            <Activity className="w-3 h-3 text-cyan-400 inline mr-1" /> Power Density (S)
          </span>
          <span className="text-base font-extrabold font-mono text-cyan-300">{powerDensity} <span className="text-xs font-normal text-slate-400">mW/m²</span></span>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
            <Radio className="w-3 h-3 text-emerald-400 inline mr-1" /> Antenna Gain
          </span>
          <span className="text-base font-extrabold font-mono text-emerald-300">{gain} <span className="text-xs font-normal text-slate-400">({[2.15, 14.5, 10.2][antennaType]} dBi)</span></span>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
            <Eye className="w-3 h-3 text-purple-400 inline mr-1" /> Wavelength (λ)
          </span>
          <span className="text-base font-extrabold font-mono text-purple-300">{wavelength} <span className="text-xs font-normal text-slate-400">cm</span></span>
        </div>

      </div>

      {/* Bottom Center Interaction Hint */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[10px] font-mono text-slate-400 hidden sm:block">
        💡 Drag to rotate 3D view • Scroll to zoom • Right-drag to pan
      </div>

    </div>
  );
};
