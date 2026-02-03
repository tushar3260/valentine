import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Clock, Send } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, TorusKnot, MeshDistortMaterial, Text } from "@react-three/drei";
import MemorySection from "../Components/MemorySection.jsx";

// --- 3D COMPONENTS ---

// 1. The Time Vault (Abstract Representation)
const TimeVaultObj = ({ isLocked }) => {
    const mesh = useRef();
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group ref={mesh}>
                {/* Outer Ring */}
                <TorusKnot args={[1, 0.3, 128, 16]} scale={isLocked ? 0.8 : 1.2}>
                    <MeshDistortMaterial 
                        color={isLocked ? "#3b82f6" : "#60a5fa"} 
                        emissive={isLocked ? "#1e3a8a" : "#2563eb"}
                        emissiveIntensity={0.5}
                        roughness={0.1} 
                        metalness={1} 
                        distort={0.4} 
                        speed={2} 
                    />
                </TorusKnot>
                {/* Core */}
                <mesh scale={0.5}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
                </mesh>
            </group>
        </Float>
    );
};

// 2. Floating Capsules (Representing Sent Letters)
const TimeCapsule = ({ position, delay }) => {
    const ref = useRef();
    useFrame((state) => {
         const t = state.clock.getElapsedTime();
         ref.current.position.y += Math.sin(t + delay) * 0.002;
         ref.current.rotation.z += 0.01;
    });
    return (
        <mesh ref={ref} position={position} rotation={[0,0,Math.random()]}>
            <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.6} />
        </mesh>
    );
};

export default function PromiseDay() {
  const navigate = useNavigate();
  
  // State
  const [selectedEra, setSelectedEra] = useState("1year");
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false);

  const eras = [
      { id: "1year", label: "1 Year Later", date: "Feb 2027" },
      { id: "5years", label: "5 Years Later", date: "Feb 2031" },
      { id: "kids", label: "Future Kids", date: "Unknown Date" }
  ];

  const handleLock = () => {
      if(!message.trim()) return;
      setLocked(true);
      setTimeout(() => {
          alert("Message sent to the future! 🕰️");
          setMessage("");
          setLocked(false);
      }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-x-hidden text-blue-50">
      
      {/* 1. THE TIME VORTEX (3D Background) */}
      <div className="fixed inset-0 z-0">
         <Canvas camera={{ position: [0, 0, 6] }}>
             <ambientLight intensity={0.5} />
             <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
             <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={2} />
             
             {/* The Main Vault */}
             <TimeVaultObj isLocked={locked} />

             {/* Background Capsules */}
             <TimeCapsule position={[-3, 2, -2]} delay={0} />
             <TimeCapsule position={[3, -2, -4]} delay={2} />
             <TimeCapsule position={[-2, -3, -1]} delay={4} />

         </Canvas>
      </div>

      {/* 2. UI LAYER */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-8 px-4">
        
        {/* Nav */}
        <div className="w-full flex justify-between items-start max-w-4xl">
             <button onClick={() => navigate('/valentine-week')} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
                <ArrowLeft />
             </button>
             <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-full text-blue-200 text-xs tracking-widest uppercase backdrop-blur-md border border-blue-500/30">
                <Clock size={14} /> Temporal Link Active
             </div>
        </div>

        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 mb-12"
        >
            <h1 className="text-5xl md:text-6xl font-cute text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400 drop-shadow-lg mb-2">
                The Time Vault
            </h1>
            <p className="text-blue-200/60 font-body text-lg">Send a message to our future selves.</p>
        </motion.div>

        {/* --- INTERACTION PANEL --- */}
        <motion.div 
            className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
        >
            {/* Era Selection */}
            <div className="flex justify-between gap-2 mb-6 bg-slate-950/50 p-1 rounded-xl">
                {eras.map((era) => (
                    <button
                        key={era.id}
                        onClick={() => setSelectedEra(era.id)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                            ${selectedEra === era.id 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-blue-400/50 hover:text-blue-300 hover:bg-white/5'}
                        `}
                    >
                        {era.label}
                    </button>
                ))}
            </div>

            {/* Date Display */}
            <div className="text-center mb-6">
                <span className="text-xs text-blue-400 uppercase tracking-widest">Target Date</span>
                <h2 className="text-2xl font-mono text-white glow">{eras.find(e => e.id === selectedEra).date}</h2>
            </div>

            {/* Message Input */}
            <div className="relative">
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={locked}
                    className="w-full bg-slate-950/50 border border-blue-500/30 rounded-xl p-4 text-blue-100 placeholder-blue-700/50 h-32 resize-none focus:outline-none focus:border-blue-400 transition-all font-body disabled:opacity-50"
                    placeholder={`Write to us in ${eras.find(e => e.id === selectedEra).label}...`}
                />
                
                {/* Lock Overlay Animation */}
                <AnimatePresence>
                    {locked && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl backdrop-blur-sm"
                        >
                            <div className="flex flex-col items-center">
                                <Lock size={40} className="text-blue-400 mb-2 animate-bounce" />
                                <span className="text-blue-200 font-bold">Encrypting & Sending...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleLock}
                disabled={locked || !message.trim()}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {locked ? "Sending..." : (
                    <>
                        <Send size={20} className="group-hover:translate-x-1 transition-transform" /> 
                        Seal in Time Vault
                    </>
                )}
            </button>

        </motion.div>

        {/* Memory Section */}
        <div className="w-full pb-20 mt-20">
            <MemorySection day="promise" />
        </div>

      </div>
    </div>
  );
}