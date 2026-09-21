import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. 3D Coffee Cup Model
function CoffeeCup3D() {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
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
    <group ref={groupRef} position={[0, -0.6, 0]} scale={1.1}>
      <mesh geometry={cupGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} reflectivity={0.9} />
      </mesh>
      <mesh geometry={handleGeometry} position={[1.4, 0.85, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1.0} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.32, 64]} />
        <meshStandardMaterial color="#3E2723" roughness={0.15} />
      </mesh>
      <mesh position={[0, 1.251, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.3, 64]} />
        <meshStandardMaterial color="#C8963E" roughness={0.4} opacity={0.9} transparent />
      </mesh>
      <Sparkles count={30} scale={2} size={4} speed={0.4} color="#C8963E" />
    </group>
  );
}

// 2. 3D Gourmet Burger Model
function Burger3D() {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]} scale={1.1}>
      {/* Top Bun */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[1.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color="#D4A373" roughness={0.4} />
      </mesh>

      {/* Sesame Seeds */}
      {[...Array(12)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.6) * 0.8,
            1.55 + (i % 2) * 0.05,
            Math.cos(i * 0.6) * 0.8
          ]}
          rotation={[0.2, i * 0.5, 0.2]}
          scale={0.06}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#FFF8EE" />
        </mesh>
      ))}

      {/* Melted Cheese Layer */}
      <mesh position={[0, 0.75, 0]} rotation={[0.05, 0.4, 0]} castShadow>
        <boxGeometry args={[2.3, 0.08, 2.3]} />
        <meshStandardMaterial color="#FBC02D" roughness={0.3} />
      </mesh>

      {/* Grilled Patty */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.4, 32]} />
        <meshStandardMaterial color="#3E2723" roughness={0.6} />
      </mesh>

      {/* Tomato Slice */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.12, 32]} />
        <meshStandardMaterial color="#D32F2F" roughness={0.3} />
      </mesh>

      {/* Lettuce Layer */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[1.35, 1.35, 0.1, 32]} />
        <meshStandardMaterial color="#558B2F" roughness={0.5} />
      </mesh>

      {/* Bottom Bun */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.4, 32]} />
        <meshStandardMaterial color="#E5C170" roughness={0.4} />
      </mesh>

      <Sparkles count={25} scale={2.5} size={3} speed={0.5} color="#FBC02D" />
    </group>
  );
}

// 3. 3D Cold Drink / Shake Model
function ColdDrink3D() {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]} scale={1.05}>
      {/* Highball Glass */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.7, 2.2, 32]} />
        <meshPhysicalMaterial color="#E0F7FA" transmission={0.9} opacity={0.4} transparent roughness={0.05} />
      </mesh>

      {/* Cold Liquid */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.85, 0.67, 1.9, 32]} />
        <meshStandardMaterial color="#0288D1" roughness={0.1} />
      </mesh>

      {/* Cream Top / Ice */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.88, 0.85, 0.2, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Floating Ice Cubes */}
      <mesh position={[0.2, 1.2, 0.2]} rotation={[0.4, 0.2, 0.6]} scale={0.25}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#FFFFFF" opacity={0.8} transparent />
      </mesh>
      <mesh position={[-0.3, 0.9, -0.1]} rotation={[0.1, 0.8, 0.3]} scale={0.25}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#FFFFFF" opacity={0.8} transparent />
      </mesh>

      {/* Straw */}
      <mesh position={[0.3, 1.4, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 16]} />
        <meshStandardMaterial color="#C8963E" roughness={0.2} />
      </mesh>

      <Sparkles count={35} scale={2.2} size={4} speed={0.6} color="#0288D1" />
    </group>
  );
}

// 4. 3D Dessert / Lava Cake Model
function Dessert3D() {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]} scale={1.1}>
      {/* Lava Cake Sponge */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.9, 32]} />
        <meshStandardMaterial color="#2C1A14" roughness={0.6} />
      </mesh>

      {/* Molten Chocolate Top Drip */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[1.1, 1.15, 0.08, 32]} />
        <meshStandardMaterial color="#1F120C" roughness={0.1} />
      </mesh>

      {/* Vanilla Ice Cream Scoop on top */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#FFF8EE" roughness={0.4} />
      </mesh>

      {/* Serving Plate */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.0, 1.7, 0.12, 64]} />
        <meshPhysicalMaterial color="#F5EFE6" roughness={0.15} clearcoat={0.9} />
      </mesh>

      <Sparkles count={30} scale={2.2} size={4} speed={0.5} color="#C8963E" />
    </group>
  );
}

export default function CoffeeBeanScene3D({ activeTab = 'coffee', scrollProgress = 0 }) {
  return (
    <div className="w-full h-[450px] md:h-[550px] relative">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <spotLight position={[4, 6, 4]} intensity={3} color="#FFF8EE" castShadow />
        <directionalLight position={[-4, -2, -2]} intensity={1.5} color="#C8963E" />
        
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          {activeTab === 'coffee' && <CoffeeCup3D />}
          {activeTab === 'burger' && <Burger3D />}
          {activeTab === 'shake' && <ColdDrink3D />}
          {activeTab === 'dessert' && <Dessert3D />}
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
