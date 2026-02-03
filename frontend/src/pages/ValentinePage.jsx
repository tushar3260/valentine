import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Scroll, Image as ImageIcon, Map, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { valentineWeek } from "../utils/valentineConfig";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, TorusKnot, Text, Image, useCursor } from "@react-three/drei";
import MemorySection from "../Components/MemorySection.jsx";

// --- 3D COMPONENTS ---

// 1. Memory Frame (Floating Pictures)
const MemoryFrame = ({ position, url, rotation }) => {
    const ref = useRef();
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    useFrame((state) => {
        ref.current.position.y += Math.sin(state.clock.getElapsedTime() + position[0]) * 0.002;
    });

    return (
        <group position={position} rotation={rotation} ref={ref} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Image url={url} scale={[3, 2, 1]} />
                <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[3.2, 2.2]} />
                    <meshStandardMaterial color="#fb7185" />
                </mesh>
            </Float>
        </group>
    );
};

// 2. The Eternal Knot (Centerpiece)
const EternalKnot = () => {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <TorusKnot ref={mesh} args={[1, 0.3, 200, 32]} scale={1.2}>
                <meshStandardMaterial color="#e11d48" metalness={0.8} roughness={0.2} emissive="#be123c" />
            </TorusKnot>
        </Float>
    );
};

// --- MAIN PAGE ---
export default function ValentinePage() {
  const navigate = useNavigate();
  const [allMemories, setAllMemories] = useState([]);
  const [currentSection, setCurrentSection] = useState("intro"); // intro, gallery, letter, future
  const [showQuestion, setShowQuestion] = useState(false);

  useEffect(() => {
    let collectedImages = [];
    valentineWeek.forEach((day) => {
      const saved = localStorage.getItem(`cloud_memories_${day.id}`);
      if (saved) {
        collectedImages = [...collectedImages, ...JSON.parse(saved)];
      }
    });
    // Add placeholders if empty to make the gallery look good
    if (collectedImages.length < 5) {
        for(let i=0; i<5; i++) collectedImages.push(`https://picsum.photos/400/300?random=${i}`);
    }
    setAllMemories(collectedImages);
  }, []);

  const handleYes = () => {
    confetti({ particleCount: 500, spread: 150, origin: { y: 0.6 }, colors: ['#e11d48', '#fb7185', '#fff'] });
    alert("I KNEW IT! I LOVE YOU! ❤️♾️");
  };

  return (
    <div className="relative min-h-screen bg-rose-950 overflow-x-hidden text-rose-50">
      
      {/* 1. THE ETERNAL SPACE (3D Background) */}
      <div className="fixed inset-0 z-0">
         <Canvas camera={{ position: [0, 0, 8] }}>
             <ambientLight intensity={0.5} />
             <pointLight position={[10, 10, 10]} intensity={1} color="#fb7185" />
             <Sparkles count={500} scale={[20, 20, 20]} size={2} speed={0.2} opacity={0.5} color="#fff" />
             
             {currentSection === 'intro' && <EternalKnot />}

             {/* Dynamic Gallery Mode */}
             {currentSection === 'gallery' && allMemories.map((img, i) => (
                 <MemoryFrame 
                    key={i} 
                    url={img} 
                    position={[
                        (i % 3 - 1) * 4, // X spread
                        (Math.floor(i / 3) - 1) * 3, // Y spread
                        -2 // Z depth
                    ]} 
                    rotation={[0, 0, (Math.random() - 0.5) * 0.2]}
                 />
             ))}
         </Canvas>
      </div>

      {/* 2. UI LAYER */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-8 px-4">
        
        {/* Nav */}
        <div className="w-full flex justify-between items-start max-w-6xl">
             <button onClick={() => navigate('/valentine-week')} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
                <ArrowLeft />
             </button>
             <div className="bg-white/10 px-6 py-2 rounded-full text-xs tracking-[0.2em] uppercase backdrop-blur-md border border-white/20">
                The Legacy of Us
             </div>
        </div>

        {/* --- SECTION: INTRO --- */}
        {currentSection === 'intro' && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-[15vh] max-w-3xl"
            >
                <h1 className="text-5xl md:text-8xl font-cute text-transparent bg-clip-text bg-gradient-to-b from-rose-200 to-rose-600 drop-shadow-2xl mb-8">
                    Forever & Always
                </h1>
                <p className="text-xl md:text-2xl text-rose-200/80 font-hand leading-relaxed mb-12">
                    "If someone finds this page in 50 years, let them know... we loved each other wildly, deeply, and truly."
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <button onClick={() => setCurrentSection('gallery')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-2 transition-all">
                        <ImageIcon size={32} className="text-rose-400" />
                        <span className="uppercase tracking-widest text-xs">Our Gallery</span>
                    </button>
                    <button onClick={() => setCurrentSection('letter')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-2 transition-all">
                        <Scroll size={32} className="text-rose-400" />
                        <span className="uppercase tracking-widest text-xs">My Letter</span>
                    </button>
                    <button onClick={() => setCurrentSection('future')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-2 transition-all col-span-2">
                        <Map size={32} className="text-rose-400" />
                        <span className="uppercase tracking-widest text-xs">Our Future Map</span>
                    </button>
                </div>

                <motion.button 
                    onClick={() => setShowQuestion(true)}
                    whileHover={{ scale: 1.05 }}
                    className="mt-12 px-10 py-4 bg-rose-600 text-white rounded-full font-bold text-lg shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                >
                    One Last Question...
                </motion.button>
            </motion.div>
        )}

        {/* --- SECTION: GALLERY (3D Driven) --- */}
        {currentSection === 'gallery' && (
            <div className="absolute bottom-10">
                <button onClick={() => setCurrentSection('intro')} className="bg-white/10 px-6 py-2 rounded-full backdrop-blur-md">
                    Back to Monument
                </button>
            </div>
        )}

        {/* --- SECTION: LETTER --- */}
        {currentSection === 'letter' && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-rose-500/20 mt-10 text-center"
            >
                <h2 className="text-3xl font-cute text-rose-300 mb-6">To My Forever,</h2>
                <p className="text-lg text-rose-100 font-body leading-loose text-left">
                    "I don't know what the future holds, but I know who I want to hold it with. Every day with you is my favorite day. Thank you for being my peace, my joy, and my love."
                </p>
                <button onClick={() => setCurrentSection('intro')} className="mt-8 text-rose-400 hover:text-rose-200 underline">Close Letter</button>
            </motion.div>
        )}

        {/* --- SECTION: FUTURE --- */}
        {currentSection === 'future' && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-rose-500/20 mt-10"
            >
                <h2 className="text-2xl font-bold text-rose-300 mb-6 flex items-center gap-2">
                    <Map /> The Plan
                </h2>
                <ul className="space-y-4 text-rose-100/80 font-body">
                    <li className="flex gap-3"><span className="text-rose-500">2026</span> Travel the world together</li>
                    <li className="flex gap-3"><span className="text-rose-500">2028</span> Build our dream home</li>
                    <li className="flex gap-3"><span className="text-rose-500">2030</span> Adopt a dog (or three)</li>
                    <li className="flex gap-3"><span className="text-rose-500">∞</span> Love you endlessly</li>
                </ul>
                <button onClick={() => setCurrentSection('intro')} className="mt-8 w-full py-3 bg-white/5 rounded-xl hover:bg-white/10">Return</button>
            </motion.div>
        )}

        {/* --- FINAL QUESTION MODAL --- */}
        <AnimatePresence>
            {showQuestion && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
                >
                    <Heart className="w-32 h-32 text-rose-600 animate-pulse mb-8 fill-current" />
                    <h1 className="text-4xl md:text-7xl font-cute text-white text-center mb-8 leading-tight">
                        Will you be my Valentine<br/>
                        <span className="text-rose-500">Forever?</span>
                    </h1>
                    
                    <div className="flex gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleYes}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-2xl font-bold py-6 px-16 rounded-full shadow-[0_0_50px_rgba(225,29,72,0.8)] transition-all"
                        >
                            YES, A MILLION TIMES! 💖
                        </motion.button>
                    </div>
                    <button onClick={() => setShowQuestion(false)} className="mt-12 text-white/30 hover:text-white transition-colors">
                        Not yet (Go back)
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}