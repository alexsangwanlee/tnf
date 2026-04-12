'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import DiaryModel from './DiaryModel'
import { useGameStore } from '@/store/useGameStore'

export default function Scene() {
  const gameState = useGameStore((s) => s.gameState)

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      shadows
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      {/* Ambient base — soft */}
      <ambientLight intensity={0.35} />

      {/* Key light — center front, slightly above */}
      <directionalLight
        position={[0, 2, 6]}
        intensity={0.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Soft fill — left */}
      <directionalLight position={[-3, 1, 3]} intensity={0.2} color="#dce8f5" />

      {/* Soft fill — right */}
      <directionalLight position={[3, 1, 3]} intensity={0.2} color="#dce8f5" />

      <Suspense fallback={null}>
        <DiaryModel />
        <Environment preset="warehouse" />
      </Suspense>

      {/* Allow gentle orbit in INTRO, lock in other states */}
      {gameState === 'INTRO' && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 5}
          maxAzimuthAngle={Math.PI / 5}
          dampingFactor={0.05}
          enableDamping
        />
      )}
    </Canvas>
  )
}
