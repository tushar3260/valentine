// src/components/MemorySection.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2 } from "lucide-react";

// 👇👇👇 APNI DETAILS YAHAN BHAR BHAI 👇👇👇
const CLOUD_NAME = "dkc6ksins"; // E.g., dxyz123
const UPLOAD_PRESET = "Valentine"; // E.g., valentine_project

export default function MemorySection({ day }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load saved Cloudinary URLs from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(`cloud_memories_${day}`);
    if (saved) {
      setImages(JSON.parse(saved));
    }
  }, [day]);

  // Handle File Select & Upload to Cloudinary
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      
      // Add new URL to list
      const newImages = [...images, data.secure_url];
      setImages(newImages);
      
      // Save URL list locally so it remembers
      localStorage.setItem(`cloud_memories_${day}`, JSON.stringify(newImages));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Photo upload failed! Check internet.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    localStorage.setItem(`cloud_memories_${day}`, JSON.stringify(newImages));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Camera className="text-rose-500" />
          Memories of {day.charAt(0).toUpperCase() + day.slice(1)} Day
        </h2>
        <span className="text-xs bg-white/50 px-3 py-1 rounded-full text-gray-600">
          {images.length} Photos
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative aspect-square group rounded-xl overflow-hidden shadow-md bg-gray-100"
            >
              <img src={img} alt="memory" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-rose-300 flex flex-col items-center justify-center gap-2 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="animate-spin text-rose-500" />
          ) : (
            <>
              <Upload className="text-rose-400" />
              <span className="text-xs text-rose-400 font-bold">Add Photo</span>
            </>
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}