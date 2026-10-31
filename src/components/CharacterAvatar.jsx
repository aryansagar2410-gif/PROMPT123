import React from 'react';
import { motion } from 'framer-motion';

/**
 * Custom original vector illustrations for the 4 RPG companions:
 * - BLAZE: Fierce little fire elemental warrior with flaming horns, magma core & blade
 * - FROST: Gentle crystalline ice mage with glowing glacial cowl & floating snowflake rune
 * - VOLT: Kinetic storm sorcerer with thunder crest, electric eyes & plasma energy arcs
 * - ELDER BYTE: Ancient cyber-arcane arch-mage with obsidian rune mask & floating gold halos
 */
export default function CharacterAvatar({ id, size = 'md', animated = true, className = '' }) {
  const sizeMap = {
    xs: 'w-10 h-10',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
    hero: 'w-64 h-64 md:w-80 md:h-80',
  };

  const dim = sizeMap[size] || sizeMap.md;

  const renderIllustration = () => {
    switch (id) {
      case 'blaze':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">
            <defs>
              <radialGradient id="blaze-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="85%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#9a3412" />
              </radialGradient>
              <linearGradient id="blaze-flame" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id="blaze-armor" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#431407" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
            </defs>

            {/* Flaming Aura Background */}
            <motion.path
              d="M100 20 C120 45, 145 40, 150 70 C160 100, 155 130, 140 155 C120 180, 80 180, 60 155 C45 130, 40 100, 50 70 C55 40, 80 45, 100 20 Z"
              fill="url(#blaze-flame)"
              opacity="0.25"
              animate={animated ? { scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] } : {}}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Flaming Crown / Hair */}
            <motion.path
              d="M65 85 C60 55, 75 30, 95 15 C98 38, 108 30, 115 18 C125 35, 138 48, 135 85 Z"
              fill="url(#blaze-flame)"
              animate={animated ? { d: [
                "M65 85 C60 55, 75 30, 95 15 C98 38, 108 30, 115 18 C125 35, 138 48, 135 85 Z",
                "M65 85 C58 50, 78 25, 93 10 C96 35, 112 28, 118 14 C128 32, 140 45, 135 85 Z",
                "M65 85 C60 55, 75 30, 95 15 C98 38, 108 30, 115 18 C125 35, 138 48, 135 85 Z"
              ] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Head / Body Core */}
            <circle cx="100" cy="105" r="46" fill="url(#blaze-core)" stroke="#fed7aa" strokeWidth="2.5" />

            {/* Obsidian Pauldrons / Armor Plate */}
            <path d="M56 120 L80 148 L100 135 L120 148 L144 120 L152 136 L100 168 L48 136 Z" fill="url(#blaze-armor)" stroke="#ea580c" strokeWidth="2" />

            {/* Expressive Fierce Warrior Eyes */}
            <polygon points="76,96 92,102 78,106" fill="#1c1917" />
            <polygon points="124,96 108,102 122,106" fill="#1c1917" />
            <circle cx="85" cy="101" r="3" fill="#ffffff" />
            <circle cx="115" cy="101" r="3" fill="#ffffff" />

            {/* Ember Markings */}
            <path d="M100 86 L100 96 M95 91 L105 91" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            <polygon points="100,118 95,125 105,125" fill="#fde047" />

            {/* Floating Sparks */}
            {animated && (
              <>
                <motion.circle cx="48" cy="65" r="3" fill="#fdba74"
                  animate={{ y: [-10, -25], opacity: [1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
                />
                <motion.circle cx="152" cy="55" r="3.5" fill="#fde047"
                  animate={{ y: [-8, -30], opacity: [1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.5 }}
                />
                <motion.circle cx="100" cy="30" r="2.5" fill="#ffedd5"
                  animate={{ y: [-5, -20], opacity: [1, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: 0.8 }}
                />
              </>
            )}
          </svg>
        );

      case 'frost':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            <defs>
              <radialGradient id="frost-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ecfeff" />
                <stop offset="45%" stopColor="#67e8f9" />
                <stop offset="80%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" />
              </radialGradient>
              <linearGradient id="frost-crystal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cffafe" />
                <stop offset="60%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>

            {/* Crystalline Halo / Snowflake Rune */}
            <motion.g
              animate={animated ? { rotate: 360 } : {}}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '100px 100px' }}
            >
              <circle cx="100" cy="100" r="68" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
              <polygon points="100,28 103,34 97,34" fill="#a5f3fc" />
              <polygon points="100,172 103,166 97,166" fill="#a5f3fc" />
              <polygon points="28,100 34,103 34,97" fill="#a5f3fc" />
              <polygon points="172,100 166,103 166,97" fill="#a5f3fc" />
            </motion.g>

            {/* Ice Mage Hood / Cowl */}
            <path
              d="M55 125 C50 70, 75 42, 100 35 C125 42, 150 70, 145 125 C135 155, 65 155, 55 125 Z"
              fill="url(#frost-crystal)"
              stroke="#e0f2fe"
              strokeWidth="2"
            />

            {/* Gentle Glowing Face */}
            <ellipse cx="100" cy="102" rx="34" ry="32" fill="#0c4a6e" />
            <circle cx="100" cy="102" r="28" fill="url(#frost-core)" opacity="0.95" />

            {/* Friendly Mage Eyes */}
            <ellipse cx="88" cy="98" rx="4.5" ry="6.5" fill="#082f49" />
            <ellipse cx="112" cy="98" rx="4.5" ry="6.5" fill="#082f49" />
            <circle cx="90" cy="96" r="2" fill="#ffffff" />
            <circle cx="114" cy="96" r="2" fill="#ffffff" />

            {/* Kind smile & frost blush */}
            <path d="M94 108 Q100 114 106 108" stroke="#082f49" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="82" cy="105" rx="4" ry="2" fill="#a5f3fc" opacity="0.8" />
            <ellipse cx="118" cy="105" rx="4" ry="2" fill="#a5f3fc" opacity="0.8" />

            {/* Ice Crystal Crown Jewel */}
            <polygon points="100,50 108,64 100,74 92,64" fill="#ecfeff" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="100" cy="64" r="2" fill="#0891b2" />

            {/* Floating Ice Shards */}
            {animated && (
              <>
                <motion.polygon points="45,80 50,70 54,82 48,88" fill="#e0f2fe"
                  animate={{ y: [-4, 4, -4], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.polygon points="152,78 158,68 162,80 156,86" fill="#e0f2fe"
                  animate={{ y: [4, -4, 4], rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </>
            )}
          </svg>
        );

      case 'volt':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
            <defs>
              <radialGradient id="volt-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fdf4ff" />
                <stop offset="45%" stopColor="#d946ef" />
                <stop offset="80%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#4c1d95" />
              </radialGradient>
              <linearGradient id="volt-plasma" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>

            {/* Lightning Sparks Background */}
            <motion.path
              d="M100 22 L112 55 L135 60 L118 78 L124 105 L100 90 L76 105 L82 78 L65 60 L88 55 Z"
              fill="url(#volt-plasma)"
              opacity="0.35"
              animate={animated ? { scale: [1, 1.15, 1], rotate: [0, 6, -6, 0] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            />

            {/* Storm Horns / Crest */}
            <path d="M60 70 L40 35 L70 55 L85 25 L95 62" fill="none" stroke="#f0abfc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M140 70 L160 35 L130 55 L115 25 L105 62" fill="none" stroke="#f0abfc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Core Face Sphere */}
            <circle cx="100" cy="105" r="44" fill="url(#volt-core)" stroke="#e879f9" strokeWidth="2.5" />

            {/* Electric Visor / Crackling Lightning Gaze */}
            <path d="M68 98 Q100 90 132 98 Q100 110 68 98 Z" fill="#2e1065" stroke="#f472b6" strokeWidth="2" />
            <motion.path
              d="M74 98 L88 95 L98 102 L112 94 L126 99"
              fill="none"
              stroke="#fdf4ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={animated ? { opacity: [0.7, 1, 0.4, 1] } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            />

            {/* Electric Rune Jaw */}
            <polygon points="100,122 92,135 108,135" fill="#fdf4ff" />

            {/* Crackling Arcs */}
            {animated && (
              <>
                <motion.path
                  d="M35 110 L50 115 L45 130"
                  stroke="#e879f9"
                  strokeWidth="2"
                  fill="none"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                />
                <motion.path
                  d="M165 110 L150 115 L155 130"
                  stroke="#c084fc"
                  strokeWidth="2"
                  fill="none"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                />
              </>
            )}
          </svg>
        );

      case 'elderByte':
      default:
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <defs>
              <radialGradient id="elder-gold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="85%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
              <linearGradient id="elder-void" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="50%" stopColor="#3b0764" />
                <stop offset="100%" stopColor="#090514" />
              </linearGradient>
            </defs>

            {/* Ancient Arcane Halo Ring */}
            <motion.circle
              cx="100"
              cy="98"
              r="76"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 8 16 8"
              animate={animated ? { rotate: -360 } : {}}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '100px 98px' }}
            />

            {/* Outer Sage Hood */}
            <path
              d="M48 140 C42 65, 70 30, 100 22 C130 30, 158 65, 152 140 C138 168, 62 168, 48 140 Z"
              fill="url(#elder-void)"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />

            {/* Golden Arcane Forehead Diadem */}
            <polygon points="100,42 118,60 100,70 82,60" fill="url(#elder-gold)" stroke="#fffbeb" strokeWidth="1" />
            <circle cx="100" cy="58" r="4" fill="#c084fc" />

            {/* Shadow Face with Mystical Glowing Eyes */}
            <ellipse cx="100" cy="108" rx="38" ry="34" fill="#030206" />

            {/* Glowing Golden Arcane Eyes */}
            <motion.ellipse
              cx="84"
              cy="104"
              rx="6"
              ry="4"
              fill="#fbbf24"
              animate={animated ? { scaleY: [1, 0.1, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }}
            />
            <motion.ellipse
              cx="116"
              cy="104"
              rx="6"
              ry="4"
              fill="#fbbf24"
              animate={animated ? { scaleY: [1, 0.1, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }}
            />
            <circle cx="84" cy="104" r="2" fill="#ffffff" />
            <circle cx="116" cy="104" r="2" fill="#ffffff" />

            {/* Ancient Mystic Beard Glyphs */}
            <path d="M100 120 L100 152 M90 134 L110 134 M85 146 L115 146" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="100,165 95,155 105,155" fill="#c084fc" />

            {/* Floating Celestial Runes */}
            {animated && (
              <>
                <motion.text
                  x="28"
                  y="70"
                  fill="#fbbf24"
                  fontSize="14"
                  fontFamily="Cinzel"
                  animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ᚱ
                </motion.text>
                <motion.text
                  x="160"
                  y="70"
                  fill="#fbbf24"
                  fontSize="14"
                  fontFamily="Cinzel"
                  animate={{ y: [-4, 4, -4], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3.4, repeat: Infinity }}
                >
                  ᛟ
                </motion.text>
              </>
            )}
          </svg>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${dim} ${className}`}>
      {renderIllustration()}
    </div>
  );
}

