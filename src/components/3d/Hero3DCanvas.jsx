import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function CoffeeBean({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.35 }) {
  const beanRef = useRef();

  useFrame((state, delta) => {
    if (beanRef.current) {
      beanRef.current.rotation.x += delta * 0.2;
      beanRef.current.rotation.y += delta * 0.3;
    }
  });

  const shape = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 32, 32);
    geo.scale(1, 1.4, 0.65);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      if (Math.abs(x) < 0.2) {
        pos.setZ(i, z - 0.25 * (1 - Math.abs(x) * 4));
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      ref={beanRef}
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={shape}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#3E2723"
        roughness={0.3}
        metalness={0.15}
      />
    </mesh>
  );
}

function SteamParticles() {
  const pointsRef = useRef();
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group position={[0, 0.9, 0]}>
      <Sparkles
        count={35}
        scale={[1.2, 2.5, 1.2]}
        size={4}
        speed={0.4}
        opacity={0.6}
        color="#C8963E"
      />
    </group>
  );
}

// 3D Ceramic Coffee Cup Model (Centered inside right container)
function CeramicCup({ mousePosition }) {
  const groupRef = useRef();
  const cupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetX = (mousePosition.current.y * 0.12);
      const targetY = (mousePosition.current.x * 0.15);
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY + state.clock.getElapsedTime() * 0.1, 0.05);
    }
  });

  const cupGeometry = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.8, 0));
    points.push(new THREE.Vector2(0.9, 0.1));
    points.push(new THREE.Vector2(1.2, 0.4));
    points.push(new THREE.Vector2(1.4, 1.2));
    points.push(new THREE.Vector2(1.45, 1.6));
    points.push(new THREE.Vector2(1.4, 1.65));
    points.push(new THREE.Vector2(1.3, 1.6));
    points.push(new THREE.Vector2(1.25, 0.8));
    points.push(new THREE.Vector2(0.7, 0.4));
    points.push(new THREE.Vector2(0, 0.4));
    return new THREE.LatheGeometry(points, 64);
  }, []);

  const handleGeometry = useMemo(() => {
    return new THREE.TorusGeometry(0.55, 0.12, 16, 32, Math.PI * 1.1);
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.4, 0]} scale={0.9}>
      <mesh
        ref={cupRef}
        geometry={cupGeometry}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#F9F6F0"
          roughness={0.12}
          metalness={0.03}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
        />
      </mesh>

      <mesh
        geometry={handleGeometry}
        position={[1.4, 0.85, 0]}
        rotation={[0, 0, -Math.PI / 4]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#F9F6F0"
          roughness={0.12}
          metalness={0.03}
          clearcoat={1.0}
        />
      </mesh>

      <mesh position={[0, 1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.32, 64]} />
        <meshStandardMaterial
          color="#3E2723"
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[0, 1.251, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.3, 64]} />
        <meshStandardMaterial
          color="#C8963E"
          roughness={0.4}
          metalness={0.1}
          opacity={0.92}
          transparent
        />
      </mesh>

      <mesh position={[0, 1.252, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.68, 32]} />
        <meshStandardMaterial
          color="#E5C170"
          roughness={0.5}
          opacity={0.95}
          transparent
        />
      </mesh>

      <SteamParticles />

      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 1.8, 0.15, 64]} />
        <meshPhysicalMaterial
          color="#EFE6D8"
          roughness={0.18}
          metalness={0.05}
          clearcoat={0.9}
        />
      </mesh>
    </group>
  );
}

export default function Hero3DCanvas() {
  const mousePosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mousePosition.current = {
      x: (e.clientX / innerWidth) * 2 - 1,
      y: -(e.clientY / innerHeight) * 2 + 1,
    };
  };

  return (
    <div 
      className="w-full h-full min-h-[420px] relative pointer-events-auto cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 1.2, 4.2], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <spotLight
          position={[6, 10, 6]}
          angle={0.4}
          penumbra={0.8}
          intensity={3.5}
          color="#FFFFFF"
          castShadow
          shadow-mapSize={1024}
        />
        <directionalLight
          position={[-6, 6, -3]}
          intensity={2.0}
          color="#FFF5E6"
        />
        <pointLight position={[2, -1, 2]} intensity={1.2} color="#C8963E" />

        <CeramicCup mousePosition={mousePosition} />

        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.2}>
          <CoffeeBean position={[-1.8, 0.9, 0.2]} rotation={[0.4, 0.8, 0.2]} scale={0.25} />
        </Float>
        <Float speed={2.5} rotationIntensity={2} floatIntensity={1.5}>
          <CoffeeBean position={[1.8, 1.1, 0.2]} rotation={[0.8, 0.2, 0.6]} scale={0.28} />
        </Float>
        <Float speed={1.8} rotationIntensity={1} floatIntensity={0.8}>
          <CoffeeBean position={[-1.6, -0.6, 0.8]} rotation={[0.2, 1.1, 0.4]} scale={0.22} />
        </Float>
        <Float speed={2.2} rotationIntensity={1.8} floatIntensity={1.1}>
          <CoffeeBean position={[1.7, -0.5, 0.6]} rotation={[0.9, 0.5, 0.1]} scale={0.24} />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
