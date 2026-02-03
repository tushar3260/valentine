import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProposalPage from "./pages/ProposalPage";
import Dashboard from "./pages/Dashboard";
import ValentinePage from "./pages/ValentinePage";

// Import your new separate pages (We will create these next)
import RoseDay from "./pages/RoseDay";
import ProposeDay from "./pages/ProposeDay";
import ChocolateDay from "./pages/ChocolateDay";
import TeddyDay from "./pages/TeddyDay";
import PromiseDay from "./pages/PromiseDay";
import HugDay from "./pages/HugDay";
import KissDay from "./pages/KissDay";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProposalPage />} />
        <Route path="/valentine-week" element={<Dashboard />} />
        
        {/* --- 8 UNIQUE PAGES --- */}
        <Route path="/day/rose" element={<RoseDay />} />
        <Route path="/day/propose" element={<ProposeDay />} />
        <Route path="/day/chocolate" element={<ChocolateDay />} />
        <Route path="/day/teddy" element={<TeddyDay />} />
        <Route path="/day/promise" element={<PromiseDay />} />
        <Route path="/day/hug" element={<HugDay />} />
        <Route path="/day/kiss" element={<KissDay />} />
        <Route path="/day/valentine" element={<ValentinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;