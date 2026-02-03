import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Float, 
  Sphere, 
  MeshDistortMaterial, 
  Sparkles, 
  useCursor, 
  Text,
  Trail
} from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import { ArrowLeft } from "lucide-react";

// --- 3D COMPONENTS ---

// 1. The Avatar Orb (Fluid, Soft Body)
const AvatarOrb = ({ position, color, isDraggable, onDrag, opacity = 1 }) => {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  useCursor(hovered && isDraggable);

  const bind = useDrag(({ offset: [x], down }) => {
    if (isDraggable) {
        // Map screen pixels to 3D world units
        const newX = x / aspect; 
        // Clamp to prevent going off screen or passing the other orb too far
        const clampedX = Math.max(-1, Math.min(4, newX + 3)); 
        if (onDrag) onDrag(clampedX);
    }
  }, { pointerEvents: true });

  useFrame((state) => {
      if (!mesh.current) return;
      // organic breathing motion
      const t = state.clock.getElapsedTime();
      mesh.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
      
      if(isDraggable) {
          // If dragging, position is controlled by parent state passed via position prop
          // logic handled in parent for smooth syncing
      } else {
          // Idle float for the static one
          mesh.current.position.y = Math.sin(t) * 0.1;
      }
  });

  return (
    <group position={position} {...(isDraggable ? bind() : {})}>
        <Trail width={2} length={4} color={color} attenuation={(t) => t * t}>
            <Sphere 
                ref={mesh} 
                args={[0.6, 64, 64]} 
                onPointerOver={() => setHover(true)} 
                onPointerOut={() => setHover(false)}
            >
                <MeshDistortMaterial 
                    color={color} 
                    distort={0.5} 
                    speed={2} 
                    roughness={0.1} 
                    metalness={0.2}
                    emissive={color}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={opacity}
                />
            </Sphere>
        </Trail>
        {/* Glow Halo */}
        <mesh scale={1.5}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.1 * opacity} />
        </mesh>
    </group>
  );
};

// 2. The Distance Field (Visual Connection)
const DistanceField = ({ start, end, intensity }) => {
    const ref = useRef();
    useFrame(() => {
        if (ref.current) {
            const points = [new THREE.Vector3(start, 0, 0), new THREE.Vector3(end, 0, 0)];
            ref.current.geometry.setFromPoints(points);
        }
    });

    return (
        <group>
            {/* The Beam */}
            <line ref={ref}>
                <bufferGeometry />
                <lineBasicMaterial color="white" transparent opacity={0.1 + (intensity * 0.5)} />
            </line>
            {/* Particles along the line */}
            <Sparkles 
                count={20} 
                scale={[Math.abs(start - end), 1, 1]} 
                position={[(start + end) / 2, 0, 0]} 
                size={2} 
                opacity={intensity}
                color="white" 
            />
        </group>
    );
};

// 3. The Heart Core (Appears on Collapse)
const HeartCore = () => {
    const mesh = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Heartbeat pulse
        const scale = 1 + Math.pow(Math.sin(t * 3), 63) * 0.4; // Sharp heartbeat curve
        if(mesh.current) mesh.current.scale.setScalar(scale);
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0}>
                <mesh ref={mesh}>
                    <dodecahedronGeometry args={[1.5, 0]} />
                    <MeshDistortMaterial 
                        color="#ff0000" 
                        emissive="#880000" 
                        emissiveIntensity={2} 
                        distort={0.4} 
                        speed={3} 
                        roughness={0}
                    />
                </mesh>
            </Float>
            {/* Ambient Radiance */}
            <Sparkles count={200} scale={10} size={4} speed={0.2} opacity={0.5} color="#ffaaaa" />
        </group>
    );
};

// --- MAIN PAGE LOGIC ---

export default function HugDay() {
  const navigate = useNavigate();
  
  // Interaction State
  const [herPos, setHerPos] = useState(3.5); // Start far right
  const [myPos] = useState(-3.5); // I am far left
  const [distance, setDistance] = useState(7);
  const [collapsed, setCollapsed] = useState(false); // The state when they touch
  const [showFinalUI, setShowFinalUI] = useState(false);

  // Audio Refs (For immersive feel)
  const heartbeatAudio = useRef(new Audio('/heartbeat.mp3')); // Ensure file exists or remove
  
  const handleDrag = (x) => {
      if (collapsed) return;
      
      const newDist = Math.abs(myPos - x);
      setDistance(newDist);
      setHerPos(x);

      // --- THE COLLAPSE EVENT ---
      if (newDist < 0.8) {
          setCollapsed(true);
          // Play sounds if available
          // heartbeatAudio.current.play().catch(() => {});
          
          // Trigger Aftermath Timer
          setTimeout(() => setShowFinalUI(true), 10000); // 10 seconds of silence
      }
  };

  // Derived visuals based on distance (0 to 1 normalized roughly)
  const proximity = Math.max(0, 1 - (distance / 7)); 

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* 1. THE 3D SCENE */}
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${collapsed ? 'opacity-100' : 'opacity-100'}`}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            
            {/* Dynamic Environment */}
            <color attach="background" args={[collapsed ? '#1a0505' : '#050a1a']} />
            <fog attach="fog" args={[collapsed ? '#1a0505' : '#050a1a', 5, 20 - (proximity * 15)]} />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 5]} intensity={2} color={collapsed ? "#ff0000" : "#ffffff"} />

            {!collapsed ? (
                <>
                    {/* AVATARS */}
                    {/* You (Static) */}
                    <AvatarOrb 
                        position={[myPos, 0, 0]} 
                        color="#60a5fa" 
                        isDraggable={false}
                        opacity={1}
                    />
                    
                    {/* Her (Draggable) */}
                    <AvatarOrb 
                        position={[herPos, 0, 0]} 
                        color="#f472b6" 
                        isDraggable={true} 
                        onDrag={handleDrag}
                        opacity={1}
                    />

                    {/* FIELD */}
                    <DistanceField start={myPos} end={herPos} intensity={proximity} />

                    {/* PARTICLES (Increase as you get closer) */}
                    <Sparkles 
                        count={100 + (proximity * 500)} 
                        scale={[20, 10, 10]} 
                        size={1 + (proximity * 3)} 
                        speed={0.5 + (proximity * 2)} 
                        color={proximity > 0.8 ? "#fbcfe8" : "#ffffff"} 
                    />
                </>
            ) : (
                /* THE CORE (After Collapse) */
                <HeartCore />
            )}

        </Canvas>
      </div>

      {/* 2. EMOTIONAL OVERLAY LAYERS */}

      {/* Flash on Collapse */}
      <AnimatePresence>
        {collapsed && (
            <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 3 }}
                className="absolute inset-0 bg-white pointer-events-none z-50"
            />
        )}
      </AnimatePresence>

      {/* Intro UI (Fades out as you get closer) */}
      {!collapsed && (
          <motion.div 
            style={{ opacity: 1 - (proximity * 1.5) }} // Disappears when close
            className="absolute top-10 left-0 right-0 text-center pointer-events-none z-20"
          >
              <h2 className="text-blue-200/50 text-xs tracking-[0.5em] uppercase mb-4">The Distance Collapse Engine</h2>
              <p className="text-white/30 text-sm font-light animate-pulse">
                  Hold & Drag to bridge the gap
              </p>
          </motion.div>
      )}

      {/* Dynamic Text (Appears when very close but not touched) */}
      {!collapsed && proximity > 0.7 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute bottom-20 w-full text-center pointer-events-none z-20"
          >
              <p className="text-white/80 font-hand text-2xl tracking-widest blur-[0.5px]">
                  Almost there...
              </p>
          </motion.div>
      )}

      {/* 3. THE AFTERMATH (10s later) */}
      <AnimatePresence>
        {showFinalUI && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/40 backdrop-blur-sm"
            >
                <h1 className="text-3xl md:text-5xl font-hand text-white mb-8 text-center leading-relaxed max-w-2xl px-6">
                    "If I could, I would hug you like this every day."
                </h1>
                
                <div className="flex gap-6">
                    <button 
                        onClick={() => navigate('/valentine-week')} 
                        className="px-8 py-3 rounded-full border border-white/20 text-white/50 hover:text-white hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
                    >
                        Return to Reality
                    </button>
                    <button 
                        onClick={() => setShowFinalUI(false)} // Just hide UI to stay in the loop
                        className="px-8 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(225,29,72,0.6)]"
                    >
                        Stay Here
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation (Only visible at start) */}
      {!collapsed && (
        <button onClick={() => navigate('/valentine-week')} className="absolute top-6 left-6 text-white/30 hover:text-white z-50 transition-colors">
            <ArrowLeft />
        </button>
      )}

    </div>
  );
}