import React from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../audio/soundEffects';

export default function GameButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'blaze' | 'frost' | 'volt' | 'elder' | 'dark' | 'outline'
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  sound = 'click', // 'click' | 'fire' | 'frost' | 'volt' | 'gate' | 'elder'
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    if (sound === 'fire') sounds.playFireEffect();
    else if (sound === 'frost') sounds.playFrostEffect();
    else if (sound === 'volt') sounds.playVoltEffect();
    else if (sound === 'elder') sounds.playElderByteChime();
    else if (sound === 'gate') sounds.playGateOpen();
    else sounds.playClick();

    if (onClick) onClick(e);
  };

  const handleMouseEnter = () => {
    if (!disabled && sound === 'click') {
      sounds.playClick();
    }
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] hover:brightness-110',
    blaze: 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white font-bold border-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.8)] hover:brightness-110',
    frost: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 text-white font-bold border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:brightness-110',
    volt: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-700 text-white font-bold border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(192,132,252,0.8)] hover:brightness-110',
    elder: 'bg-gradient-to-r from-purple-900 via-amber-700 to-purple-950 text-amber-200 font-bold border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:shadow-[0_0_35px_rgba(251,191,36,0.7)]',
    dark: 'bg-dungeon-800/90 text-slate-200 font-semibold border-dungeon-600 hover:border-purple-500/70 hover:bg-dungeon-700 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    outline: 'bg-transparent text-purple-300 font-semibold border-purple-500/50 hover:bg-purple-950/40 hover:border-purple-400 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs tracking-wider gap-1.5',
    md: 'px-5 py-2.5 text-sm tracking-widest gap-2',
    lg: 'px-7 py-3.5 text-base tracking-widest gap-2.5 font-cinzel',
    xl: 'px-9 py-4 text-lg tracking-widest gap-3 font-cinzel',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center uppercase rounded-lg border
        transition-all duration-200 select-none overflow-hidden
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${disabled ? 'opacity-40 cursor-not-allowed filter grayscale' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {/* Corner metallic clips */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/60 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/60 pointer-events-none" />
      
      {/* Subtle shine sweep */}
      <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none" />

      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

