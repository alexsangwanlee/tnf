'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import * as THREE from 'three'
import { useGameStore } from '@/store/useGameStore'

interface PadlockModelProps {
  position: [number, number, number]
}

export default function PadlockModel({ position }: PadlockModelProps) {
  const gameState = useGameStore((s) => s.gameState)
  const openKeypad = useGameStore((s) => s.openKeypad)
  const [hovered, setHovered] = useState(false)

  const shackleRef = useRef<THREE.Group>(null!)
  const shackleAngle = useRef(0)
  const targetShackleAngle = useRef(0)
  const bodyRef = useRef<THREE.Mesh>(null!)

  const isUnlocked = gameState === 'UNLOCKING' || gameState === 'OPENED'
  const isInteractive = gameState === 'INTRO'

  // Shackle opens when unlocking
  if (isUnlocked && targetShackleAngle.current === 0) {
    targetShackleAngle.current = Math.PI * 0.6
  }
  if (!isUnlocked) {
    targetShackleAngle.current = 0
  }

  useFrame((_, delta) => {
    if (shackleRef.current) {
      shackleAngle.current = MathUtils.lerp(
        shackleAngle.current,
        targetShackleAngle.current,
        delta * 3
      )
      shackleRef.current.rotation.z = shackleAngle.current
    }
    // Hover glow: scale body slightly
    if (bodyRef.current && isInteractive) {
      const target = hovered ? 1.08 : 1.0
      bodyRef.current.scale.setScalar(
        MathUtils.lerp(bodyRef.current.scale.x, target, delta * 8)
      )
    }
  })

  const bodyColor = isUnlocked ? '#c8a96e' : hovered ? '#b8a080' : '#8a7a68'
  const metalness = 0.7
  const roughness = 0.3

  return (
    <group position={position}>
      {/* Lock body */}
      <mesh
        ref={bodyRef}
        onPointerEnter={(e) => {
          if (!isInteractive) return
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerLeave={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          if (!isInteractive) return
          e.stopPropagation()
          openKeypad()
        }}
        castShadow
      >
        <boxGeometry args={[0.18, 0.15, 0.1]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>

      {/* Shackle (U-shaped arch) — pivot at center of body top */}
      <group ref={shackleRef} position={[0, 0.075, 0]}>
        {/* Left arm */}
        <mesh position={[-0.05, 0.065, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.13, 12]} />
          <meshStandardMaterial color={bodyColor} metalness={metalness} roughness={roughness} />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.05, 0.065, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.13, 12]} />
          <meshStandardMaterial color={bodyColor} metalness={metalness} roughness={roughness} />
        </mesh>
        {/* Top arch */}
        <mesh position={[0, 0.13, 0]} castShadow>
          <torusGeometry args={[0.05, 0.018, 12, 24, Math.PI]} />
          <meshStandardMaterial color={bodyColor} metalness={metalness} roughness={roughness} />
        </mesh>
      </group>

      {/* Keyhole dot */}
      <mesh position={[0, -0.01, 0.051]}>
        <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
        <meshStandardMaterial color="#2a2015" roughness={0.9} />
      </mesh>

      {/* Click hint: subtle glow ring when hoverable */}
      {isInteractive && hovered && (
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshStandardMaterial
            color="#d4b896"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
