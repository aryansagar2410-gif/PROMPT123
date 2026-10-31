import React from 'react';
import { ArcaneParticles } from './RuneDecorations';

export default function DungeonBackground({ children, showParticles = true }) {
  return (
    <div className="relative min-h-screen w-full bg-[#05070c] text-slate-100 overflow-x-hidden">
      {/* Background radial ambient lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-center neon purple mystic rift */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-purple-700/15 rounded-full blur-[130px]" />
        
        {/* Left Fire/Blaze warm glow */}
        <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px]" />

        {/* Right Ice/Frost icy cyan glow */}
        <div className="absolute top-1/2 -right-48 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-[120px]" />

        {/* Bottom Storm/Volt electric violet glow */}
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px]" />

        {/* Vignette & scanline texture */}
        <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" 
             style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(4, 5, 8, 0.85) 100%)' }} />
        
        {/* Dungeon Grid / Rune Floor Projection */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {showParticles && <ArcaneParticles count={25} color="rgba(192, 132, 252, 0.45)" />}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

