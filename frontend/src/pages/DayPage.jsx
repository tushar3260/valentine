import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Save, X, Heart, Stars, CloudRain, Music } from "lucide-react";
import { valentineWeek } from "../utils/valentineConfig";
import MemorySection from "../Components/MemorySection.jsx";
// --- 🌸 1. SUB-COMPONENTS FOR SPECIAL EFFECTS 🌸 ---

// Effect: Rose Day (Falling Petals)
const RoseEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl"
        initial={{ y: -50, rotate: 0, opacity: 0 }}
        animate={{ y: 800, rotate: 360, opacity: [0, 1, 0] }}
        transition={{ 
          duration: Math.random() * 5 + 5, 
          repeat: Infinity, 
          delay: Math.random() * 5 
        }}
        style={{ left: `${Math.random() * 100}%` }}
      >
        🌹
      </motion.div>
    ))}
    {[...Array(10)].map((_, i) => (
        <motion.div
          key={i + 20}
          className="absolute w-3 h-3 bg-red-400 rounded-full opacity-60"
          initial={{ y: -50, x: 0 }}
          animate={{ y: 800, x: Math.sin(i) * 100 }}
          transition={{ duration: 7, repeat: Infinity, delay: i * 0.8 }}
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}
  </div>
);

// Effect: Propose Day (Starry Night + Shooting Stars)
const ProposeEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1a0b2e] to-black">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full shadow-[0_0_10px_white]"
        initial={{ opacity: 0.2, scale: 0.5 }}
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.2, 0.5] }}
        transition={{ duration: Math.random() * 3 + 1, repeat: Infinity }}
        style={{ 
          width: Math.random() * 3 + 'px',
          height: Math.random() * 3 + 'px',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
      />
    ))}
  </div>
);

// Effect: Chocolate Day (Falling Chocolates)
const ChocolateEffect = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          initial={{ y: -100 }}
          animate={{ y: 800 }}
          transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, delay: i * 0.5 }}
          style={{ left: `${Math.random() * 100}%` }}
        >
          {['🍫', '🍩', '🍪'][Math.floor(Math.random() * 3)]}
        </motion.div>
      ))}
    </div>
);

// Effect: Teddy Day (Bouncing Teddies)
const TeddyEffect = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-orange-50/50">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          initial={{ y: 1000 }}
          animate={{ y: [1000, 500, 1000] }} // Jump effect
          transition={{ duration: 4, repeat: Infinity, delay: i * 1, ease: "easeInOut" }}
          style={{ left: `${Math.random() * 80 + 10}%` }}
        >
          🧸
        </motion.div>
      ))}
    </div>
);


// --- 📄 2. MAIN COMPONENT 📄 ---

export default function DayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Default to Rose Day if ID not found, but try to match exact config
  const dayConfig = valentineWeek.find((d) => d.id === id) || valentineWeek[0];
  const [images, setImages] = useState([]);
  const [note, setNote] = useState("");

  // Load saved data
  useEffect(() => {
    const savedImages = localStorage.getItem(`memories_${id}`);
    const savedNote = localStorage.getItem(`note_${id}`);
    if (savedImages) setImages(JSON.parse(savedImages));
    if (savedNote) setNote(savedNote);
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images, reader.result];
        setImages(newImages);
        localStorage.setItem(`memories_${id}`, JSON.stringify(newImages));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    localStorage.setItem(`memories_${id}`, JSON.stringify(newImages));
  };

  const saveNote = () => {
    localStorage.setItem(`note_${id}`, note);
    alert("Message saved! 💌");
  };

  // --- 🎨 RENDER THEME BASED ON ID ---
  const renderThemeBackground = () => {
    switch(id) {
        case 'rose': return <RoseEffect />;
        case 'propose': return <ProposeEffect />;
        case 'chocolate': return <ChocolateEffect />;
        case 'teddy': return <TeddyEffect />;
        // Default simplistic particles for others
        default: return <RoseEffect />; 
    }
  };

  const isDark = id === 'propose'; // Propose day uses dark theme

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-700 
      ${isDark ? 'bg-slate-900 text-white' : `bg-gradient-to-br ${dayConfig.color}`}
    `}>
      
      {/* 1. Dynamic Background Effect */}
      {renderThemeBackground()}

      {/* 2. Navigation */}
      <button 
        onClick={() => navigate('/valentine-week')}
        className={`absolute top-6 left-6 flex items-center gap-2 z-50 font-bold px-4 py-2 rounded-full backdrop-blur-sm transition-all
          ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/40 text-rose-600 hover:bg-white/60'}
        `}
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="container mx-auto px-4 py-20 relative z-10">
        
        {/* 3. Hero Header (Changes per day) */}
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-16"
        >
            {id === 'propose' && <Stars className="w-12 h-12 mx-auto mb-4 text-yellow-400 animate-pulse" />}
            {id === 'rose' && <span className="text-6xl block mb-4 animate-bounce">🌹</span>}
            {id === 'chocolate' && <span className="text-6xl block mb-4 animate-bounce">🍫</span>}
            
            <h1 className={`text-5xl md:text-7xl font-cute font-bold mb-4 drop-shadow-lg 
              ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200' : 'text-rose-600'}
            `}>
                {dayConfig.name}
            </h1>
            <p className={`text-xl md:text-2xl font-body italic max-w-2xl mx-auto
                ${isDark ? 'text-gray-300' : 'text-rose-800'}
            `}>
                "{dayConfig.message}"
            </p>
        </motion.div>

        {/* 4. Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Left Card: Memories */}
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`backdrop-blur-md rounded-3xl p-6 shadow-2xl border
                   ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/50'}
                `}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-rose-700'}`}>
                        📸 Our Memories
                    </h2>
                    <span className="text-xs opacity-70 bg-black/10 px-2 py-1 rounded-full">
                        {images.length} photos
                    </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <AnimatePresence>
                        {images.map((img, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                className="relative aspect-square group rounded-xl overflow-hidden shadow-sm"
                            >
                                <img src={img} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                    <X size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all
                            ${isDark ? 'border-white/30 text-white/50 hover:bg-white/10' : 'border-rose-300 text-rose-400 hover:bg-rose-50'}
                        `}
                    >
                        <Upload size={20} />
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </motion.div>

            {/* Right Card: The Letter */}
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`backdrop-blur-md rounded-3xl p-6 shadow-2xl border flex flex-col
                   ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/60 border-white/50'}
                `}
            >
                <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-rose-700'}`}>
                    💌 A Note for You
                </h2>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={id === 'propose' ? "Will you marry me? (Just kidding... unless? 💍)" : "Write something romantic..."}
                    className={`flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed
                        ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}
                    `}
                    style={{ minHeight: '200px', fontFamily: "'Dancing Script', cursive" }}
                />
                <div className="flex justify-end mt-4">
                    <button
                        onClick={saveNote}
                        className={`px-6 py-2 rounded-full font-bold shadow-lg transform active:scale-95 transition-all
                            ${isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-rose-500 text-white hover:bg-rose-600'}
                        `}
                    >
                        Save Note
                    </button>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}