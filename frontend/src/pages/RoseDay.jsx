import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flower2, Wind } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Sky, 
  Environment, 
  Cloud, 
  Float, 
  SoftShadows,
  useHelper
} from "@react-three/drei";
import * as THREE from "three";
import MemorySection from "../Components/MemorySection.jsx";

// --- 3D COMPONENTS ---

// 1. Realistic Procedural Rose
const RealisticRose = ({ position, scale = 1, delay = 0 }) => {
  const groupRef = useRef();
  
  // Independent sway animation for each rose
  useFrame((state) => {
    if(groupRef.current) {
        const t = state.clock.getElapsedTime() + delay;
        // Stem swaying
        groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
        groupRef.current.rotation.x = Math.cos(t * 1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
        {/* Stem */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.04, 0.06, 1.6, 8]} />
            <meshStandardMaterial color="#2d5a27" roughness={0.8} />
        </mesh>

        {/* Leaves */}
        <mesh position={[0.1, 0.6, 0.1]} rotation={[0.5, 0.5, 0.5]} castShadow>
            <sphereGeometry args={[0.15, 6, 2]} />
            <meshStandardMaterial color="#3a7a34" roughness={0.6} />
        </mesh>
        <mesh position={[-0.1, 0.9, -0.1]} rotation={[-0.5, -0.5, -0.5]} castShadow>
            <sphereGeometry args={[0.12, 6, 2]} />
            <meshStandardMaterial color="#3a7a34" roughness={0.6} />
        </mesh>

        {/* Flower Head Group */}
        <group position={[0, 1.6, 0]}>
            {/* Base (Sepals) */}
            <mesh position={[0, -0.15, 0]} scale={[1, 0.5, 1]}>
                <dodecahedronGeometry args={[0.25]} />
                <meshStandardMaterial color="#2d5a27" />
            </mesh>

            {/* Inner Bud */}
            <mesh castShadow>
                <dodecahedronGeometry args={[0.25]} />
                <meshStandardMaterial color="#9f1239" roughness={0.3} />
            </mesh>

            {/* Outer Petals (Layer 1) */}
            <mesh rotation={[0.2, 0, 0]} position={[0, 0.05, 0]} castShadow>
                <torusKnotGeometry args={[0.2, 0.08, 64, 8, 2, 3]} />
                <meshStandardMaterial color="#e11d48" roughness={0.4} metalness={0.1} />
            </mesh>
             {/* Outer Petals (Layer 2) */}
            <mesh rotation={[-0.2, 1.5, 0]} position={[0, 0.08, 0]} scale={1.1} castShadow>
                <torusKnotGeometry args={[0.2, 0.06, 64, 8, 2, 3]} />
                <meshStandardMaterial color="#fb7185" roughness={0.5} />
            </mesh>
        </group>
    </group>
  );
};

// 2. Flying Butterflies
const Butterfly = ({ position }) => {
    const ref = useRef();
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        ref.current.position.y += Math.sin(t * 3) * 0.005;
        ref.current.position.x += Math.cos(t * 1) * 0.005;
        ref.current.rotation.z = Math.sin(t * 10) * 0.5; // Flapping wings effect
    });
    return (
        <group ref={ref} position={position}>
            <mesh>
                <sphereGeometry args={[0.03]} />
                <meshStandardMaterial color="gold" emissive="orange" />
            </mesh>
            {/* Wings */}
            <mesh position={[0.04, 0, 0]} rotation={[0, 0, 0.5]}>
                 <planeGeometry args={[0.1, 0.1]} />
                 <meshStandardMaterial color="#fcd34d" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[-0.04, 0, 0]} rotation={[0, 0, -0.5]}>
                 <planeGeometry args={[0.1, 0.1]} />
                 <meshStandardMaterial color="#fcd34d" side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}

// --- MAIN PAGE ---
export default function RoseDay() {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  
  // State to hold ALL planted roses
  const [roses, setRoses] = useState([
      // Initial Rose in center
      { id: 'initial', x: 0, z: 0, scale: 1, delay: 0 } 
  ]);

  useEffect(() => {
    const savedNote = localStorage.getItem("note_rose");
    if (savedNote) setNote(savedNote);
    
    // Check if there are saved rose positions (Optional Advanced Feature)
    // For now, we reset to 1 rose on reload to keep it clean, or you can save array to localStorage
  }, []);

  const handlePlant = () => {
    if (!note.trim()) return alert("Write a small note first! 🌸");
    
    localStorage.setItem("note_rose", note);
    
    // Add a NEW rose at a random position nearby
    const newRose = {
        id: Date.now(),
        x: (Math.random() * 6) - 3, // Random X between -3 and 3
        z: (Math.random() * 4) - 2, // Random Z between -2 and 2
        scale: 0.8 + Math.random() * 0.5, // Random Size
        delay: Math.random() * 10 // Random sway offset
    };

    setRoses((prev) => [...prev, newRose]);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100">
      
      {/* 1. THE REALISTIC 3D GARDEN */}
      <div className="absolute inset-0 z-0 cursor-move">
        <Canvas shadows camera={{ position: [0, 3, 7], fov: 50 }}>
            {/* Realistic Lighting Environment */}
            <Sky sunPosition={[100, 10, 100]} turbidity={0.5} rayleigh={0.5} />
            <ambientLight intensity={0.5} />
            <directionalLight 
                position={[5, 10, 5]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
            />
            <Environment preset="sunset" />
            <SoftShadows size={10} samples={10} />
            
            {/* Fog for depth */}
            <fog attach="fog" args={['#f0fdf4', 5, 20]} />

            {/* Clouds */}
            <Cloud position={[-4, 8, -10]} opacity={0.6} speed={0.2} />
            <Cloud position={[4, 6, -5]} opacity={0.6} speed={0.2} />

            {/* Render All Planted Roses */}
            {roses.map((rose) => (
                <RealisticRose 
                    key={rose.id} 
                    position={[rose.x, 0, rose.z]} 
                    scale={rose.scale}
                    delay={rose.delay}
                />
            ))}

            {/* Nature Elements */}
            <Float speed={2} floatIntensity={2}>
                <Butterfly position={[-1, 1.5, 1]} />
                <Butterfly position={[1, 2, -1]} />
                <Butterfly position={[0, 1.2, 0.5]} />
            </Float>

            {/* Controls */}
            <OrbitControls 
                enableZoom={true} 
                minDistance={3}
                maxDistance={12}
                maxPolarAngle={Math.PI / 2.2} // Prevent going under ground
                target={[0, 1, 0]}
            />
            
            {/* Realistic Floor (Grass) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4ade80" /> 
            </mesh>
            
            {/* Ground Noise Overlay for Texture (Simulating Grass) */}
             <gridHelper args={[50, 50, 0xffffff, 0xffffff]} position={[0, 0.01, 0]} visible={false} />
        </Canvas>
      </div>

      {/* 2. UI LAYER */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Top Nav */}
        <div className="flex justify-between items-start pointer-events-auto">
            <button onClick={() => navigate('/valentine-week')} className="bg-white/30 backdrop-blur-md p-3 rounded-full text-green-900 hover:bg-white/50 transition-all shadow-md">
                <ArrowLeft />
            </button>
            <div className="bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-green-900 font-bold text-sm shadow-md flex items-center gap-2">
                <Wind size={16} /> 
                {roses.length} Roses Blooming
            </div>
        </div>

        {/* Interaction Panel */}
        <div className="pointer-events-auto w-full max-w-xl mx-auto mb-8">
            <motion.div 
                layout
                className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4 text-rose-600">
                    <Flower2 size={24} />
                    <h2 className="font-cute text-2xl text-rose-700">
                        Plant a Rose
                    </h2>
                </div>

                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white/50 rounded-xl border border-rose-200 p-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400 font-hand text-xl h-20 resize-none transition-all"
                    placeholder="Write a memory to plant a new rose..."
                />

                <div className="flex items-center justify-end mt-4">
                    <button 
                        onClick={handlePlant}
                        className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Plant Rose 🌹
                    </button>
                </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
}