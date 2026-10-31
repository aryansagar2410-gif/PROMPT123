import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ElementalEffects({ activeEffect, comboCount }) {
  if (!activeEffect) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {/* INFERNO SLASH EFFECT */}
        {activeEffect === 'inferno' && (
          <motion.div
            key="fx-inferno"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Fiery ambient flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-r from-orange-600/30 via-red-600/40 to-transparent"
            />

            {/* Diagonal blazing slash beam */}
            <motion.div
              initial={{ scaleX: 0, rotate: -25, opacity: 1 }}
              animate={{ scaleX: [0, 1.4, 1.6], opacity: [1, 0.9, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full h-8 bg-gradient-to-r from-transparent via-amber-300 via-orange-500 to-transparent blur-[2px] shadow-[0_0_40px_#ff4500]"
            />

            {/* Ember sparks bursting outward */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * 360;
              const rad = (angle * Math.PI) / 180;
              const dist = 140 + Math.random() * 120;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(rad) * dist,
                    y: Math.sin(rad) * dist,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 0.5 + Math.random() * 0.2, ease: 'easeOut' }}
                  className="absolute w-3 h-3 rounded-full bg-gradient-to-t from-orange-600 to-amber-300 shadow-[0_0_12px_#f97316]"
                />
              );
            })}
          </motion.div>
        )}

        {/* FROST SHIELD EFFECT */}
        {activeEffect === 'frost' && (
          <motion.div
            key="fx-frost"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Cyan icy flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-l from-cyan-600/30 via-teal-500/30 to-transparent"
            />

            {/* Expanding Crystalline Shield Ring */}
            <motion.div
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: [0.3, 1.4, 1.8], opacity: [1, 0.8, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-72 h-72 rounded-full border-4 border-cyan-300 shadow-[0_0_50px_#06b6d4] flex items-center justify-center"
            >
              <div className="w-56 h-56 rounded-full border-2 border-dashed border-teal-200" />
            </motion.div>

            {/* Glacial Ice Shards */}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * 360;
              const rad = (angle * Math.PI) / 180;
              const dist = 120 + Math.random() * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: angle }}
                  animate={{
                    x: Math.cos(rad) * dist,
                    y: Math.sin(rad) * dist,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute w-2 h-6 bg-cyan-100 rounded-sm shadow-[0_0_15px_#22d3ee]"
                />
              );
            })}
          </motion.div>
        )}

        {/* THUNDER PORTAL EFFECT */}
        {activeEffect === 'volt' && (
          <motion.div
            key="fx-volt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Electric purple flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-purple-900/30"
            />

            {/* Swirling Arcane Vortex */}
            <motion.div
              initial={{ scale: 0.2, rotate: 0, opacity: 1 }}
              animate={{ scale: [0.2, 1.3, 1.7], rotate: 360, opacity: [1, 0.9, 0] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="w-80 h-80 rounded-full border-4 border-purple-400 border-t-fuchsia-300 shadow-[0_0_60px_#c084fc] flex items-center justify-center"
            >
              <div className="w-60 h-60 rounded-full border-2 border-indigo-400 rotate-45" />
            </motion.div>

            {/* Lightning Arcs */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scaleY: 0 }}
                animate={{ opacity: [1, 0.2, 1, 0], scaleY: [0, 1.2, 1] }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="absolute w-1.5 h-48 bg-gradient-to-b from-white via-fuchsia-300 to-purple-600 shadow-[0_0_20px_#e879f9]"
                style={{
                  top: '15%',
                  left: `${20 + i * 8}%`,
                  transform: `rotate(${((i % 2 === 0 ? 1 : -1) * (15 + i * 5))}deg)`,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* TIME REWIND EFFECT */}
        {activeEffect === 'rewind' && (
          <motion.div
            key="fx-rewind"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Chrono Gold/Amber Flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-amber-600/20"
            />

            {/* Reverse Clock Glyph */}
            <motion.div
              initial={{ scale: 1.5, rotate: 0, opacity: 1 }}
              animate={{ scale: [1.5, 0.8, 0], rotate: -360, opacity: [1, 0.9, 0] }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="w-48 h-48 rounded-full border-4 border-amber-400 border-dashed shadow-[0_0_50px_#fbbf24] flex items-center justify-center"
            >
              <span className="font-medieval text-3xl font-bold text-amber-300">⏳ REWIND</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

