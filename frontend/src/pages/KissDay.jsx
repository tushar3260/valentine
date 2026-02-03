import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, TorusKnot, Sparkles, MeshDistortMaterial, Text } from "@react-three/drei";
import MemorySection from "../Components/MemorySection.jsx";

// --- 3D COMPONENTS ---

// 1. Abstract Kiss Object (Soft, Fluid Shape)
const SecretBubble = ({ position, text }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);
    const [revealed, setRevealed] = useState(false);

    useFrame((state) => {
        if(mesh.current) {
            // Pulse like a heartbeat
            const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
            mesh.current.scale.setScalar(scale);
            mesh.current.rotation.x += 0.01;
        }
    });

    return (
        <group position={position} onClick={() => setRevealed(!revealed)}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {/* The Bubble */}
                <mesh 
                    ref={mesh} 
                    onPointerOver={() => setHover(true)} 
                    onPointerOut={() => setHover(false)}
                >
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <MeshDistortMaterial 
                        color={revealed ? "#be123c" : "#f43f5e"} 
                        distort={0.4} 
                        speed={2} 
                        roughness={0.2}
                        transparent
                        opacity={revealed ? 0.9 : 0.6}
                    />
                </mesh>
                
                {/* Hidden Text Reveal */}
                {revealed && (
                    <Text 
                        position={[0, 0.8, 0]} 
                        fontSize={0.2} 
                        color="white" 
                        maxWidth={2}
                        textAlign="center"
                        font="/fonts/DancingScript-Bold.ttf" // Use standard font if this fails
                    >
                        {text}
                    </Text>
                )}
            </Float>
        </group>
    );
};

// 2. Background Fog/Mist
const FogLayer = () => (
    <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.5} />
    </mesh>
);

// --- SECRET MESSAGES DATABASE ---
const secrets = [
    "I love the way you laugh.",
    "Your voice is my favorite sound.",
    "I want to grow old with you.",
    "You are my safe place.",
    "I miss you every second.",
    "One kiss is never enough."
];

// --- MAIN PAGE ---
export default function KissDay() {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(true); // "Private Mode" toggle
  const [kisses, setKisses] = useState([]); // User placed kisses

  // Generate random floating secrets
  const floatingSecrets = useMemo(() => {
      return secrets.map((s, i) => ({
          id: i,
          text: s,
          pos: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, 0]
      }));
  }, []);

  const addKiss = (e) => {
    if (locked) return; // Can only add kisses when unlocked
    const x = e.clientX;
    const y = e.clientY;
    const rotation = Math.random() * 60 - 30;
    setKisses(prev => [...prev, { id: Date.now(), x, y, rotation }]);
  };

  return (
    <div 
        className="relative w-full h-screen overflow-hidden bg-rose-950 cursor-crosshair select-none"
        onClick={addKiss}
    >
      
      {/* 1. THE PRIVATE SPACE (3D Scene) */}
      <div className="absolute inset-0 z-0">
         <Canvas camera={{ position: [0, 0, 5] }}>
             <ambientLight intensity={0.5} />
             <pointLight position={[10, 10, 10]} intensity={1} color="#f43f5e" />
             
             {/* Background Particles */}
             <Sparkles count={200} scale={[10, 10, 5]} size={2} speed={0.5} opacity={0.3} color="#fda4af" />

             {/* Floating Secret Bubbles (Only visible when unlocked) */}
             {!locked && floatingSecrets.map(secret => (
                 <SecretBubble key={secret.id} position={secret.pos} text={secret.text} />
             ))}

             {/* Locked State Visuals */}
             {locked && (
                 <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                     <TorusKnot args={[1, 0.3, 100, 16]} scale={1.2}>
                         <MeshDistortMaterial color="#881337" distort={0.2} speed={1} roughness={0.1} />
                     </TorusKnot>
                 </Float>
             )}
         </Canvas>
      </div>

      {/* 2. GLASS UI LAYER */}
      
      {/* Navbar */}
      <div className="absolute top-6 left-6 z-50 pointer-events-auto">
         <button onClick={(e) => {e.stopPropagation(); navigate('/valentine-week')}} className="bg-white/10 p-3 rounded-full text-rose-200 hover:bg-white/20 transition-all backdrop-blur-md">
            <ArrowLeft />
         </button>
      </div>

      {/* Center Lock / Unlock Prompt */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <AnimatePresence>
              {locked ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center pointer-events-auto"
                  >
                      <div className="bg-black/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4">
                          <Lock size={40} className="text-rose-400" />
                          <h1 className="text-3xl font-cute text-rose-100">Private Space</h1>
                          <p className="text-rose-200/60 font-body text-sm max-w-xs">
                              This area is encrypted with our memories. Only we can see what's inside.
                          </p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setLocked(false); }}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2"
                          >
                              <Unlock size={18} /> Enter Space
                          </button>
                      </div>
                  </motion.div>
              ) : (
                  // UNLOCKED STATE UI
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-10 flex flex-col items-center"
                  >
                      <div className="bg-rose-900/40 backdrop-blur-md px-6 py-2 rounded-full border border-rose-500/30 text-rose-200 text-sm font-bold flex items-center gap-2">
                          <Eye size={16} /> Mode: Emotional Nakedness
                      </div>
                      <p className="text-white/30 text-xs mt-2 animate-pulse">
                          Tap bubbles to read secrets • Tap empty space to leave a mark
                      </p>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      {/* Render 2D Kisses (Lipstick Marks) */}
      {!locked && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              <AnimatePresence>
                {kisses.map((kiss) => (
                    <motion.div
                        key={kiss.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.8, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute text-6xl text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                        style={{ left: kiss.x - 30, top: kiss.y - 30, rotate: kiss.rotation }}
                    >
                        💋
                    </motion.div>
                ))}
              </AnimatePresence>
          </div>
      )}

      {/* Footer Controls (Only when unlocked) */}
      {!locked && (
          <div className="absolute bottom-10 w-full flex justify-center z-50 pointer-events-auto gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setLocked(true); }}
                className="bg-black/40 backdrop-blur-md p-4 rounded-full text-rose-200 hover:bg-black/60 transition-all border border-white/10"
              >
                  <EyeOff size={20} />
              </button>
              
              {/* Memory Section Trigger */}
              <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                   <p className="text-rose-200/50 text-xs uppercase tracking-widest mb-2">Saved Intimacy</p>
                   <MemorySection day="kiss" />
              </div>
          </div>
      )}

    </div>
  );
}