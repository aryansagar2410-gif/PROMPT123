import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import IntroSequence from './components/IntroSequence';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import BattleArenaPage from './pages/BattleArenaPage';
import AiScanPage from './pages/AiScanPage';
import GmailModal from './components/GmailModal';

function AppContent() {
  const location = useLocation();
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);

  // Hide Navbar during full-screen cinematic intro
  const isIntro = location.pathname === '/intro' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-dungeon-950 text-slate-100 flex flex-col font-sans">
      {!isIntro && (
        <Navbar onOpenGmailModal={() => setIsGmailModalOpen(true)} />
      )}

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/intro" replace />} />
          <Route path="/intro" element={<IntroSequence />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scan" element={<AiScanPage />} />
          <Route path="/battle" element={<BattleArenaPage />} />
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </main>

      {/* Global Gmail Coming Soon Modal */}
      <GmailModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

