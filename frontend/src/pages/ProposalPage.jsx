/**
 * =============================================================================
 * PROJECT: VALENTINE'S PROPOSAL - "THE ETERNAL ENGINE" (ULTIMATE EDITION)
 * =============================================================================
 * * ARCHITECTURE & LOGIC:
 * * 1. THE RENDERING ENGINE (Three.js + Fiber):
 * - Custom ShaderMaterial for the Heart (GLSL) to create a "living" surface.
 * - Procedural BufferGeometry for the "Love Dust" particles.
 * - Dynamic Lighting rig with Soft Shadows.
 * * 2. THE PHYSICS & INTERACTION:
 * - Heartbeat Algorithm: Uses complex sine wave overlapping to simulate
 * a real human "Lub-Dub" cardiac rhythm.
 * - Button Physics: Logic to prevent the "No" button from overlapping
 * the "Yes" button as it expands.
 * * 3. THE NARRATIVE SYSTEM:
 * - Typewriter Engine with "breath" pauses for emotional pacing.
 * - Audio State Machine (Intro -> Ambience -> Climax).
 * * * * FIXES IN THIS VERSION:
 * - Removed deprecated 'softShadows()' call.
 * - Fixed typography clipping on cursive fonts.
 * - Implemented dynamic margins to prevent button overlap.
 * - Stabilized "No" button text rendering.
 * * * AUTHOR: The Romantic Engineer
 * =============================================================================
 */

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  Suspense, 
  useCallback 
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import * as THREE from "three";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { 
  Float, 
  Sparkles, 
  MeshDistortMaterial, 
  SoftShadows, // Using component instead of function
  shaderMaterial
} from "@react-three/drei";

// --- ⚙️ GLOBAL CONFIGURATION --------------------------------------------------

const CONFIG = {
  herName: "Golu", // <--- THE MUSE
  theme: {
    primary: "#e11d48",   // Rose Red
    core: "#ff0033",      // Deep Blood Red
    glow: "#ff88aa",      // Soft Pink Glow
    void: "#050000",      // The Darkness
    text: "#ffe4e6"       // Soft Rose Text
  },
  physics: {
    baseHeartSpeed: 0.5,
    angryHeartSpeed: 2.0,
    particleCount: 600,
    shadowQuality: 10
  }
};

// --- 📜 NARRATIVE SCRIPT -----------------------------------------------------

const STORY_DATA = [
  { id: 1, text: "BBefore you...", speed: 80, delay: 1500 },
  { id: 2, text: "MMy world was just... grayscale.", speed: 60, delay: 2000 },
  { id: 3, text: "TThen, you happened.", speed: 100, delay: 2500 },
  { id: 4, text: "SSuddenly, the noise stopped.", speed: 50, delay: 2000 },
  { id: 5, text: `AAnd all I could hear was ${CONFIG.herName}...`, speed: 120, delay: 3000 },
  { id: 6, text: "II started smiling at my phone like an idiot.", speed: 40, delay: 1500 },
  { id: 7, text: "TThinking about your laugh...", speed: 60, delay: 2000 },
  { id: 8, text: "IIn your voice...", speed: 80, delay: 2000 },
  { id: 9, text: "TThe way you look at me.", speed: 90, delay: 3000 },
  { id: 10, text: "SSo I asked myself...", speed: 100, delay: 2000 },
  { id: 11, text: "IIf I could freeze one moment forever...", speed: 70, delay: 2500 },
  { id: 12, text: "IIt would be right here.", speed: 150, delay: 1000 },
  { id: 13, text: "WWith you.", speed: 200, delay: 4000 },
];

const REJECTIONS = [
  "No", 
  "Are you sure?", 
  "Really sure?",
  "Don't do this 🥺", 
  "My heart...", 
  "It beats for u!", 
  "Look at it!", 
  "Please Golu...", 
  "I'll cook!", 
  "Okay crying...", 
  "Just Click YES!"
];

// --- 🎨 SHADER LIBRARY (GLSL) ------------------------------------------------

/**
 * CUSTOM HEART MATERIAL
 * This shader creates a pulsing, organic surface that looks like muscle/energy.
 */
const HeartShaderMaterial = shaderMaterial(
  // Uniforms
  { 
    uTime: 0, 
    uColor: new THREE.Color(CONFIG.theme.core),
    uGlowColor: new THREE.Color(CONFIG.theme.glow),
    uBeat: 0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float uTime;
    uniform float uBeat;

    // Ashima Perlin Noise (Optimized)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      
      // Calculate Pulse Displacement
      float noise = snoise(position * 2.5 + uTime * 0.2);
      float beat = uBeat * 0.15; // Expansion amount
      
      // Combine noise and beat for organic expansion
      vec3 newPos = position + (normal * (beat + (noise * 0.05)));
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uBeat;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Fresnel Effect (Rim Lighting)
      vec3 viewDir = normalize(cameraPosition - vNormal); // Approximation
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

      // Color Mixing
      vec3 base = uColor;
      vec3 glow = uGlowColor * (uBeat * 2.0); // Glow gets brighter on beat
      
      vec3 finalColor = mix(base, glow, fresnel);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Register the shader
extend({ HeartShaderMaterial });

// --- 🧠 3D LOGIC & GEOMETRY --------------------------------------------------

/**
 * Creates the perfect mathematical heart shape.
 */
const HeartGeometry = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const x = 0, y = 0;
    s.moveTo(x + 0.5, y + 0.5);
    s.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    s.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    s.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    s.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    s.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    s.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    return s;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.15,
      bevelThickness: 0.1,
    });
    geo.center();
    geo.rotateZ(Math.PI);
    geo.rotateX(Math.PI);
    return geo;
  }, [shape]);

  return geometry;
};

/**
 * THE CINEMATIC HEART COMPONENT
 * Handles the "Lub-Dub" physics and shader updates.
 */
const CinematicHeart = ({ isAngry, isHappy }) => {
  const mesh = useRef();
  const material = useRef();
  const geometry = HeartGeometry();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // --- CARDIAC PHYSICS ---
    // Simulating the atrial and ventricular contraction
    // Primary Beat (Ventricular) + Secondary Beat (Atrial)
    let pulse = Math.sin(t * 7) * 0.12 + Math.sin(t * 11) * 0.05; 
    
    // Angry Mode: Adrenaline Spike
    if (isAngry) {
       pulse = Math.sin(t * 25) * 0.15 + Math.random() * 0.02;
    }
    
    // Happy Mode: Infinite Expansion (Love Explosion)
    if (isHappy) {
       mesh.current.scale.lerp(new THREE.Vector3(50, 50, 50), 0.015);
       mesh.current.rotation.y += 0.05;
       if (material.current) {
         material.current.uColor.lerp(new THREE.Color("#ffffff"), 0.05);
         material.current.uBeat = 2.0; // Max glow
       }
       return;
    }

    // Apply Physics to Mesh
    const baseScale = 1.6;
    const currentScale = baseScale + (pulse * 0.3);
    
    if (mesh.current) {
        mesh.current.scale.set(currentScale, currentScale, currentScale);
        mesh.current.rotation.y = Math.sin(t * 0.3) * 0.15; // Gentle rotation
        mesh.current.rotation.z = Math.cos(t * 0.2) * 0.05 + Math.PI; // Bobbing
    }

    // Update Shader
    if (material.current) {
        material.current.uTime = t;
        material.current.uBeat = Math.max(0, pulse); // Pass positive beat for glow
        
        const targetColor = isAngry 
            ? new THREE.Color("#4a0404") // Dark Angry Red
            : new THREE.Color(CONFIG.theme.core); // Normal Red
            
        material.current.uColor.lerp(targetColor, 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} geometry={geometry} castShadow receiveShadow>
        <heartShaderMaterial 
          ref={material} 
          transparent 
          uColor={new THREE.Color(CONFIG.theme.core)}
          uGlowColor={new THREE.Color(CONFIG.theme.glow)}
        />
      </mesh>
    </Float>
  );
};

/**
 * VOLUMETRIC PARTICLES (LOVE DUST)
 */
const LoveDust = () => {
  const count = CONFIG.physics.particleCount;
  const mesh = useRef();

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      sc[i] = Math.random();
    }
    return [pos, sc];
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-scale" count={count} array={scales} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        depthWrite={false}
        vertexColors
        transparent
        vertexShader={`
          attribute float scale;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = scale * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
            gl_FragColor = vec4(1.0, 0.9, 0.95, 0.4);
          }
        `}
      />
    </points>
  );
};

// --- 🖥️ REACT UI COMPONENTS ---------------------------------------------------

/**
 * TYPEWRITER ENGINE
 * Fixed for typography clipping issues.
 */
const Typewriter = ({ text, speed, onComplete }) => {
  const [display, setDisplay] = useState("");
  
  useEffect(() => {
    setDisplay("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplay(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <div className="relative z-10 p-6 max-w-4xl text-center overflow-visible">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-hand text-3xl md:text-5xl text-rose-100 leading-relaxed drop-shadow-xl"
      >
        {/* Padding prevents the first/last letters (swashes) from being clipped */}
        <span className="inline-block py-2 px-6">
          {display}
          <span className="animate-pulse text-rose-400 ml-1">|</span>
        </span>
      </motion.div>
    </div>
  );
};

/**
 * SMART BUTTON DECK
 * Uses dynamic gap calculation to prevent button overlap.
 */
const ButtonDeck = ({ onYes, onNo, noCount, phrases, isAngry, setIsAngry }) => {
    // 1. Calculate Growth
    const yesScale = 1 + (noCount * 0.4); // Grows faster for effect
    
    // 2. Calculate Safety Margin
    // As "Yes" grows, we push "No" further away using gap or margin
    // We increase the gap proportional to the scale of the Yes button
    const dynamicGap = Math.max(2, 2 + (noCount * 3)); // Rem units

    return (
        <motion.div 
            className="flex items-center justify-center w-full relative"
            style={{ gap: `${dynamicGap}rem` }} // DYNAMIC GAP PREVENTS OVERLAP
            layout
        >
            {/* YES BUTTON */}
            <motion.button
                layout
                onClick={onYes}
                whileHover={{ scale: yesScale * 1.1, boxShadow: "0 0 60px #e11d48" }}
                whileTap={{ scale: yesScale * 0.95 }}
                animate={{ scale: yesScale }}
                transition={{ type: "spring", bounce: 0.5, stiffness: 200 }}
                className="relative group bg-gradient-to-br from-rose-600 to-pink-600 text-white font-bold text-2xl md:text-4xl px-12 py-6 rounded-full shadow-2xl border border-rose-400/50 overflow-hidden z-20 whitespace-nowrap"
            >
                <span className="relative z-10 flex items-center gap-3 font-cute tracking-wide">
                    YES <span className="text-3xl animate-bounce">💖</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </motion.button>

            {/* NO BUTTON */}
            <motion.button
                layout
                onClick={onNo}
                onMouseEnter={() => setIsAngry(true)}
                onMouseLeave={() => setIsAngry(false)}
                animate={isAngry ? { x: [0, -5, 5, -5, 5, 0], color: "#ef4444" } : { color: "#fda4af" }}
                transition={{ duration: 0.4 }}
                className="relative z-10 bg-white/5 backdrop-blur-md border border-rose-200/20 text-rose-200/70 font-body text-xl md:text-2xl px-8 py-4 rounded-full hover:bg-rose-900/40 hover:text-white transition-all whitespace-nowrap overflow-visible"
            >
                {/* Text Stability Fix: Render inside a span to isolate from button shake */}
                <span className="inline-block">
                    {noCount < phrases.length ? phrases[noCount] : phrases[phrases.length - 1]}
                </span>
            </motion.button>
        </motion.div>
    );
};

// --- 🎮 MAIN CONTROLLER ------------------------------------------------------

export default function ProposalPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [game, setGame] = useState({
    started: false,
    chapter: 0,
    storyDone: false,
    proposalActive: false,
    isAngry: false, 
    yesPressed: false,
    noCount: 0,
    godMode: false
  });

  // --- AUDIO (Simulation) ---
  const playSound = (type) => {
      // In a real app, integrate Howler.js or AudioContext here
      // console.log(`Playing sound: ${type}`);
  };

  // --- MEMORY CHECK ---
  useEffect(() => {
    const saved = localStorage.getItem("sheSaidYes");
    if (saved === "true") {
      setGame(prev => ({ ...prev, godMode: true, yesPressed: true }));
    }
  }, []);

  // --- HANDLERS ---

  const startStory = () => {
    setGame(prev => ({ ...prev, started: true }));
    playSound('intro');
  };

  const advanceStory = useCallback(() => {
    const chapter = STORY_DATA[game.chapter];
    const readTime = chapter.delay;

    setTimeout(() => {
      if (game.chapter < STORY_DATA.length - 1) {
        setGame(prev => ({ ...prev, chapter: prev.chapter + 1 }));
      } else {
        setGame(prev => ({ ...prev, storyDone: true }));
        playSound('climax_build');
        setTimeout(() => setGame(prev => ({ ...prev, proposalActive: true })), 1500);
      }
    }, readTime);
  }, [game.chapter]);

  const handleNo = () => {
    setGame(prev => ({ 
        ...prev, 
        noCount: prev.noCount + 1, 
        isAngry: true 
    }));
    
    setTimeout(() => {
        setGame(prev => ({ ...prev, isAngry: false }));
    }, 600);

    if (navigator.vibrate) navigator.vibrate(200);
  };

  const handleYes = () => {
    setGame(prev => ({ ...prev, yesPressed: true }));
    localStorage.setItem("sheSaidYes", "true");
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 400]);
    playSound('victory');

    // Confetti
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [CONFIG.theme.primary, '#fff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [CONFIG.theme.primary, '#fff']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());

    setTimeout(() => navigate("/valentine-week"), 6000);
  };

  // --- RENDERING -------------------------------------------------------------

  if (game.godMode) {
    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <ambientLight intensity={1} />
                    <CinematicHeart isHappy={true} />
                    <Sparkles count={300} scale={15} color="#e11d48" />
                </Canvas>
            </div>
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center bg-white/90 p-12 rounded-[3rem] backdrop-blur-xl border-4 border-rose-500 shadow-2xl"
            >
                <h1 className="text-7xl font-cute text-rose-600 mb-6 drop-shadow-sm">She said Yes. ❤️</h1>
                <div className="h-1 w-24 bg-rose-200 mx-auto rounded-full mb-6" />
                <p className="font-body text-gray-500 text-lg mb-8">The memory is sealed forever.</p>
                <button 
                    onClick={() => navigate("/valentine-week")} 
                    className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xl rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                >
                    Enter Our World
                </button>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none cursor-default font-body text-rose-50">
        
        {/* --- SCENE LAYER --- */}
        <div className="absolute inset-0 z-0">
            <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
                <color attach="background" args={[CONFIG.theme.void]} />
                <fog attach="fog" args={[CONFIG.theme.void, 5, 25]} />
                
                {/* Lights */}
                <ambientLight intensity={0.4} />
                <spotLight position={[5, 10, 5]} angle={0.5} intensity={1.5} color={CONFIG.theme.glow} />
                <pointLight position={[-5, 2, -5]} intensity={2} color="#fff" />

                {/* Shadows Component (Replaces softShadows function) */}
                <SoftShadows size={15} samples={12} focus={0} />

                {/* Actors */}
                <Suspense fallback={null}>
                    {game.started && (
                        <CinematicHeart isAngry={game.isAngry} isHappy={game.yesPressed} />
                    )}
                </Suspense>
                
                <LoveDust />
            </Canvas>
        </div>

        {/* --- UI LAYER --- */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">

            {/* A. INTRO SCREEN */}
            {!game.started && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.button 
                        onClick={startStory}
                        whileHover={{ scale: 1.05, letterSpacing: "0.25em", borderColor: "rgba(255,255,255,0.8)" }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xl md:text-2xl uppercase tracking-[0.2em] font-light text-rose-200/80 border border-rose-200/30 px-16 py-5 rounded-full hover:bg-rose-900/30 hover:text-white transition-all duration-700 shadow-[0_0_40px_rgba(225,29,72,0.2)] backdrop-blur-sm"
                    >
                        Begin Experience
                    </motion.button>
                </motion.div>
            )}

            {/* B. STORYTELLER */}
            {game.started && !game.storyDone && (
                <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none">
                    <Typewriter 
                        text={STORY_DATA[game.chapter].text} 
                        speed={STORY_DATA[game.chapter].speed} 
                        onComplete={advanceStory}
                    />
                </div>
            )}

            {/* C. THE PROPOSAL */}
            <AnimatePresence>
                {game.proposalActive && !game.yesPressed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.5, type: "spring", stiffness: 50 }}
                        className="flex flex-col items-center gap-16 w-full max-w-6xl"
                    >
                        {/* Title with Glow */}
                        <div className="relative p-8">
                            <motion.h1 
                                className="text-5xl md:text-8xl font-cute text-transparent bg-clip-text bg-gradient-to-b from-rose-100 to-rose-600 drop-shadow-[0_0_35px_rgba(225,29,72,0.6)] z-20 relative text-center leading-tight p-4"
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                {CONFIG.herName}, will you be my Valentine?
                            </motion.h1>
                        </div>

                        {/* Smart Button Deck */}
                        <ButtonDeck 
                            onYes={handleYes}
                            onNo={handleNo}
                            noCount={game.noCount}
                            phrases={REJECTIONS}
                            isAngry={game.isAngry}
                            setIsAngry={(val) => setGame(prev => ({...prev, isAngry: val}))}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* D. THE CLIMAX */}
            <AnimatePresence>
                {game.yesPressed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center text-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        >
                            <h1 className="text-6xl md:text-9xl font-cute text-rose-600 mb-6 drop-shadow-xl">
                                SHE SAID YES!
                            </h1>
                            <div className="h-2 w-32 bg-rose-300 mx-auto rounded-full mb-8" />
                        </motion.div>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="text-2xl md:text-4xl font-hand text-rose-400 max-w-2xl leading-relaxed"
                        >
                            "And just like that, the universe made sense again."
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                            className="mt-16 w-full max-w-md relative"
                        >
                            <p className="text-gray-400 text-sm mb-4 font-body tracking-widest uppercase">
                                Memorialize this feeling
                            </p>
                            <input 
                                type="text" 
                                placeholder="One word..."
                                className="w-full border-b-2 border-rose-200 text-center text-3xl font-hand text-rose-600 focus:outline-none focus:border-rose-500 bg-transparent p-4 placeholder-rose-200"
                                onBlur={(e) => localStorage.setItem("proposalFeeling", e.target.value)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    </div>
  );
}