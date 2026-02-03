import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  Stars, 
  Torus, 
  Cloud, 
  Sky, 
  Environment,
  Sparkles,
  Text
} from "@react-three/drei";
import MemorySection from "../Components/MemorySection.jsx";

// --- 3D COMPONENTS FOR UNIVERSES ---

const GoldenRing = ({ active }) => (
  <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
     <group scale={active ? 1.2 : 1}>
        <Torus args={[0.8, 0.1, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} emissive="#FFA500" emissiveIntensity={0.2} />
        </Torus>
        <mesh position={[0, 0.9, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshPhysicalMaterial color="white" transmission={0.9} opacity={1} metalness={0} roughness={0} ior={2.4} thickness={2} />
        </mesh>
     </group>
  </Float>
);

const RainSystem = () => (
    <group>
        <Cloud position={[0, 4, 0]} speed={0.5} opacity={0.8} />
        <Sparkles count={500} scale={[10, 10, 10]} size={2} speed={2} opacity={0.6} color="#a5f3fc" />
    </group>
);

const BeachSunset = () => (
    <group>
        <Sky sunPosition={[100, 5, 100]} turbidity={0.5} rayleigh={0.5} />
        <Environment preset="sunset" />
    </group>
);

// --- UNIVERSE CONFIG ---
const universes = [
    {
        id: "space",
        title: "The Cosmic Proposal",
        story: "In a timeline where we met among the stars... I would drift through infinity just to find you.",
        bg: "from-slate-900 to-black",
        component: <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
    },
    {
        id: "rain",
        title: "The Rainy Day",
        story: "In a world where we were stuck under a bus stop in the rain... I'd hold the umbrella forever.",
        bg: "from-gray-900 to-slate-800",
        component: <RainSystem />
    },
    {
        id: "beach",
        title: "The Sunset Vow",
        story: "In a life where we grew old by the ocean... I'd propose every single evening at sunset.",
        bg: "from-orange-900 to-amber-900",
        component: <BeachSunset />
    },
    {
        id: "school",
        title: "Childhood Sweethearts",
        story: "In a reality where we met in kindergarten... I would have given you a ring pop at recess.",
        bg: "from-pink-900 to-rose-950",
        component: <Sparkles count={100} scale={10} size={5} speed={0.4} opacity={1} color="#f472b6" />
    }
];

export default function ProposeDay() {
  const navigate = useNavigate();
  const [universeIndex, setUniverseIndex] = useState(0);
  const [ringOpen, setRingOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const currentUniverse = universes[universeIndex];

  const nextUniverse = () => {
    setUniverseIndex((prev) => (prev + 1) % universes.length);
    setRingOpen(false); // Reset interaction
  };

  const prevUniverse = () => {
    setUniverseIndex((prev) => (prev - 1 + universes.length) % universes.length);
    setRingOpen(false);
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-1000 bg-gradient-to-b ${currentUniverse.bg} overflow-x-hidden`}>
      
      {/* 1. THE 3D MULTIVERSE VIEWER */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4] }}>
            {/* Base Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
            
            {/* Dynamic Universe Background */}
            {currentUniverse.component}

            {/* The Constant Ring */}
            <GoldenRing active={ringOpen} />
        </Canvas>
      </div>

      {/* 2. UI LAYER */}
      <div className="relative z-10 flex flex-col items-center pt-8 px-4 min-h-screen">
        
        {/* Nav Controls */}
        <div className="w-full flex justify-between items-start max-w-6xl">
             <button onClick={() => navigate('/valentine-week')} className="text-white/70 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-sm transition-all">
                <ArrowLeft />
            </button>
            <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-xs text-white/50 tracking-widest border border-white/10">
                TIMELINE: {universeIndex + 1} / {universes.length}
            </div>
        </div>

        {/* Dynamic Story Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center mt-10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentUniverse.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-amber-300 font-body text-sm tracking-[0.2em] uppercase mb-4">
                        {currentUniverse.title}
                    </h2>
                    <h1 className="text-4xl md:text-6xl font-cute text-white drop-shadow-lg mb-8 leading-tight">
                        {ringOpen ? "You Said Yes." : "How I'd Ask You..."}
                    </h1>
                    <p className="text-white/80 font-hand text-2xl md:text-3xl leading-relaxed mb-12 min-h-[100px]">
                        "{currentUniverse.story}"
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Universe Switcher & Interaction */}
            <div className="flex items-center gap-8 mb-12">
                <button onClick={prevUniverse} className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all">
                    <ChevronLeft size={32} />
                </button>

                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px #fbbf24" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRingOpen(!ringOpen)}
                    className={`px-10 py-4 rounded-full font-bold text-xl shadow-lg border-2 transition-all
                        ${ringOpen ? 'bg-white text-black border-white' : 'bg-amber-500 text-black border-amber-300'}
                    `}
                >
                    {ringOpen ? "Promise Sealed ❤️" : "Propose in this Universe"}
                </motion.button>

                <button onClick={nextUniverse} className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all">
                    <ChevronRight size={32} />
                </button>
            </div>
            
            <p className="text-white/30 text-sm font-body animate-pulse">
                Swipe to explore other realities
            </p>
        </div>

        {/* Memory Section (Pushed to bottom) */}
        <div className="w-full pb-20 mt-auto">
            <MemorySection day="propose" />
        </div>
      </div>
    </div>
  );
}