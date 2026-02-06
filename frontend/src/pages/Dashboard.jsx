import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Star, Gift, Smile, Calendar, 
  Lock, ArrowRight, Music, Cloud, Moon, Sun
} from "lucide-react";
import { valentineWeek, getDayStatus } from "../utils/valentineConfig";

// --- 📖 STORY DATA ENRICHMENT ---
// We add "Chapter" details to the existing config
const STORY_CHAPTERS = {
  rose: {
    title: "The First Bloom",
    text: "It started with a simple gesture. A flower that said what words couldn't.",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-50"
  },
  propose: {
    title: "The Confession",
    text: "Heart racing, hands shaking. The moment I asked you to be mine.",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-50"
  },
  chocolate: {
    title: "Sweet Little Things",
    text: "Sharing sweetness, fighting over the last piece. The taste of us.",
    icon: Gift,
    color: "text-amber-700",
    bg: "bg-amber-50"
  },
  teddy: {
    title: "Comfort & Warmth",
    text: "Someone to hold when the world gets cold. My soft place.",
    icon: Smile,
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  promise: {
    title: "The Vow",
    text: "Not just words, but a bond. To be there, always.",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  hug: {
    title: "Safe Haven",
    text: "In your arms, the noise of the world fades away.",
    icon: Smile,
    color: "text-pink-500",
    bg: "bg-pink-50"
  },
  kiss: {
    title: "The Seal",
    text: "A moment of infinite closeness. Soul touching soul.",
    icon: Heart,
    color: "text-red-600",
    bg: "bg-red-50"
  },
  valentine: {
    title: "Forever Begins",
    text: "From strangers to soulmates. This is our story.",
    icon: Gift,
    color: "text-rose-600",
    bg: "bg-rose-100"
  }
};

// --- 🎨 VISUAL COMPONENTS ---

// 1. DYNAMIC SKY BACKGROUND
const Skybox = ({ scrollYProgress }) => {
  // Map scroll position to sky colors
  const background = useTransform(scrollYProgress, 
    [0, 0.4, 0.8, 1], 
    [
      "linear-gradient(to bottom, #dbeafe, #fce7f3)", // Morning (Blue -> Pink)
      "linear-gradient(to bottom, #fef3c7, #fb7185)", // Sunset (Gold -> Red)
      "linear-gradient(to bottom, #4c1d95, #1e1b4b)", // Twilight (Purple -> Dark)
      "linear-gradient(to bottom, #0f172a, #000000)"  // Night (Black)
    ]
  );

  const sunY = useTransform(scrollYProgress, [0, 0.5], ["10%", "150%"]); // Sun sets
  const moonY = useTransform(scrollYProgress, [0.5, 1], ["-50%", "20%"]); // Moon rises

  return (
    <motion.div style={{ background }} className="fixed inset-0 z-0 transition-colors duration-1000">
      {/* Sun */}
      <motion.div style={{ top: sunY }} className="absolute right-[10%] w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-60" />
      {/* Moon */}
      <motion.div style={{ top: moonY }} className="absolute left-[15%] w-24 h-24 bg-slate-100 rounded-full blur-xl opacity-80 shadow-[0_0_50px_white]" />
      
      {/* Floating Clouds (Parallax) */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
         <motion.div 
            animate={{ x: [0, 100, 0] }} 
            transition={{ duration: 60, repeat: Infinity }}
            className="absolute top-20 left-10 text-white opacity-40"
         >
            <Cloud size={120} fill="white" />
         </motion.div>
         <motion.div 
            animate={{ x: [0, -150, 0] }} 
            transition={{ duration: 90, repeat: Infinity }}
            className="absolute top-60 right-20 text-white opacity-30"
         >
            <Cloud size={80} fill="white" />
         </motion.div>
      </div>

      {/* Stars (Only visible at night) */}
      <motion.div 
        style={{ opacity: useTransform(scrollYProgress, [0.6, 1], [0, 1]) }}
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen" 
      />
    </motion.div>
  );
};

// 2. STORY CARD (The Timeline Item)
const StoryChapter = ({ day, index, status, isLast }) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  
  const chapter = STORY_CHAPTERS[day.id];
  const Icon = chapter.icon;
  const isLocked = status === "locked";
  const isLeft = index % 2 === 0; // Zig-zag layout

  return (
    <div ref={ref} className={`relative flex items-center mb-32 ${isLeft ? 'flex-row' : 'flex-row-reverse'} justify-center w-full max-w-5xl mx-auto px-4`}>
      
      {/* Central Timeline Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-white/30 rounded-full hidden md:block">
        <motion.div 
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full bg-white shadow-[0_0_10px_white]"
        />
      </div>

      {/* The Timeline Node (Center Dot) */}
      <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white bg-white/20 backdrop-blur-md z-10 flex items-center justify-center hidden md:flex shadow-[0_0_20px_rgba(255,255,255,0.5)]">
         <div className={`w-3 h-3 rounded-full ${isLocked ? 'bg-gray-400' : 'bg-rose-500 animate-pulse'}`} />
      </div>

      {/* Card Container */}
      <motion.div 
        initial={{ opacity: 0, x: isLeft ? -50 : 50, rotate: isLeft ? -5 : 5 }}
        animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        onClick={() => !isLocked && navigate(`/day/${day.id}`)}
        className={`
            w-full md:w-[45%] p-6 rounded-[2rem] 
            backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]
            cursor-pointer group hover:scale-[1.02] transition-transform duration-300
            ${isLocked ? 'bg-white/10 grayscale' : 'bg-white/60 hover:bg-white/80'}
        `}
      >
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${isLocked ? 'bg-gray-200' : chapter.bg} shadow-sm`}>
                {isLocked ? <Lock className="text-gray-400" /> : <Icon className={chapter.color} />}
            </div>
            <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{day.date}</span>
                <h3 className={`text-2xl font-cute ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                    {chapter.title}
                </h3>
            </div>
        </div>
        
        <p className={`text-lg font-hand leading-relaxed mb-6 ${isLocked ? 'text-gray-400 blur-[2px]' : 'text-gray-600'}`}>
            "{chapter.text}"
        </p>

        <div className="flex justify-between items-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isLocked ? 'bg-gray-200 text-gray-500' : 'bg-rose-100 text-rose-600'}`}>
                {isLocked ? "LOCKED MEMORY" : day.name.toUpperCase()}
            </span>
            {!isLocked && <ArrowRight className="text-rose-400 group-hover:translate-x-2 transition-transform" />}
        </div>
      </motion.div>

    </div>
  );
};

// --- 🏠 MAIN COMPONENT ---

export default function Dashboard() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const navigate = useNavigate();

  return (
    <div className="relative h-screen overflow-y-auto overflow-x-hidden scroll-smooth" ref={containerRef}>
      
      {/* 1. Dynamic Background Layer */}
      <Skybox scrollYProgress={scrollYProgress} />

      {/* 2. Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center p-6">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
         >
            <span className="text-rose-600 font-bold tracking-[0.3em] text-sm uppercase bg-white/50 backdrop-blur-md px-6 py-2 rounded-full mb-6 inline-block">
                Our Journey
            </span>
            <h1 className="text-6xl md:text-8xl font-cute text-gray-800 mb-6 drop-shadow-sm">
                It all started with<br /> a <span className="text-rose-500 italic">Smile...</span>
            </h1>
            <p className="text-xl text-gray-600 font-hand max-w-xl mx-auto leading-relaxed">
                "Every day is a chapter. Every moment is a memory. Scroll down to walk through our story."
            </p>
         </motion.div>
         
         {/* Scroll Indicator */}
         <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 text-gray-400 flex flex-col items-center gap-2"
         >
            <span className="text-xs uppercase tracking-widest">Begin the Journey</span>
            <ArrowRight className="rotate-90" />
         </motion.div>
      </div>

      {/* 3. Timeline Story */}
      <div className="relative z-10 pb-40">
         {valentineWeek.map((day, index) => (
            <StoryChapter 
                key={day.id} 
                day={day} 
                index={index} 
                status={getDayStatus(day.date)}
            />
         ))}
      </div>

      {/* 4. The Finale (Bottom) */}
      <div className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center text-center p-6 mt-20">
         <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="bg-black/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 max-w-2xl"
         >
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-4xl md:text-6xl font-cute text-white mb-6">
                To Be Continued...
            </h2>
            <p className="text-white/80 font-body text-lg mb-8">
                "Some stories don't have an ending. They just have new beginnings. I can't wait for what's next."
            </p>
            <button 
                onClick={() => navigate('/day/valentine')}
                className="bg-white text-rose-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
                Enter the Finale ❤️
            </button>
         </motion.div>
      </div>

    </div>
  );
}