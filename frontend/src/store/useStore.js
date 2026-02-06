import { create } from 'zustand';

export const useStore = create((set) => ({
  act: 0, // 0: Start, 1: Intro, 2: Memories, 3: Game, 4: Finale
  setAct: (act) => set({ act }),
  nextAct: () => set((state) => ({ act: state.act + 1 })),
  
  // Game State
  heartsFound: 0,
  addHeart: () => set((state) => ({ heartsFound: state.heartsFound + 1 })),
  
  // Audio State
  audioAllowed: false,
  allowAudio: () => set({ audioAllowed: true }),
}));