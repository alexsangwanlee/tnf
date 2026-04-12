'use client'

import { useGameStore } from '@/store/useGameStore'

export default function IntroHint() {
  const gameState = useGameStore((s) => s.gameState)

  if (gameState !== 'INTRO') return null

  return (
    <div
      className="hint-text fixed bottom-10 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.65rem',
          letterSpacing: '5px',
          color: 'rgba(0,0,0,0.35)',
        }}
      >
        CLICK THE LOCK TO ENTER
      </p>
      {/* Subtle animated chevron */}
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        style={{ animation: 'bounce 1.6s ease-in-out infinite', opacity: 0.3 }}
      >
        <path d="M1 1L6 6L11 1" stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  )
}
