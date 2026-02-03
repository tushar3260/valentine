import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings2, Sparkles, RefreshCcw } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, MeshDistortMaterial, Text, OrbitControls, Stage } from "@react-three/drei";
import MemorySection from "../Components/MemorySection.jsx";

// --- CONFIG ---
const MOODS = [
    { id: "happy", label: "Joyful 😊", color: "#facc15" },
    { id: "romantic", label: "Romantic ❤️", color: "#e11d48" },
    { id: "calm", label: "Peaceful 😌", color: "#60a5fa" },
    { id: "crazy", label: "Wild 🤪", color: "#a855f7" }
];

const MESSAGES = {
    happy: { title: "Sunshine Bar", msg: "You light up my world like no one else." },
    romantic: { title: "Love Truffle", msg: "My heart beats only for you." },
    calm: { title: "Serenity Square", msg: "You are my safe space." },
    crazy: { title: "Chaos Candy", msg: "Life with you is the best adventure." }
};

// --- 3D COMPONENT: THE GENERATED CHOCOLATE ---
const GeneratedChocolate = ({ mood }) => {
    const mesh = useRef();
    
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.5;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    const color = MOODS.find(m => m.id === mood)?.color || "#5d4037";

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group ref={mesh}>
                {/* Wrapper / Chocolate Base */}
                <RoundedBox args={[1.5, 1.5, 0.5]} radius={0.1} smoothness={4}>
                    <MeshDistortMaterial 
                        color={color} 
                        roughness={0.2} 
                        metalness={0.5} 
                        distort={0.2} 
                        speed={2} 
                        emissive={color}
                        emissiveIntensity={0.2}
                    />
                </RoundedBox>
                {/* Decor */}
                <RoundedBox args={[0.5, 0.5, 0.6]} radius={0.5} smoothness={4} position={[0,0,0]}>
                     <meshStandardMaterial color="#fff" roughness={0.1} metalness={0.8} />
                </RoundedBox>
            </group>
        </Float>
    );
};

// --- 3D BACKGROUND PARTICLES ---
const FloatingParticle = ({ color }) => {
    const ref = useRef();
    useFrame((state) => {
        ref.current.rotation.x += 0.01;
        ref.current.rotation.y += 0.01;
        ref.current.position.y += Math.sin(state.clock.getElapsedTime() + Math.random()) * 0.005;
    });
    return (
        <mesh ref={ref} position={[(Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*5]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
    );
};

export default function ChocolateDay() {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState(1); // 1: Input, 2: Processing, 3: Result
  const [selectedMood, setSelectedMood] = useState(null);
  
  const handleGenerate = () => {
      if(!selectedMood) return alert("Select a mood first!");
      setStep(2);
      setTimeout(() => setStep(3), 3000); // Fake processing time
  };

  const handleReset = () => {
      setStep(1);
      setSelectedMood(null);
  };

  return (
    <div className="relative min-h-screen bg-[#1a0f0d] text-[#e7e5e4] overflow-x-hidden font-body">
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-50">
        <Canvas camera={{ position: [0, 0, 8] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {[...Array(20)].map((_, i) => (
                <FloatingParticle key={i} color={selectedMood ? MOODS.find(m => m.id === selectedMood).color : "#5d4037"} />
            ))}
            {step === 3 && <GeneratedChocolate mood={selectedMood} />}
        </Canvas>
      </div>

      {/* UI Layer */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-8 px-4">
        
        {/* Nav */}
        <div className="w-full flex justify-between items-center max-w-4xl mb-8">
            <button onClick={() => navigate('/valentine-week')} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
                <ArrowLeft />
            </button>
            <div className="bg-white/10 px-4 py-2 rounded-full text-xs tracking-widest uppercase backdrop-blur-md">
                The Emotion Factory v1.0
            </div>
        </div>

        {/* --- STEP 1: INPUT CONSOLE --- */}
        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-lg bg-[#2b1b17]/80 backdrop-blur-xl border border-[#5d4037] rounded-3xl p-8 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Settings2 className="text-[#d7ccc8]" />
                        <h2 className="text-2xl font-bold font-cute text-[#d7ccc8]">Configure Gift</h2>
                    </div>

                    <p className="text-[#a8a29e] mb-6">How are you feeling right now?</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {MOODS.map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => setSelectedMood(mood.id)}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                    ${selectedMood === mood.id 
                                        ? `bg-${mood.color}/20 border-white scale-105 shadow-lg` 
                                        : 'bg-white/5 border-transparent hover:bg-white/10'}
                                `}
                                style={{ borderColor: selectedMood === mood.id ? mood.color : 'transparent' }}
                            >
                                <span className="text-2xl">{mood.label.split(' ')[1]}</span>
                                <span className="font-bold">{mood.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={!selectedMood}
                        className="w-full bg-gradient-to-r from-[#5d4037] to-[#3e2723] py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
                    >
                        Generate Emotion Object
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- STEP 2: PROCESSING --- */}
        <AnimatePresence>
            {step === 2 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
                >
                    <div className="w-24 h-24 border-4 border-[#5d4037] border-t-white rounded-full animate-spin mb-8" />
                    <h2 className="text-2xl font-cute animate-pulse">Synthesizing Feelings...</h2>
                    <p className="text-white/50 mt-2">Mixing memories & sugar...</p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- STEP 3: THE RESULT --- */}
        <AnimatePresence>
            {step === 3 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center w-full max-w-2xl mt-[30vh]"
                >
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <h3 className="text-amber-300 uppercase tracking-widest text-sm mb-2">Item Generated Successfully</h3>
                        <h1 className="text-4xl md:text-5xl font-cute mb-4 text-white">
                            {MESSAGES[selectedMood].title}
                        </h1>
                        <p className="text-xl text-white/80 font-hand italic leading-relaxed mb-6">
                            "{MESSAGES[selectedMood].msg}"
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={handleReset} className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <RefreshCcw size={16} /> Create Another
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="w-full pb-20 mt-auto">
            <MemorySection day="chocolate" />
        </div>
      </div>
    </div>
  );
}