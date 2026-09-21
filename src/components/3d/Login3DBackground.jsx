import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Procedural 3D Coffee Bean with center cleft
function CoffeeBean({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.4, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3 * speed;
      meshRef.current.rotation.y += delta * 0.4 * speed;
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
      // Indent crease along the bean center
      if (Math.abs(x) < 0.22) {
        pos.setZ(i, z - 0.28 * (1 - Math.abs(x) * 3.8));
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <Float speed={1.5 * speed} rotationIntensity={1} floatIntensity={1.2}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        geometry={geometry}
      >
        <meshStandardMaterial
          color="#3A2016"
          roughness={0.35}
          metalness={0.12}
        />
      </mesh>
    </Float>
  );
}

// 3D Steaming Latte Cup in the background
function CoffeeCupModel() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      groupRef.current.position.y = -1.1 + Math.sin(t * 0.8) * 0.05;
    }
  });

  const cupGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.9, 0),
      new THREE.Vector2(1.05, 0.1),
      new THREE.Vector2(1.35, 0.6),
      new THREE.Vector2(1.5, 1.4),
      new THREE.Vector2(1.48, 1.5),
      new THREE.Vector2(1.35, 1.45),
      new THREE.Vector2(1.3, 0.8),
      new THREE.Vector2(0.85, 0.35),
      new THREE.Vector2(0, 0.35)
    ];
    return new THREE.LatheGeometry(points, 48);
  }, []);

  const saucerGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0, -0.15),
      new THREE.Vector2(1.8, -0.15),
      new THREE.Vector2(2.1, -0.05),
      new THREE.Vector2(2.15, 0.05),
      new THREE.Vector2(1.9, -0.05),
      new THREE.Vector2(1.1, -0.1),
      new THREE.Vector2(0, -0.1)
    ];
    return new THREE.LatheGeometry(points, 48);
  }, []);

  return (
    <group ref={groupRef} position={[0, -1.1, -2]} scale={1.15}>
      {/* Ceramic Saucer */}
      <mesh geometry={saucerGeo}>
        <meshPhysicalMaterial color="#F7F3EE" roughness={0.15} clearcoat={0.9} />
      </mesh>

      {/* Ceramic Cup */}
      <mesh geometry={cupGeo}>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.12} clearcoat={1.0} />
      </mesh>

      {/* Rich Golden Espresso surface */}
      <mesh position={[0, 1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.34, 48]} />
        <meshStandardMaterial color="#2B1810" roughness={0.2} />
      </mesh>

      {/* Latte Art Heart Ring */}
      <mesh position={[0, 1.282, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.9, 36]} />
        <meshStandardMaterial color="#E8BE78" roughness={0.4} opacity={0.88} transparent />
      </mesh>

      {/* Aromatic Steam Sparkles */}
      <Sparkles
        count={28}
        scale={[1.5, 2.8, 1.5]}
        position={[0, 2.2, 0]}
        size={4}
        speed={0.5}
        color="#C8963E"
      />
    </group>
  );
}

// Scene with lighting and scattered beans
function Scene() {
  const beans = useMemo(() => [
    { pos: [-3.2, 1.8, -1.5], rot: [0.3, 0.5, 0.2], scale: 0.45, speed: 0.8 },
    { pos: [3.4, 2.1, -1.2], rot: [0.8, -0.4, 0.6], scale: 0.48, speed: 0.9 },
    { pos: [-3.8, -1.5, -1], rot: [-0.4, 0.9, 0.1], scale: 0.52, speed: 1.1 },
    { pos: [3.6, -1.6, -1.4], rot: [0.2, -0.6, 0.9], scale: 0.42, speed: 0.85 },
    { pos: [-2.1, 2.8, -2], rot: [0.5, 0.2, -0.4], scale: 0.35, speed: 0.7 },
    { pos: [2.2, 2.9, -2], rot: [-0.3, 0.7, 0.3], scale: 0.38, speed: 1.0 },
    { pos: [-1.2, -2.5, -1.8], rot: [0.4, -0.2, 0.5], scale: 0.32, speed: 0.9 },
    { pos: [1.4, -2.6, -1.6], rot: [-0.6, 0.4, -0.2], scale: 0.34, speed: 1.15 }
  ], []);

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 4]} intensity={1.5} color="#FFF5EA" />
      <pointLight position={[-4, 3, 2]} intensity={0.8} color="#C8963E" />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#E5C170" />

      <CoffeeCupModel />

      {beans.map((b, i) => (
        <CoffeeBean
          key={i}
          position={b.pos}
          rotation={b.rot}
          scale={b.scale}
          speed={b.speed}
        />
      ))}
    </>
  );
}

export default function Login3DBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 bg-[#FAF6F0]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#C8963E]/15 via-[#2C1A14]/5 to-transparent rounded-full blur-[100px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1B3022]/10 rounded-full blur-[90px]" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C8963E]/15 rounded-full blur-[90px]" />

      {/* 3D Canvas */}
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          className="w-full h-full"
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
