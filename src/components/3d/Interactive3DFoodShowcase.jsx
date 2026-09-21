import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. 3D Animated Exploding & Assembling Chicken Burger
function AssemblingBurger3D() {
  const groupRef = useRef();
  const topBunRef = useRef();
  const cheeseRef = useRef();
  const pattyRef = useRef();
  const tomatoRef = useRef();
  const lettuceRef = useRef();
  const bottomBunRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.35;
    }

    // Smooth assembling & opening pulse
    const cycle = (Math.sin(t * 1.4) + 1) / 2; // 0 to 1
    const expand = cycle * 0.42;

    if (topBunRef.current) {
      topBunRef.current.position.y = 0.95 + expand * 1.5;
      topBunRef.current.rotation.z = Math.sin(t * 1.4) * 0.06;
    }
    if (cheeseRef.current) {
      cheeseRef.current.position.y = 0.62 + expand * 0.95;
    }
    if (pattyRef.current) {
      pattyRef.current.position.y = 0.38 + expand * 0.55;
    }
    if (tomatoRef.current) {
      tomatoRef.current.position.y = 0.12 + expand * 0.22;
    }
    if (lettuceRef.current) {
      lettuceRef.current.position.y = -0.06 - expand * 0.12;
    }
    if (bottomBunRef.current) {
      bottomBunRef.current.position.y = -0.32 - expand * 0.45;
    }
  });

  const sesamePositions = useMemo(() => [
    [-0.5, 1.3, 0.4], [0.4, 1.35, 0.3], [-0.1, 1.42, 0.5],
    [0.6, 1.25, -0.3], [-0.6, 1.28, -0.2], [0.1, 1.45, -0.4],
    [-0.3, 1.38, -0.5], [0.3, 1.36, 0.6], [0, 1.48, 0]
  ], []);

  return (
    <group ref={groupRef} position={[0, -0.25, 0]} scale={1.25}>
      {/* 1. Top Golden Brioche Bun */}
      <group ref={topBunRef} position={[0, 0.95, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color="#D48B46" roughness={0.35} metalness={0.08} />
        </mesh>
        {/* Golden toasted gloss */}
        <mesh position={[0, 0.2, 0]} scale={1.01}>
          <sphereGeometry args={[1.18, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#B5651D" roughness={0.4} />
        </mesh>
        {/* Toasted Sesame Seeds */}
        {sesamePositions.map((pos, i) => (
          <mesh key={i} position={pos} scale={0.045} rotation={[0.2, i * 0.5, 0.1]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#FFF9EE" roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* 2. Dripping Melted Cheddar Cheese */}
      <group ref={cheeseRef} position={[0, 0.62, 0]}>
        <mesh rotation={[0.08, 0.45, 0]} castShadow>
          <boxGeometry args={[2.1, 0.07, 2.1]} />
          <meshStandardMaterial color="#FFB300" roughness={0.25} />
        </mesh>
        {/* Dripping corners */}
        <mesh position={[0.9, -0.15, 0.9]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#FFA000" roughness={0.2} />
        </mesh>
        <mesh position={[-0.8, -0.12, 0.8]} rotation={[-0.2, 0, 0.3]}>
          <cylinderGeometry args={[0.07, 0.02, 0.25, 8]} />
          <meshStandardMaterial color="#FFA000" roughness={0.2} />
        </mesh>
      </group>

      {/* 3. Crispy Golden Chicken Patty */}
      <group ref={pattyRef} position={[0, 0.38, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 32]} />
          <meshStandardMaterial color="#8D4925" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Crispy panko breadcrumb texture ring */}
        <mesh scale={[1.22, 0.32, 1.22]}>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          <meshStandardMaterial color="#6E3213" roughness={0.85} />
        </mesh>
      </group>

      {/* 4. Ripe Red Tomato Slice */}
      <group ref={tomatoRef} position={[0, 0.12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.15, 1.15, 0.11, 32]} />
          <meshStandardMaterial color="#E53935" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Inner tomato flesh & seeds */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 1.05, 16]} />
          <meshStandardMaterial color="#C62828" roughness={0.3} />
        </mesh>
      </group>

      {/* 5. Crisp Green Garden Lettuce */}
      <group ref={lettuceRef} position={[0, -0.06, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.28, 1.25, 0.09, 32]} />
          <meshStandardMaterial color="#4CAF50" roughness={0.5} />
        </mesh>
        {/* Ruffled leaf edge */}
        <mesh scale={[1.32, 0.07, 1.32]} rotation={[0.05, 0.2, 0]}>
          <cylinderGeometry args={[1, 1, 1, 24]} />
          <meshStandardMaterial color="#66BB6A" roughness={0.6} />
        </mesh>
      </group>

      {/* 6. Bottom Toasted Brioche Bun */}
      <group ref={bottomBunRef} position={[0, -0.32, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.18, 1.15, 0.38, 32]} />
          <meshStandardMaterial color="#D48B46" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.2, 0]} scale={[1.14, 0.15, 1.14]}>
          <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
          <meshStandardMaterial color="#B5651D" roughness={0.45} />
        </mesh>
      </group>

      <Sparkles count={30} scale={2.8} size={3.5} speed={0.5} color="#FFB300" />
    </group>
  );
}

// 2. 3D Fresh Brewing Artisan Coffee / Tea with Orbiting Beans
function BrewingCoffee3D() {
  const groupRef = useRef();
  const liquidRef = useRef();
  const steamRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }
    if (liquidRef.current) {
      liquidRef.current.rotation.z = t * 0.5;
    }
    if (steamRef.current) {
      steamRef.current.position.y = 1.4 + Math.sin(t * 1.5) * 0.08;
    }
  });

  const cupPoints = useMemo(() => [
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
  ], []);

  const saucerPoints = useMemo(() => [
    new THREE.Vector2(0, -0.15),
    new THREE.Vector2(1.85, -0.15),
    new THREE.Vector2(2.15, -0.05),
    new THREE.Vector2(2.2, 0.05),
    new THREE.Vector2(1.95, -0.05),
    new THREE.Vector2(1.15, -0.1),
    new THREE.Vector2(0, -0.1)
  ], []);

  const beansOrbit = useMemo(() => [
    { radius: 2.1, angle: 0, speed: 0.8, y: 0.4 },
    { radius: 2.3, angle: 2, speed: 0.7, y: -0.1 },
    { radius: 2.0, angle: 4, speed: 0.9, y: 0.8 }
  ], []);

  return (
    <group ref={groupRef} position={[0, -0.45, 0]} scale={1.2}>
      {/* Ceramic Saucer */}
      <mesh>
        <latheGeometry args={[saucerPoints, 48]} />
        <meshPhysicalMaterial color="#F7F3EE" roughness={0.12} clearcoat={1.0} reflectivity={0.8} />
      </mesh>

      {/* Ceramic Mug */}
      <mesh castShadow>
        <latheGeometry args={[cupPoints, 48]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} />
      </mesh>

      {/* Handle */}
      <mesh position={[1.45, 0.85, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[0.55, 0.12, 16, 32, Math.PI * 1.1]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} />
      </mesh>

      {/* Swirling Fresh Espresso / Tea Liquid */}
      <group position={[0, 1.28, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.34, 48]} />
          <meshStandardMaterial color="#2C1608" roughness={0.15} />
        </mesh>
        {/* Golden Crema Latte Art Swirl */}
        <mesh ref={liquidRef} position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.95, 36]} />
          <meshStandardMaterial color="#C8963E" roughness={0.35} opacity={0.92} transparent />
        </mesh>
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial color="#FFF5E6" roughness={0.4} />
        </mesh>
      </group>

      {/* Aromatic Steaming Vapor Sparkles */}
      <group ref={steamRef} position={[0, 1.4, 0]}>
        <Sparkles
          count={35}
          scale={[1.4, 2.5, 1.4]}
          size={4}
          speed={0.6}
          color="#E5C170"
        />
      </group>

      {/* Orbiting Roasted Coffee Beans */}
      {beansOrbit.map((b, i) => (
        <Float key={i} speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh
            position={[
              Math.cos(b.angle) * b.radius,
              b.y,
              Math.sin(b.angle) * b.radius
            ]}
            scale={0.35}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#3E2723" roughness={0.3} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function Interactive3DFoodShowcase({ activeModel = 'BURGER', onToggleModel }) {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] flex flex-col items-center justify-center select-none">
      {/* Switcher Pills: Coffee vs Burger */}
      <div className="absolute top-3 z-20 flex items-center bg-[#2C1A14]/85 backdrop-blur-md p-1 rounded-full border border-[#C8963E]/40 shadow-lg">
        <button
          type="button"
          onClick={() => onToggleModel('BURGER')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeModel === 'BURGER'
              ? 'bg-[#C8963E] text-[#1F120C] shadow-md font-extrabold'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <span>🍔</span>
          <span>3D Gourmet Burger</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleModel('COFFEE')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeModel === 'COFFEE'
              ? 'bg-[#C8963E] text-[#1F120C] shadow-md font-extrabold'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <span>☕</span>
          <span>3D Artisan Brew</span>
        </button>
      </div>

      {/* 3D Canvas */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center text-xs font-serif text-[#6D4C41]">
          Brewing 3D Experience...
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0.5, 4.2], fov: 46 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 6, 4]} intensity={1.6} color="#FFF8F0" castShadow />
          <pointLight position={[-4, 2, 2]} intensity={0.9} color="#C8963E" />
          <pointLight position={[0, -2, 2]} intensity={0.5} color="#E5C170" />

          {activeModel === 'BURGER' ? <AssemblingBurger3D /> : <BrewingCoffee3D />}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 2.6}
            rotateSpeed={0.6}
          />
        </Canvas>
      </Suspense>

      {/* Subtle Hint */}
      <div className="absolute bottom-2 text-[10px] text-stone-500 font-mono tracking-wider flex items-center space-x-1">
        <span>✦</span>
        <span>DRAG TO ROTATE IN 3D</span>
        <span>✦</span>
      </div>
    </div>
  );
}
