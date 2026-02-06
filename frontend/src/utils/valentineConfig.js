import { isBefore, isSameDay, startOfDay } from "date-fns";

// 🗓️ NOTE: Year change kar lena agar abhi test karna hai (e.g., 2024 or 2025)
const YEAR = "2026"; 

export const valentineWeek = [
  { 
    id: "rose", 
    name: "Rose Day", 
    date: `${YEAR}-02-07`, 
    theme: "rose",
    color: "from-rose-100 via-pink-200 to-rose-300",
    textColor: "text-rose-600",
    message: "Like a rose, my love for you blooms every day. No thorns, just love. 🌹"
  },
  { 
    id: "propose", 
    name: "Propose Day", 
    date: `${YEAR}-02-08`, 
    theme: "night",
    color: "from-slate-900 via-purple-900 to-slate-900", // Night Mode
    textColor: "text-purple-200",
    message: "I don't need the whole world, I just need you. Will you be mine forever? 💍"
  },
  { 
    id: "chocolate", 
    name: "Chocolate Day", 
    date: `${YEAR}-02-09`, 
    theme: "choco",
    color: "from-amber-200 via-orange-300 to-yellow-200",
    textColor: "text-amber-800",
    message: "You are sweeter than any chocolate, and addictive too! 🍫"
  },
  { 
    id: "teddy", 
    name: "Teddy Day", 
    date: `${YEAR}-02-10`, 
    theme: "teddy",
    color: "from-yellow-100 via-orange-100 to-yellow-200",
    textColor: "text-orange-600",
    message: "Sending you a bear-y big hug! Whenever you need me, I'm here. 🧸"
  },
  { 
    id: "promise", 
    name: "Promise Day", 
    date: `${YEAR}-02-11`, 
    theme: "promise",
    color: "from-blue-100 via-cyan-200 to-blue-300",
    textColor: "text-blue-600",
    message: "I promise to annoy you, love you, and support you. Always. 🤞"
  },
  { 
    id: "hug", 
    name: "Hug Day", 
    date: `${YEAR}-02-12`, 
    theme: "hug",
    color: "from-pink-100 via-rose-200 to-indigo-200", // Warm fuzzy colors
    textColor: "text-pink-600",
    message: "Sometimes, words aren't enough. I just want to hold you tight. 🤗"
  },
  { 
    id: "kiss", 
    name: "Kiss Day", 
    date: `${YEAR}-02-13`, 
    theme: "kiss",
    color: "from-red-100 via-rose-300 to-red-200",
    textColor: "text-red-600",
    message: "Sealing my love for you with a virtual kiss. Muah! 💋"
  },
  { 
    id: "valentine", 
    name: "Valentine's Day", 
    date: `${YEAR}-02-14`, 
    theme: "love",
    color: "from-red-300 via-pink-400 to-red-400", // Intense Romance
    textColor: "text-white drop-shadow-md",
    message: "Happy Valentine's Day, my love. You are my today and all of my tomorrows. ❤️"
  }
];

// Helper Function to check lock status
// "locked" | "unlocked" | "past"
// export const getDayStatus = (targetDateString) => {
//   const today = startOfDay(new Date()); 
//   const targetDate = startOfDay(new Date(targetDateString));

//   if (isSameDay(today, targetDate)) return "unlocked"; 
//   if (isBefore(today, targetDate)) return "locked"; 
//   return "past"; // Past days remain accessible
// };

// Development Hack: Sab unlock karne ke liye
export const getDayStatus = (targetDateString) => {
  return "unlocked"; // ⚠️ Production/Deploy se pehle is line ko hata dena!
};