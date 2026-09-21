import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Realistic Roasted Coffee Bean
function LuxuryCoffeeBean({ position, rotation, scale = 0.4, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25 * speed;
      meshRef.current.rotation.y += delta * 0.35 * speed;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 32, 32);
    geo.scale(1, 1.45, 0.65);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      // Realistic curved cleft crease along the center of the coffee bean
      if (Math.abs(x) < 0.22) {
        pos.setZ(i, z - 0.28 * (1 - Math.abs(x) * 3.8));
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <Float speed={1.8 * speed} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        geometry={geometry}
      >
        <meshStandardMaterial
          color="#341C13"
          roughness={0.28}
          metalness={0.18}
          bumpScale={0.05}
        />
      </mesh>
    </Float>
  );
}

// 3D Steaming Artisan Coffee Cup floating in the ambient background
function AmbientCoffeeCup() {
  const cupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (cupRef.current) {
      cupRef.current.rotation.y = Math.sin(t * 0.25) * 0.2;
      cupRef.current.position.y = -1.2 + Math.sin(t * 0.7) * 0.08;
    }
  });

  const cupGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.1, 0),
      new THREE.Vector2(1.3, 0.15),
      new THREE.Vector2(1.7, 0.8),
      new THREE.Vector2(1.9, 1.8),
      new THREE.Vector2(1.85, 1.9),
      new THREE.Vector2(1.68, 1.8),
      new THREE.Vector2(1.6, 0.9),
      new THREE.Vector2(1.05, 0.4),
      new THREE.Vector2(0, 0.4)
    ];
    return new THREE.LatheGeometry(points, 64);
  }, []);

  const saucerGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0, -0.2),
      new THREE.Vector2(2.4, -0.2),
      new THREE.Vector2(2.8, -0.08),
      new THREE.Vector2(2.85, 0.05),
      new THREE.Vector2(2.5, -0.06),
      new THREE.Vector2(1.4, -0.15),
      new THREE.Vector2(0, -0.15)
    ];
    return new THREE.LatheGeometry(points, 64);
  }, []);

  return (
    <group ref={cupRef} position={[0, -1.2, -1.5]} scale={1.05}>
      {/* Porcelain Saucer */}
      <mesh geometry={saucerGeo}>
        <meshPhysicalMaterial color="#F7F3ED" roughness={0.12} clearcoat={1.0} reflectivity={0.85} />
      </mesh>

      {/* Porcelain Cup */}
      <mesh geometry={cupGeo}>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} reflectivity={0.9} />
      </mesh>

      {/* Dark Roast Espresso Surface */}
      <mesh position={[0, 1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 64]} />
        <meshStandardMaterial color="#24140C" roughness={0.15} />
      </mesh>

      {/* Golden Crema Latte Art Swirl */}
      <mesh position={[0, 1.623, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 1.25, 48]} />
        <meshStandardMaterial color="#C8963E" roughness={0.35} opacity={0.88} transparent />
      </mesh>

      {/* Rising Steam Glow */}
      <Sparkles
        count={45}
        scale={[1.8, 3.2, 1.8]}
        position={[0, 2.8, 0]}
        size={4}
        speed={0.5}
        color="#E5C170"
      />
    </group>
  );
}

// Cinematic Camera with Continuous Auto-Zooming Breathing Effect
function AutoZoomCamera() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smooth hypnotic auto-zoom cycle: camera smoothly zooms in close and gently recedes
    const zoomCycle = Math.sin(t * 0.35); // Slow breathing rhythm
    state.camera.position.z = 4.8 + zoomCycle * 0.95; // Zooms between 3.85 and 5.75
    state.camera.position.x = Math.sin(t * 0.2) * 0.45;
    state.camera.position.y = Math.cos(t * 0.28) * 0.3;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene() {
  // Scatter 30 roasted beans in 3D depth space to create maximum depth during zoom
  const beans = useMemo(() => {
    const arr = [];
    const seedPositions = [
      // Foreground beans that sweep past during auto-zoom
      { pos: [-2.6, 1.6, 1.2], scale: 0.52, speed: 0.9 },
      { pos: [2.7, 1.8, 1.0], scale: 0.48, speed: 1.1 },
      { pos: [-2.9, -1.4, 0.8], scale: 0.55, speed: 0.85 },
      { pos: [2.8, -1.5, 1.1], scale: 0.5, speed: 1.0 },

      // Midground floating beans around the perimeter
      { pos: [-3.8, 2.4, -0.8], scale: 0.42, speed: 0.75 },
      { pos: [3.9, 2.2, -0.6], scale: 0.44, speed: 0.95 },
      { pos: [-4.2, -0.4, -1.2], scale: 0.38, speed: 0.8 },
      { pos: [4.1, -0.6, -1.0], scale: 0.4, speed: 1.05 },
      { pos: [0, 3.1, -1.4], scale: 0.46, speed: 0.7 },
      { pos: [-1.8, 2.8, -1.8], scale: 0.36, speed: 0.9 },
      { pos: [1.9, 2.9, -1.6], scale: 0.38, speed: 1.15 },

      // Background atmospheric beans
      { pos: [-4.5, -2.5, -2.5], scale: 0.32, speed: 0.65 },
      { pos: [4.6, -2.4, -2.8], scale: 0.34, speed: 0.85 },
      { pos: [-2.2, -2.8, -2.2], scale: 0.3, speed: 0.7 },
      { pos: [2.3, -2.9, -2.4], scale: 0.33, speed: 0.9 },
      { pos: [-1.1, 3.4, -3.0], scale: 0.28, speed: 0.6 },
      { pos: [1.2, 3.5, -2.8], scale: 0.29, speed: 0.8 }
    ];

    seedPositions.forEach((b, i) => {
      arr.push({
        ...b,
        rot: [
          (i * 0.7) % Math.PI,
          (i * 1.1) % Math.PI,
          (i * 0.5) % Math.PI
        ]
      });
    });
    return arr;
  }, []);

  return (
    <>
      <AutoZoomCamera />

      {/* Atmospheric warm cafe lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 9, 5]} intensity={1.8} color="#FFF6ED" />
      <pointLight position={[-5, 4, 3]} intensity={1.2} color="#C8963E" />
      <pointLight position={[5, -3, 3]} intensity={0.8} color="#E5C170" />
      <pointLight position={[0, 5, -2]} intensity={0.6} color="#FFE0B2" />

      {/* 3D Steaming Cup in the Center Depth */}
      <AmbientCoffeeCup />

      {/* Floating 3D Roasted Coffee Beans */}
      {beans.map((b, i) => (
        <LuxuryCoffeeBean
          key={i}
          position={b.pos}
          rotation={b.rot}
          scale={b.scale}
          speed={b.speed}
        />
      ))}

      {/* Golden Warm Dust / Roasted Aroma Sparkles */}
      <Sparkles
        count={70}
        scale={[12, 10, 8]}
        size={3}
        speed={0.4}
        color="#C8963E"
        opacity={0.65}
      />
    </>
  );
}

export default function PremiumCafe3DBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* Deep Cafe Ambience Gradient (Espresso Vignette + Warm Caramel Glow) */}
      <div className="absolute inset-0 bg-radial from-[#FAF6F0] via-[#F3ECE0] to-[#E5D8C5]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-radial from-[#C8963E]/20 via-[#2C1A14]/8 to-transparent rounded-full blur-[110px]" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#1B3022]/12 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-[#C8963E]/22 rounded-full blur-[130px]" />

      {/* Three.js Auto-Zooming 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        className="w-full h-full"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>

      {/* Subtle cinematic vignette around the screen borders */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#2C1A14]/15 pointer-events-none" />
    </div>
  );
}
