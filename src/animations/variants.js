// Framer Motion Animation Variants for AAA RPG aesthetic

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  },
  exit: { opacity: 0, transition: { duration: 0.4 } }
};

export const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const dungeonGateVariants = {
  closed: {
    leftDoor: { x: 0 },
    rightDoor: { x: 0 },
  },
  open: {
    leftDoor: { 
      x: '-92%', 
      transition: { duration: 2.8, ease: [0.65, 0, 0.35, 1] } 
    },
    rightDoor: { 
      x: '92%', 
      transition: { duration: 2.8, ease: [0.65, 0, 0.35, 1] } 
    },
  }
};

export const magicGlowPulse = {
  initial: { filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' },
  animate: {
    filter: [
      'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))',
      'drop-shadow(0 0 25px rgba(192, 132, 252, 0.8))',
      'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))'
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const characterEntrance = {
  hidden: { opacity: 0, scale: 0.7, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.25,
      duration: 0.8,
      ease: [0.175, 0.885, 0.32, 1.275]
    }
  })
};

export const runeHover = {
  rest: { scale: 1, filter: 'brightness(1)' },
  hover: { 
    scale: 1.05, 
    filter: 'brightness(1.25) drop-shadow(0 0 15px rgba(251, 191, 36, 0.6))',
    transition: { duration: 0.25 }
  },
  tap: { scale: 0.96 }
};

