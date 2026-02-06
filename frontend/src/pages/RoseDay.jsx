import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, SoftShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import confetti from "canvas-confetti";

/* ================= CONFIGURATION ================= */

// ⚠️ REPLACE THESE LINKS WITH YOUR ACTUAL PHOTO URLs
const YOUR_PHOTOS = [
  "/img1.jpeg", 
  "/img2.jpeg",
  "/img3.jpeg",
  "/img4.jpeg"
];

/* ================= FONTS & STYLES ================= */
const FontStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Quicksand:wght@300;500&display=swap');
      .font-cursive { font-family: 'Dancing Script', cursive; }
      .font-body { font-family: 'Quicksand', sans-serif; }
    `}
  </style>
);

/* ================= STORY DATA ================= */

const STORY = [
  "Hyy meri beautiful si jaan… 💕",
  "Main tumhare liye perfect rose dhoond raha tha…💕",
  "Phir yaad aaya — real flowers to ek din murjha jaate hain…💕",
  "Toh maine socha, kyun na kuch aisa banaun jo kabhi fade hi na ho…💕",
  "Isliye maine tumhare liye ek digital universe code kar diya…💕",
  "Jahan har rose forever bloom kare — bilkul mere pyaar ki tarah…💕",
  "No season change, no wilting — sirf tum aur main, always together. 🌹"
];

/* ================= 3D COMPONENTS ================= */

function BackgroundRoses({ count = 30 }) {
  const roses = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 2
      ],
      scale: 0.5 + Math.random() * 0.5,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      speed: 0.5 + Math.random()
    }));
  }, [count]);

  return (
    <>
      {roses.map((data, i) => (
        <Float key={i} speed={data.speed} rotationIntensity={1} floatIntensity={2}>
          <Text
            position={data.position}
            fontSize={data.scale}
            color="#ff4d6d"
            fillOpacity={0.6}
          >
            🌹
          </Text>
        </Float>
      ))}
    </>
  );
}

function MainRose({ active }) {
  const mesh = useRef();
  const geo = useMemo(() => new THREE.SphereGeometry(1.2, 128, 128), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!mesh.current) return;

    mesh.current.rotation.y = t * 0.2;
    mesh.current.rotation.z = Math.sin(t * 0.5) * 0.1;

    const heartbeat = 1 + Math.sin(t * 4) * 0.03 + (active ? 0.1 : 0);
    mesh.current.scale.set(heartbeat, heartbeat, heartbeat);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      const twist = Math.sin(y * 5 + t * 0.5) * 0.15;
      const bulge = Math.cos(x * 3) * 0.1;
      
      pos.setXYZ(i, x + twist + bulge, y, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={mesh} geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={active ? "#ff0a54" : "#e01e37"}
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          emissive="#ff002b"
          emissiveIntensity={active ? 0.4 : 0.1}
        />
      </mesh>
    </Float>
  );
}

function Scene({ active }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 40 }} shadows dpr={[1, 2]}>
      <color attach="background" args={["#ffe5ec"]} />
      <fog attach="fog" args={["#ffe5ec", 5, 20]} />

      <ambientLight intensity={0.7} color="#ffd1dc" />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffb3c1" castShadow />
      <pointLight position={[-5, -5, 2]} intensity={0.5} color="#c9184a" />
      
      <spotLight
        position={[0, 5, 8]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-bias={-0.0001}
      />

      <SoftShadows size={10} samples={15} />

      <Suspense fallback={null}>
        <MainRose active={active} />
        <BackgroundRoses count={40} />
      </Suspense>
    </Canvas>
  );
}

/* ================= ROSE EXPLOSION COMPONENTS ================= */

function RoseParticle({ id, onComplete }) {
  const angle = Math.random() * 360;
  const velocity = 100 + Math.random() * 300; 
  const rotateEnd = Math.random() * 720 - 360; 

  return (
    <motion.div
      className="absolute text-4xl pointer-events-none"
      initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
      animate={{ 
        x: Math.cos(angle * (Math.PI / 180)) * velocity,
        y: Math.sin(angle * (Math.PI / 180)) * velocity + 200,
        scale: [0.5, 1.2, 0.8],
        rotate: rotateEnd,
        opacity: [1, 1, 0]
      }}
      transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
      onAnimationComplete={() => onComplete(id)}
    >
      🌹
    </motion.div>
  );
}

function RoseBlast({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 60 }).map((_, i) => i);
      setParticles(newParticles);
    }
  }, [active]);

  const removeParticle = (id) => {
    setParticles((prev) => prev.filter((p) => p !== id));
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {particles.map((id) => (
        <RoseParticle key={id} id={id} onComplete={removeParticle} />
      ))}
    </div>
  );
}

/* ================= NEW: DRAMATIC LOADER ================= */

function DramaticLoader({ onComplete }) {
  const [loadingText, setLoadingText] = useState("Scanning universe...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Sequence of dramatic texts
    const sequence = [
      { text: "Scanning universe for beauty...", time: 0 },
      { text: "Filtering ordinary flowers...", time: 1500 },
      { text: "Analyzing heartbeats...", time: 3000 },
      { text: "Match found: The rarest rose...", time: 4500 },
      { text: "Revealing perfection...", time: 6000 },
    ];

    sequence.forEach(({ text, time }) => {
      setTimeout(() => setLoadingText(text), time);
    });

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          return 100;
        }
        return old + 1;
      });
    }, 70);

    // Finish after 7 seconds
    setTimeout(onComplete, 7500);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-rose-50 p-6"
    >
      <div className="w-24 h-24 mb-8 relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl absolute inset-0 flex items-center justify-center"
        >
          🌹
        </motion.div>
        <motion.div 
          className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.h2 
        key={loadingText}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-cursive text-rose-300 mb-4 text-center"
      >
        {loadingText}
      </motion.h2>

      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-rose-900">
        <motion.div 
          className="h-full bg-rose-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

/* ================= NEW: PHOTO SLIDESHOW ================= */

function PhotoSlideshow({ onClose }) {
  const [index, setIndex] = useState(0);

  const nextPhoto = () => {
    setIndex((prev) => (prev + 1) % YOUR_PHOTOS.length);
  };

  const prevPhoto = () => {
    setIndex((prev) => (prev - 1 + YOUR_PHOTOS.length) % YOUR_PHOTOS.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white text-4xl z-50"
      >
        &times;
      </button>

      <h2 className="text-3xl font-cursive text-rose-400 mb-6 absolute top-8">My Real Rose 🌹</h2>

      <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-rose-900/50">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={YOUR_PHOTOS[index]}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full object-cover"
            alt="My Love"
          />
        </AnimatePresence>
        
        {/* Controls */}
        <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-rose-500/50 p-3 rounded-full text-white text-xl backdrop-blur-sm transition">
          &#8592;
        </button>
        <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-rose-500/50 p-3 rounded-full text-white text-xl backdrop-blur-sm transition">
          &#8594;
        </button>
      </div>

      <div className="flex gap-2 mt-6">
        {YOUR_PHOTOS.map((_, i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-rose-500 w-4' : 'bg-gray-600'}`}
          />
        ))}
      </div>
      
      <p className="text-rose-200/60 mt-4 font-body text-sm">You are prettier than any code I could write.</p>
    </motion.div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function RoseDay() {
  const [phase, setPhase] = useState("story"); // Phases: story, game, final, loading_real, real_rose
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [blasting, setBlasting] = useState(false);

  /* ---------- TYPEWRITER LOGIC ---------- */
  useEffect(() => {
    if (phase !== "story") return;

    if (line >= STORY.length) {
      setPhase("game");
      return;
    }

    const text = STORY[line];
    let index = 0;
    setTyped(""); 

    const id = setInterval(() => {
      index++;
      if (index <= text.length) {
        setTyped(text.slice(0, index));
      } else {
        clearInterval(id);
        setTimeout(() => {
          if (line < STORY.length - 1) {
            setLine((x) => x + 1);
          } else {
            setPhase("game");
          }
        }, 2000); 
      }
    }, 50);

    return () => clearInterval(id);
  }, [line, phase]);

  /* ---------- GAME LOGIC ---------- */
  useEffect(() => {
    if (score >= 10 && phase === "game") {
      setTimeout(() => setPhase("final"), 500);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0a54', '#ff477e', '#ff85a1', '#fbb1bd', '#f9bec7']
      });
    }
  }, [score, phase]);

  const handleFinalBlast = () => {
    setBlasting(true);
    setTimeout(() => setBlasting(false), 2000);
  };

  /* ================= RENDER ================= */
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-pink-100 to-rose-200 font-body select-none">
      <FontStyles />

      {/* 3D LAYER */}
      <div className="absolute inset-0 z-0">
        <Scene active={phase === "final"} />
      </div>

      {/* EXPLOSION LAYER */}
      <RoseBlast active={blasting} />

      {/* OVERLAY LAYERS */}
      <AnimatePresence>
        {phase === "loading_real" && (
          <DramaticLoader onComplete={() => setPhase("real_rose")} />
        )}
        {phase === "real_rose" && (
          <PhotoSlideshow onClose={() => setPhase("final")} />
        )}
      </AnimatePresence>

      {/* MAIN UI LAYER */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
        
        <AnimatePresence mode="wait">
          {/* --- STORY PHASE --- */}
          {phase === "story" && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center z-20 max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl text-rose-600 font-cursive drop-shadow-md min-h-[80px] leading-tight px-4">
                {typed}<span className="animate-pulse text-rose-400">|</span>
              </h1>
            </motion.div>
          )}

          {/* --- GAME PHASE --- */}
          {phase === "game" && (
            <motion.div
              key="game"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="bg-white/30 backdrop-blur-md border border-white/50 p-8 rounded-3xl shadow-xl text-center max-w-md w-full"
            >
              <h2 className="text-3xl font-cursive text-rose-700 mb-2">Catch the Love! 💖</h2>
              <p className="text-rose-900 mb-6 font-medium">Gather 10 roses to unlock my heart.</p>
              
              <div className="text-lg font-bold text-rose-600 mb-4 bg-white/50 inline-block px-4 py-1 rounded-full">
                {score} / 10 Roses
              </div>

              <div className="relative h-64 w-full bg-gradient-to-b from-rose-50/50 to-rose-100/50 rounded-2xl overflow-hidden border border-rose-200 shadow-inner">
                {[...Array(6)].map((_, i) => (
                  <FallingRose key={i} delay={i * 0.5} onCatch={() => setScore(s => s + 1)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* --- FINAL PHASE --- */}
          {phase === "final" && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-center bg-white/20 backdrop-blur-xl border border-white/60 p-8 md:p-12 rounded-[3rem] shadow-2xl z-40 max-h-[90vh] overflow-y-auto"
            >
              <motion.div 
                initial={{ y: -20 }} 
                animate={{ y: 0 }} 
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
              >
                <h1 className="text-6xl md:text-8xl font-cursive text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500 drop-shadow-sm mb-4">
                  Happy Rose Day
                </h1>
              </motion.div>

              <div className="text-lg md:text-xl text-rose-900 font-medium leading-relaxed max-w-lg mx-auto font-cursive space-y-4">
                <p>
                  "Jaise yeh digital rose kabhi murjhata nahi, waise hi mera pyaar bhi tumhare liye permanently coded hai..."
                </p>
                <p>
                  "Na koi season ka effect, na distance ka bug, na time ka error — sirf hum dono ka endless version."
                </p>
                <p>
                  "No wilting, no fading — bas tum, main, aur ek forever wala connection. 🌹"
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-8 items-center">
                {/* ORIGINAL BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinalBlast}
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-rose-400/50 transition-all flex items-center justify-center gap-2 w-64"
                >
                  <span>Send Love</span>
                  <span>🌹</span>
                </motion.button>

                {/* NEW REAL ROSE BUTTON */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPhase("loading_real")}
                  className="px-8 py-3 bg-white text-rose-600 border-2 border-rose-400 rounded-full font-bold text-lg shadow-md hover:bg-rose-50 transition-all flex items-center justify-center gap-2 w-64"
                >
                  <span>Reveal the Real Rose</span>
                  <span>📸</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function FallingRose({ delay, onCatch }) {
  const [clicked, setClicked] = useState(false);
  
  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => setClicked(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  return (
    <motion.div
      onClick={() => {
        if (!clicked) {
          setClicked(true);
          onCatch();
          confetti({
             particleCount: 20, 
             spread: 30, 
             startVelocity: 15,
             origin: { y: 0.5 },
             colors: ['#FFC0CB', '#FF69B4']
          });
        }
      }}
      initial={{ y: -50, x: Math.random() * 250, opacity: 1 }}
      animate={{ 
        y: clicked ? -20 : 300, 
        opacity: clicked ? 0 : 1,
        rotate: 360 
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        delay: delay,
        ease: "linear"
      }}
      className="absolute cursor-pointer select-none text-4xl hover:scale-125 transition-transform"
    >
      🌹
    </motion.div>
  );
}