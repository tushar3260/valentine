import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { valentineWeek, getDayStatus } from "../utils/valentineConfig"; 
import { Lock, Heart, Star, Gift, Smile, Calendar } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Cloud, Stars } from "@react-three/drei";

// Icons
const getIcon = (id) => {
  switch(id) {
    case "rose": return <Heart className="w-6 h-6 text-rose-500" />;
    case "propose": return <Star className="w-6 h-6 text-yellow-500" />;
    case "chocolate": return <Gift className="w-6 h-6 text-amber-700" />;
    case "teddy": return <Smile className="w-6 h-6 text-orange-400" />;
    case "promise": return <Calendar className="w-6 h-6 text-blue-500" />;
    case "hug": return <Smile className="w-6 h-6 text-pink-500" />;
    case "kiss": return <Heart className="w-6 h-6 text-red-600 fill-current" />;
    case "valentine": return <Gift className="w-6 h-6 text-rose-600" />;
    default: return <Heart />;
  }
};

const Card = ({ day, status, index }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (status === "locked") {
      alert("Wait for the date! 🤫");
      return;
    }
    navigate(`/day/${day.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`relative p-6 rounded-2xl backdrop-blur-xl border border-white/40 shadow-xl cursor-pointer flex flex-col items-center gap-4 transition-all
        ${status === "locked" ? "bg-gray-100/10 grayscale opacity-60" : "bg-white/30 hover:bg-white/50 hover:shadow-rose-300/50"}
      `}
    >
      {status === "locked" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-10">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}

      <div className="bg-white p-4 rounded-full shadow-sm">{getIcon(day.id)}</div>
      <div className="text-center">
        <h3 className="font-cute text-2xl text-gray-800">{day.name}</h3>
        <p className="text-sm font-body text-gray-600 font-bold">{day.date}</p>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-rose-100 p-8 overflow-y-auto overflow-x-hidden">
      
      {/* 3D Bg */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas>
            <ambientLight intensity={0.5} />
            <Cloud position={[-4, 2, -5]} speed={0.2} opacity={0.5} />
            <Cloud position={[4, -2, -10]} speed={0.2} opacity={0.5} color="#fda4af" />
            <Stars radius={100} depth={50} count={1000} factor={4} fade speed={1} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 mt-8"
        >
            <h1 className="text-6xl font-cute text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600 mb-4 drop-shadow-sm">
                Our Love Journey
            </h1>
            <p className="text-gray-600 font-body text-xl">One day, one memory at a time.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
            {valentineWeek.map((day, index) => (
            <Card 
                key={day.id} 
                day={day} 
                status={getDayStatus(day.date)} 
                index={index}
            />
            ))}
        </div>
      </div>
    </div>
  );
}