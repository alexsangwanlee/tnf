'use client'

import { useEffect } from 'react'
import { PRELOAD_IMAGE_ASSETS } from '@/lib/assetPreload'
import { useGameStore } from '@/store/useGameStore'

export default function Loading() {
  const isLoaded = useGameStore((s) => s.isLoaded)

  useEffect(() => {
    PRELOAD_IMAGE_ASSETS.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: '#FCFCFC',
        opacity: isLoaded ? 0 : 1,
        pointerEvents: isLoaded ? 'none' : 'auto',
        transition: 'opacity 1s ease 0.3s',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.7rem',
          letterSpacing: '6px',
          color: '#888',
          animation: 'pulse 1.8s ease-in-out infinite',
        }}
      >
        LOADING
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
