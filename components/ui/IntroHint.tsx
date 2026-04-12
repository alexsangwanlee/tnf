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
    </div>
  )
}
