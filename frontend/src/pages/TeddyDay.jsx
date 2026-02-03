import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, CloudRain, Heart } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, SoftShadows, useCursor } from "@react-three/drei";
import MemorySection from "../Components/MemorySection.jsx";

// --- 3D COMPONENT: PROCEDURAL TEDDY BEAR ---
const TeddyBear = ({ isHugging, mood }) => {
  const group = useRef();
  const head = useRef();
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  // Breathing Animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      // Gentle floating
      group.current.position.y = Math.sin(t * 1) * 0.1 - 0.5;
      // Breathing scale
      const breath = 1 + Math.sin(t * 2) * 0.02;
      group.current.scale.set(breath, breath, breath);
    }
    // Head looking slightly
    if (head.current) {
        head.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  const teddyColor = "#b45309"; // Warm Brown
  const snoutColor = "#fcd34d"; // Light Yellow

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group 
        ref={group} 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
        scale={isHugging ? 1.2 : 1}
      >
        {/* --- HEAD GROUP --- */}
        <group ref={head} position={[0, 1.2, 0]}>
            {/* Main Head */}
            <mesh castShadow>
                <sphereGeometry args={[0.9, 32, 32]} />
                <meshStandardMaterial color={teddyColor} roughness={0.6} />
            </mesh>
            {/* Snout */}
            <mesh position={[0, -0.2, 0.7]} scale={[1, 0.8, 0.8]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color={snoutColor} roughness={0.5} />
            </mesh>
            {/* Nose */}
            <mesh position={[0, -0.1, 1]} scale={[1, 0.6, 0.5]}>
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshStandardMaterial color="#451a03" roughness={0.2} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.3, 0.1, 0.8]}>
                <sphereGeometry args={[0.08, 32, 32]} />
                <meshStandardMaterial color="black" roughness={0.1} />
            </mesh>
            <mesh position={[0.3, 0.1, 0.8]}>
                <sphereGeometry args={[0.08, 32, 32]} />
                <meshStandardMaterial color="black" roughness={0.1} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.7, 0.7, 0]} castShadow>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color={teddyColor} roughness={0.6} />
            </mesh>
            <mesh position={[0.7, 0.7, 0]} castShadow>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color={teddyColor} roughness={0.6} />
            </mesh>
        </group>

        {/* --- BODY --- */}
        <mesh position={[0, -0.2, 0]} scale={[1.1, 1.2, 1]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={teddyColor} roughness={0.6} />
        </mesh>
        {/* Belly Patch */}
        <mesh position={[0, -0.2, 0.9]} scale={[0.6, 0.7, 0.2]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={snoutColor} roughness={0.6} />
        </mesh>

        {/* --- LIMBS --- */}
        {/* Arms */}
        <mesh position={[-1, 0.2, 0.2]} rotation={[0, 0, 0.5]} castShadow>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial color={teddyColor} roughness={0.6} />
        </mesh>
        <mesh position={[1, 0.2, 0.2]} rotation={[0, 0, -0.5]} castShadow>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial color={teddyColor} roughness={0.6} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.6, -1.2, 0.5]} scale={[1, 1.2, 1]} castShadow>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color={teddyColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.6, -1.2, 0.5]} scale={[1, 1.2, 1]} castShadow>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color={teddyColor} roughness={0.6} />
        </mesh>

      </group>
    </Float>
  );
};

// --- RAIN EFFECT ---
const Rain = () => (
    <Sparkles 
        count={500} 
        scale={[20, 20, 10]} 
        size={2} 
        speed={4} 
        opacity={0.4} 
        color="#93c5fd" 
        position={[0, 5, -5]} 
    />
);

// --- MAIN PAGE ---
export default function TeddyDay() {
  const navigate = useNavigate();
  
  // State
  const [inputMode, setInputMode] = useState(false); // false = default, true = venting
  const [message, setMessage] = useState("");
  const [teddyResponse, setTeddyResponse] = useState("I'm here. You are safe.");
  const [isHugging, setIsHugging] = useState(false);

  // Comforting Responses Database
  const comfortMessages = [
      "I'm listening. Tell me everything.",
      "It's okay to feel this way. I've got you.",
      "Take a deep breath. You are safe here.",
      "You are doing your best, and that is enough.",
      "Let it out. I'll hold the weight for you.",
      "I'm not going anywhere."
  ];

  const handleSend = () => {
      if (!message.trim()) return;
      setMessage("");
      // Simulate Teddy thinking
      setTeddyResponse("...");
      setTimeout(() => {
          const randomMsg = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];
          setTeddyResponse(randomMsg);
      }, 1500);
  };

  const handleHug = () => {
      setIsHugging(true);
      setTeddyResponse("Holding you tight... ❤️");
      setTimeout(() => setIsHugging(false), 2000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      
      {/* 1. THE SAFE ROOM (3D Scene) */}
      <div className="absolute inset-0 z-0">
         <Canvas shadows camera={{ position: [0, 1, 6], fov: 45 }}>
             {/* Atmosphere: Dark outside, Warm inside */}
             <color attach="background" args={['#0f172a']} />
             <fog attach="fog" args={['#0f172a', 5, 20]} />

             {/* Rain Outside */}
             <Rain />

             {/* Warm Lamp Light (Inside) */}
             <ambientLight intensity={0.2} color="#blue" />
             <spotLight 
                position={[2, 5, 2]} 
                angle={0.5} 
                penumbra={1} 
                intensity={2} 
                color="#fbbf24" 
                castShadow 
             />
             <pointLight position={[-2, 2, 2]} intensity={0.5} color="#fbbf24" />

             {/* The Companion */}
             <TeddyBear isHugging={isHugging} />

             <SoftShadows />
             
             {/* Floor Reflection */}
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.5} />
             </mesh>
         </Canvas>
      </div>

      {/* 2. UI OVERLAY */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-6 pointer-events-none">
        
        {/* Header */}
        <div className="w-full flex justify-between items-start pointer-events-auto">
             <button onClick={() => navigate('/valentine-week')} className="bg-white/10 p-3 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all backdrop-blur-md">
                <ArrowLeft />
             </button>
             <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full text-blue-200 text-xs tracking-widest uppercase backdrop-blur-md">
                <CloudRain size={14} /> Safe Room Active
             </div>
        </div>

        {/* Center: Teddy's Voice */}
        <div className="absolute top-1/3 w-full max-w-lg text-center px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={teddyResponse}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl shadow-lg"
                >
                    <p className="text-xl md:text-2xl font-hand text-amber-100 leading-relaxed">
                        "{teddyResponse}"
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Bottom: Interaction Panel */}
        <div className="pointer-events-auto w-full max-w-lg mb-10">
            
            {/* Action Buttons (When not typing) */}
            {!inputMode && (
                <div className="flex justify-center gap-4 mb-6">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleHug}
                        className="flex items-center gap-2 bg-amber-600/80 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold shadow-lg backdrop-blur-sm transition-all"
                    >
                        <Heart size={20} fill="currentColor" /> Hug Teddy
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setInputMode(true)}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold border border-white/20 backdrop-blur-sm transition-all"
                    >
                        <MessageCircle size={20} /> I need to vent
                    </motion.button>
                </div>
            )}

            {/* Venting Input (When typing) */}
            <AnimatePresence>
                {inputMode && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-2 px-2">
                            <span className="text-xs text-white/50 uppercase tracking-wider">Vent Box</span>
                            <button onClick={() => setInputMode(false)} className="text-white/50 hover:text-white"><ArrowLeft size={16}/></button>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/5 rounded-xl border border-white/10 p-4 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-amber-400 font-body h-24 resize-none"
                            placeholder="Type whatever is heavy on your mind..."
                        />
                        <div className="flex justify-end mt-3">
                            <button 
                                onClick={handleSend}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all"
                            >
                                Release
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>

      </div>

      {/* Memory Section (Hidden/Bottom) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
           {/* Can integrate memory section here or keep it hidden for this specific emotive page */}
           <div className="opacity-0 hover:opacity-100 transition-opacity">
               <MemorySection day="teddy" />
           </div>
      </div>

    </div>
  );
}