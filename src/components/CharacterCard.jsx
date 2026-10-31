import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, Shield, Zap, Flame, Check } from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';
import GameButton from './GameButton';
import { sounds } from '../audio/soundEffects';

export default function CharacterCard({
  character,
  isActive = false,
  onSelect,
  showFullDetails = false,
}) {
  const {
    id,
    name,
    title,
    role,
    affinity,
    description,
    ability,
    abilityDesc,
    voiceLine,
    stats,
    primaryColor,
    actionName,
  } = character;

  const playVoice = () => {
    if (id === 'blaze') sounds.playFireEffect();
    else if (id === 'frost') sounds.playFrostEffect();
    else if (id === 'volt') sounds.playVoltEffect();
    else sounds.playElderByteChime();
  };

  const getBorderGlow = () => {
    switch (id) {
      case 'blaze':
        return isActive ? 'border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.5)]' : 'border-orange-500/30 hover:border-orange-400';
      case 'frost':
        return isActive ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]' : 'border-cyan-500/30 hover:border-cyan-400';
      case 'volt':
        return isActive ? 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]' : 'border-purple-500/30 hover:border-purple-400';
      case 'elderByte':
      default:
        return isActive ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'border-amber-500/30 hover:border-amber-400';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-dungeon-900/90 rounded-2xl border-2 ${getBorderGlow()} p-5 flex flex-col justify-between backdrop-blur-md transition-all duration-300 overflow-hidden group`}
    >
      {/* Active companion ribbon */}
      {isActive && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-cinzel text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1 uppercase tracking-wider">
            <Check className="w-3 h-3 stroke-[3]" />
            Chosen Helper
          </div>
        </div>
      )}

      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-slate-400">
            {role}
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-cinzel text-[11px] text-amber-400/90 font-semibold">
            {affinity}
          </span>
        </div>

        {/* Character Title & Name */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medieval text-2xl font-bold text-white tracking-wide">
              {name}
            </h3>
            <p className="font-cinzel text-xs font-semibold text-slate-300">
              {title}
            </p>
          </div>

          {/* Voice Preview Button */}
          <button
            onClick={playVoice}
            title="Listen to Guardian Echo"
            className="p-2 rounded-xl bg-dungeon-950/80 border border-slate-700/60 text-slate-400 hover:text-amber-300 hover:border-amber-400/60 transition-all"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Vector Character Avatar */}
        <div className="my-4 flex items-center justify-center">
          <div className="relative">
            {/* Ambient character glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            />
            <CharacterAvatar id={id} size="lg" animated={true} />
          </div>
        </div>

        {/* Voice quote line */}
        <div className="bg-dungeon-950/80 rounded-xl p-3 border border-slate-800 text-xs italic text-slate-300 mb-4 text-center">
          {voiceLine}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {description}
        </p>

        {/* Ability Banner */}
        <div className="bg-dungeon-950/60 rounded-xl p-3 border border-slate-800/80 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-amber-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ABILITY: {ability}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {abilityDesc}
          </p>
        </div>

        {/* Combat / Efficiency Stats */}
        <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-800/80 mb-4 text-center">
          <div>
            <div className="text-[10px] font-cinzel text-slate-400 uppercase">Power</div>
            <div className="font-medieval text-sm font-bold text-amber-400">{stats.power}%</div>
          </div>
          <div>
            <div className="text-[10px] font-cinzel text-slate-400 uppercase">Speed</div>
            <div className="font-medieval text-sm font-bold text-cyan-400">{stats.speed}%</div>
          </div>
          <div>
            <div className="text-[10px] font-cinzel text-slate-400 uppercase">Shield</div>
            <div className="font-medieval text-sm font-bold text-purple-400">{stats.defense}%</div>
          </div>
        </div>
      </div>

      {/* Select / Equip Action Button */}
      <div className="pt-2">
        <GameButton
          variant={id === 'blaze' ? 'blaze' : id === 'frost' ? 'frost' : id === 'volt' ? 'volt' : 'elder'}
          size="sm"
          onClick={() => {
            if (onSelect) onSelect(id);
            playVoice();
          }}
          className="w-full"
        >
          {isActive ? 'Current Helper' : `Choose ${name}`}
        </GameButton>
      </div>
    </motion.div>
  );
}

