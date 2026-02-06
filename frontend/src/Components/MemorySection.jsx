





import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLOUDINARY_UPLOAD_PRESET = "dkc6ksins";
const CLOUDINARY_CLOUD_NAME = "Valentine";

const ROSE_OPTIONS = ["🌹", "🌸", "🤍", "💛", "🧡"];

export default function MemorySection({ dayKey = "rose_day_memories" }) {
  const [items, setItems] = useState([]); // [{url, note, rose}]
  const [uploading, setUploading] = useState(false);

  // ✅ Load from localStorage with backward compatibility
  useEffect(() => {
    const raw = localStorage.getItem(dayKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      // old format = string[]
      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        const converted = parsed.map((url) => ({
          url,
          note: "",
          rose: "🌹",
        }));
        setItems(converted);
        localStorage.setItem(dayKey, JSON.stringify(converted));
      }
      // new format = object[]
      else {
        setItems(
          parsed.map((p) => ({
            url: p.url,
            note: p.note || "",
            rose: p.rose || "🌹",
          }))
        );
      }
    } catch {
      setItems([]);
    }
  }, [dayKey]);

  // ✅ persist helper
  const persist = (next) => {
    setItems(next);
    localStorage.setItem(dayKey, JSON.stringify(next));
  };

  // ✅ Cloudinary upload — DO NOT CHANGE CORE LOGIC
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        const newItem = {
          url: data.secure_url,
          note: "",
          rose: "🌹",
        };
        persist([newItem, ...items]);
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    handleUpload(file);
    e.target.value = "";
  };

  const deleteItem = (index) => {
    const next = items.filter((_, i) => i !== index);
    persist(next);
  };

  const updateNote = (index, note) => {
    const next = [...items];
    next[index].note = note;
    persist(next);
  };

  const updateRose = (index, rose) => {
    const next = [...items];
    next[index].rose = rose;
    persist(next);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-rose-600">Rose Day Memories</h2>
        <p className="text-rose-400 mt-2 text-sm">
          Each memory deserves its own rose 🌹
        </p>

        {/* Upload */}
        <label className="inline-block mt-5 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <div className="px-6 py-3 rounded-2xl bg-rose-500 text-white shadow-lg hover:scale-105 transition">
            {uploading ? "Uploading..." : "Upload Memory"}
          </div>
        </label>
      </motion.div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.url}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl overflow-hidden shadow-xl bg-white"
            >
              {/* Image */}
              <img
                src={item.url}
                alt="memory"
                className="w-full h-64 object-cover"
              />

              {/* Rose badge */}
              <div className="absolute top-3 left-3 text-xl bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow">
                {item.rose || "🌹"}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteItem(index)}
                className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                Delete
              </button>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-between">
                {/* Note textarea */}
                <textarea
                  value={item.note}
                  onChange={(e) => updateNote(index, e.target.value)}
                  placeholder="Write this memory..."
                  className="w-full text-sm rounded-xl p-3 bg-white/90 backdrop-blur resize-none outline-none focus:ring-2 focus:ring-rose-400"
                  rows={3}
                />

                {/* Rose picker */}
                <div className="flex gap-2 justify-center mt-3">
                  {ROSE_OPTIONS.map((r) => (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateRose(index, r)}
                      className={`text-xl px-2 py-1 rounded-full bg-white/90 shadow ${
                        item.rose === r ? "ring-2 ring-rose-500" : ""
                      }`}
                    >
                      {r}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
